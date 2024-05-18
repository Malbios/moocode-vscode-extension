import {
	Hover,
	HoverOptions,
	HoverParams
} from 'vscode-languageserver/node';

import { DocumentsHandler } from './documents';

export class HoverHandler {
	private documentsHandler: DocumentsHandler;

	public constructor(documents: DocumentsHandler) {
		this.documentsHandler = documents;
	}
	
	public getConfiguration(): HoverOptions {
		return { workDoneProgress: false };
	}

	public onHover(params: HoverParams): Hover | null {
		const document = this.documentsHandler.get(params.textDocument.uri);
		const position = params.position;
	
		// TODO: Implement hover information logic here and return relevant details

		return null;
	}

	private getEmptyHover(): Hover {
		return { contents: '' };
	}

	private getTestHover(): Hover {
		return {
			contents: { kind: 'markdown', value: '**hover**\ntest' }
		};
	}
}