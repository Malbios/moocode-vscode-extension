import {
	Diagnostic,
	TextDocumentChangeEvent,
	TextDocumentSyncKind,
	TextDocuments
} from 'vscode-languageserver';

import { TextDocument } from 'vscode-languageserver-textdocument';

export class DocumentsHandler {
	private documents = new TextDocuments<TextDocument>(TextDocument);

	public getTextDocumentSyncKind(): TextDocumentSyncKind {
		return TextDocumentSyncKind.Incremental;
	}

	public initializeOnDidClose(x: {
		(x: { document: { uri: string; }; }): void;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(e: TextDocumentChangeEvent<TextDocument>): any;
	}) {
		this.documents.onDidClose(x);
	}

	public initializeOnDidChangeContent(x: {
		(x: { document: TextDocument; }): Promise<Diagnostic[]>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(e: TextDocumentChangeEvent<TextDocument>): any;
	}) {
		this.documents.onDidChangeContent(x);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public listen(connection: any) {
		this.documents.listen(connection);
	}

	public get(uri: string): TextDocument | undefined {
		return this.documents.get(uri);
	}
}