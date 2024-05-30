import { generateAst } from 'moocode-parsing';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';
import { DiagnosticsInput, IssueFinder } from '../../common/interfaces';

export class SyntaxIssueFinder implements IssueFinder {
	find(input: DiagnosticsInput): Diagnostic[] {
		if (input.maxIssues < 1) {
			return [];
		}

		const text = input.document.getText();
		const ast = generateAst(text);

		let foundErrors = ast.lexerErrors.concat(ast.parserErrors);

		if (foundErrors.length === 0) {
			return [];
		}

		const diagnostics: Diagnostic[] = [];

		while (foundErrors.length > 0 && diagnostics.length < input.maxIssues) {
			const syntaxError = foundErrors[0];
			foundErrors = foundErrors.slice(1);

			syntaxError.line;

			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Error,
				range: {
					start: { line: syntaxError.line, character: syntaxError.column },
					end: { line: syntaxError.line, character: syntaxError.column }
				},
				message: syntaxError.message,
				source: 'MOOcode syntax diagnostics'
			};

			diagnostic.relatedInformation = [
				{
					location: {
						uri: input.document.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'idk what to write here'
				}
			];

			diagnostics.push(diagnostic);
		}

		return diagnostics;
	}
}