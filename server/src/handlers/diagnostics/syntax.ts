import { Ast } from 'moocode-parsing/lib/interfaces';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';
import { DiagnosticsInput, IssueFinder } from '../../common/interfaces';

export class SyntaxIssueFinder implements IssueFinder {
	find(input: DiagnosticsInput): Diagnostic[] {
		if (input.maxIssues < 1) {
			return [];
		}

		const text = input.document.getText();

		let ast: Ast | undefined = undefined;

		try {
			ast = input.astCache.generateAst(text);
		} catch (error: unknown) {
			console.log(error);
			return [];
		}

		let foundErrors = ast.lexerErrors.concat(ast.parserErrors);
		let invalidStatements = ast.invalid;

		if (foundErrors.length === 0 && invalidStatements.length === 0) {
			return [];
		}

		const diagnostics: Diagnostic[] = [];

		while (foundErrors.length > 0 && diagnostics.length < input.maxIssues) {
			const syntaxError = foundErrors[0];
			foundErrors = foundErrors.slice(1);

			const range = {
				start: { line: syntaxError.line - 1, character: syntaxError.column },
				end: { line: syntaxError.line - 1, character: syntaxError.column }
			};

			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Error,
				range: range,
				message: syntaxError.message ?? '<no msg>',
				source: 'MOOcode syntax diagnostics',
				relatedInformation: [
					{
						location: {
							uri: input.document.uri,
							range: Object.assign({}, range)
						},
						message: 'check for incorrect syntax'
					}
				]
			};

			diagnostics.push(diagnostic);
		}

		while (invalidStatements.length > 0 && diagnostics.length < input.maxIssues) {
			const invalidStatement = invalidStatements[0];
			invalidStatements = invalidStatements.slice(1);

			if (invalidStatement.error === undefined) {
				continue;
			}

			const range = {
				start: { line: (invalidStatement.position.startToken?.line ?? 0) - 1, character: invalidStatement.position.startToken?.column ?? -1 },
				end: { line: (invalidStatement.position.stopToken?.line ?? 0) - 1, character: invalidStatement.position.stopToken?.column ?? -1 }
			};

			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Error,
				range: range,
				message: invalidStatement.error.message ?? '<no msg>',
				source: 'MOOcode syntax diagnostics',
				relatedInformation: [
					{
						location: {
							uri: input.document.uri,
							range: Object.assign({}, range)
						},
						message: 'idk what to write here'
					}
				]
			};

			diagnostics.push(diagnostic);
		}

		return diagnostics;
	}
}