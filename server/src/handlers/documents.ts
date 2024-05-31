import {
	TextDocumentChangeEvent,
	TextDocumentSyncKind,
	TextDocuments,
	_,
	_Connection
} from 'vscode-languageserver';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { InlineCompletionFeatureShape } from 'vscode-languageserver/lib/common/inlineCompletion.proposed';

export class DocumentsHandler {
	private documents = new TextDocuments<TextDocument>(TextDocument);

	public getTextDocumentSyncKind(): TextDocumentSyncKind {
		return TextDocumentSyncKind.Incremental;
	}

	public initializeOnDidClose(x: (eventArguments: TextDocumentChangeEvent<TextDocument>) => void) {
		this.documents.onDidClose(x);
	}

	public initializeOnDidChangeContent(x: (eventArguments: TextDocumentChangeEvent<TextDocument>) => void) {
		this.documents.onDidChangeContent(x);
	}

	public listen(connection: _Connection<_, _, _, _, _, _, InlineCompletionFeatureShape, _>) {
		this.documents.listen(connection);
	}

	public get(uri: string): TextDocument | undefined {
		return this.documents.get(uri);
	}
}