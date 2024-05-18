import {
	Definition,
	DefinitionParams,
	Location,
	LocationLink,
	TypeDefinitionParams
} from 'vscode-languageserver/node';

import { DocumentsHandler } from './documents';

export class DefinitionsHandler {
	private documentsHandler: DocumentsHandler;

	public constructor(documents: DocumentsHandler) {
		this.documentsHandler = documents;
	}

	public onDefinition(params: DefinitionParams): Definition | LocationLink[] | null {
		const document = this.documentsHandler.get(params.textDocument.uri);
		const position = params.position;

		// TODO: implement defintion logic

		return null;
	}

	public onTypeDefinition(params: TypeDefinitionParams): Definition | LocationLink[] | null {
		const document = this.documentsHandler.get(params.textDocument.uri);
		const position = params.position;

		// TODO: implement type defintion logic

		return null;
	}
}