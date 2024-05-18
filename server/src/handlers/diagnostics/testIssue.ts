import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';

import { DiagnosticsInput, IssueFinder } from '../../common/interfaces';

export class TestIssueFinder implements IssueFinder {
	find(input: DiagnosticsInput): Diagnostic[] {
		if (input.maxIssues < 1) {
			return [];
		}

		const text = input.document.getText();

		const diagnostics: Diagnostic[] = [];

		const pattern = /\b[A-Z]{2,}\b/g;
		let match: RegExpExecArray | null;
		let problems = 0;

		while ((match = pattern.exec(text)) && problems < input.maxIssues) {
			problems++;

			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Warning,
				range: {
					start: input.document.positionAt(match.index),
					end: input.document.positionAt(match.index + match[0].length)
				},
				message: `${match[0]} is all uppercase.`,
				source: 'MOOcode diagnostics'
			};

			diagnostic.relatedInformation = [
				{
					location: {
						uri: input.document.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Spelling matters'
				}
			];

			diagnostics.push(diagnostic);
		}

		return diagnostics;
	}
}