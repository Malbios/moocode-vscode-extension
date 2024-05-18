import {
	CompletionItem,
	CompletionItemKind,
	CompletionList,
	CompletionOptions,
	TextDocumentPositionParams
} from 'vscode-languageserver/node';

import { DocumentsHandler } from './documents';
import MooClient from 'moo-client-ts';

interface CompletionItemData {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	label: string;
	kind: CompletionItemKind;
	detail: string;
	documentation: string;
}

function getDefaultItems(): CompletionItemData[] {
	return [
		{
			data: 1, label: 'TypeScript', kind: CompletionItemKind.Text,
			detail: 'TypeScript details', documentation: 'TypeScript documentation'
		},
		{
			data: 2, label: 'JavaScript', kind: CompletionItemKind.Text,
			detail: 'JavaScript details', documentation: 'JavaScript documentation'
		}
	];
}

export class CompletionHandler {
	private documentsHandler: DocumentsHandler;
	private mooClient: MooClient;

	private items = getDefaultItems();

	public constructor(documentsHandler: DocumentsHandler, mooClient: MooClient) {
		this.documentsHandler = documentsHandler;
		this.mooClient = mooClient;
	}

	public getConfiguration(): CompletionOptions {
		return {
			resolveProvider: true,
			triggerCharacters: ['.', ':']
		};
	}

	public onCompletion(params: TextDocumentPositionParams): CompletionList | CompletionItem[] | null {
		const document = this.documentsHandler.get(params.textDocument.uri);
		if (!document) {
			return null;
		}

		return this.items;
	}

	public onCompletionResolve(item: CompletionItem): CompletionItem {
		const data = this.items.find(x => x.data === item.data);
		if (!data) {
			throw Error(`Could not find completion item data for '${item.data}'`);
		}

		item.detail = data.detail;
		item.documentation = data.documentation;

		return item;
	}
}
