import {
	SignatureHelp,
	SignatureHelpOptions,
	SignatureHelpParams
} from 'vscode-languageserver/node';

import { DocumentsHandler } from './documents';

export class SignatureHelpHandler {
	private documentsHandler: DocumentsHandler;

	public constructor(documents: DocumentsHandler) {
		this.documentsHandler = documents;
	}

	public getConfiguration(): SignatureHelpOptions {
		return {
			retriggerCharacters: [],
			triggerCharacters: [':'],
		};
	}

	public onSignatureHelp(params: SignatureHelpParams): SignatureHelp | null {
		const document = this.documentsHandler.get(params.textDocument.uri);
		const position = params.position;
	
		// TODO: Implement signature help logic
	
		return null;
	}

	private getEmptySignature(): SignatureHelp {
		return { signatures: [] };
	}

	private getTestSignature(): SignatureHelp {
		return { signatures: [{ label: 'Hello World Signature' }], activeSignature: 0, activeParameter: 0 };
	}
}