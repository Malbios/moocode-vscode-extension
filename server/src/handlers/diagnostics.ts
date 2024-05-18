import {
	Diagnostic,
	DiagnosticOptions,
	DocumentDiagnosticParams,
	DocumentDiagnosticReport,
	DocumentDiagnosticReportKind
} from 'vscode-languageserver';

import { TextDocument } from 'vscode-languageserver-textdocument';

import { SettingsHandler } from './settings';
import { IssueFinder } from '../common/interfaces';
import { TestIssueFinder } from './diagnostics/testIssue';
import { DocumentsHandler } from './documents';

export class DiagnosticsHandler {
	private settingsHandler: SettingsHandler;
	private documentsHandler: DocumentsHandler;

	// TODO: implement real issue finders
	private issueFinders: IssueFinder[] = [new TestIssueFinder];

	public constructor(settingsHandler: SettingsHandler, documentsHandler: DocumentsHandler) {
		this.settingsHandler = settingsHandler;
		this.documentsHandler = documentsHandler;
	}

	public getConfiguration(): DiagnosticOptions {
		return {
			interFileDependencies: false,
			workspaceDiagnostics: false
		};
	}

	public async handleDiagnostics(params: DocumentDiagnosticParams): Promise<DocumentDiagnosticReport> {
		const document = this.documentsHandler.get(params.textDocument.uri);
		if (document !== undefined) {
			return {
				kind: DocumentDiagnosticReportKind.Full,
				items: await this.validateTextDocument(document)
			} satisfies DocumentDiagnosticReport;
		} else {
			return {
				kind: DocumentDiagnosticReportKind.Full,
				items: []
			} satisfies DocumentDiagnosticReport;
		}
	}

	public async validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]> {
		const settings = await this.settingsHandler.getSettings(textDocument.uri);

		const diagnostics: Diagnostic[] = [];
		let problems = 0;

		for (const issueFinder of this.issueFinders) {
			const foundIssues = issueFinder.find(
				{ maxIssues: settings.maxNumberOfProblems - problems, document: textDocument }
			);

			diagnostics.concat(foundIssues);
			problems += foundIssues.length;

			if (problems >= settings.maxNumberOfProblems) {
				break;
			}
		}

		return diagnostics;
	}
}