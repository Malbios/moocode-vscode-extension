import {
	Location,
	ReferenceParams
} from 'vscode-languageserver/node';

import { DocumentsHandler } from './documents';

export class ReferencesHandler {
	private documentsHandler: DocumentsHandler;

	public constructor(documents: DocumentsHandler) {
		this.documentsHandler = documents;
	}

	public onReferences(params: ReferenceParams): Location[] | null {
		const context = params.context;
		const document = this.documentsHandler.get(params.textDocument.uri);
		const position = params.position;

		// TODO: implement references logic

		return null;
	}
}