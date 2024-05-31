import {
	Diagnostic,
	DiagnosticOptions,
	DocumentDiagnosticParams,
	DocumentDiagnosticReport,
	DocumentDiagnosticReportKind,
	FullDocumentDiagnosticReport
} from 'vscode-languageserver';

import { TextDocument } from 'vscode-languageserver-textdocument';

import { AstCache } from '../common/ast-cache';
import { IssueFinder } from '../common/interfaces';
import { SyntaxIssueFinder } from './diagnostics/syntax';
import { DocumentsHandler } from './documents';

const emptyDiagnosticResult: FullDocumentDiagnosticReport = {
	kind: DocumentDiagnosticReportKind.Full,
	items: []
};

export class DiagnosticsHandler {
	private _documentsHandler: DocumentsHandler;
	private _astCache: AstCache;

	private _issueFinders: IssueFinder[] = [new SyntaxIssueFinder];

	public constructor(documentsHandler: DocumentsHandler, astCache: AstCache) {
		this._documentsHandler = documentsHandler;
		this._astCache = astCache;
	}

	public getConfiguration(): DiagnosticOptions {
		return {
			interFileDependencies: false,
			workspaceDiagnostics: false,
		};
	}

	public handleDiagnostics(params: DocumentDiagnosticParams, maxNumberOfProblems: number): DocumentDiagnosticReport {
		const document = this._documentsHandler.get(params.textDocument.uri);

		if (!document) {
			return emptyDiagnosticResult;
		}

		const diagnostics = this.validateTextDocument(document, maxNumberOfProblems);

		//void connection.sendNotification(StatusNotification.type, { uri: document.uri, state: Status.ok, validationTime: timeTaken });

		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: diagnostics
		};

	}

	public validateTextDocument(textDocument: TextDocument, maxNumberOfProblems: number): Diagnostic[] {
		let diagnostics: Diagnostic[] = [];

		for (const issueFinder of this._issueFinders) {
			const foundIssues = issueFinder.find(
				{ maxIssues: maxNumberOfProblems - diagnostics.length, document: textDocument, astCache: this._astCache }
			);

			diagnostics = diagnostics.concat(foundIssues);

			if (diagnostics.length >= maxNumberOfProblems) {
				break;
			}
		}

		return diagnostics;
	}
}