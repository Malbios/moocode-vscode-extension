import {
	ParameterInformation,
	SignatureHelp,
	SignatureHelpOptions,
	SignatureHelpParams,
	SignatureInformation
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
			triggerCharacters: ['('],
		};
	}

	public onSignatureHelp(params: SignatureHelpParams): SignatureHelp | null {
		const document = this.documentsHandler.get(params.textDocument.uri);
		const position = params.position;

		// TODO: Implement signature help logic

		console.log('SignatureHelpParams:');
		console.log(params);

		return this.getSampleSignatureHelp();
	}

	private getSampleSignatureHelp(): SignatureHelp {
		return {
			signatures: [this.getSampleSignature()],
			activeSignature: 0,
			activeParameter: 0
		};
	}

	private getSampleParameter(): ParameterInformation {
		return {
			label: 'sample-param',
			documentation: 'some text about sample param'
		};
	}

	private getSampleSignature(): SignatureInformation {
		return {
			label: 'sample-label',
			documentation: 'sample documentation',
			parameters: [this.getSampleParameter()],
			activeParameter: 0
		};
	}
}