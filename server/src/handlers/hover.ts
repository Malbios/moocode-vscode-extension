import {
	Hover,
	HoverOptions,
	HoverParams
} from 'vscode-languageserver/node';
import { AstCache } from '../common/ast-cache';
import { DocumentsHandler } from './documents';

export class HoverHandler {
	private _documentsHandler: DocumentsHandler;
	private _astCache: AstCache;

	public constructor(documents: DocumentsHandler, astCache: AstCache) {
		this._documentsHandler = documents;
		this._astCache = astCache;
	}

	public getConfiguration(): HoverOptions {
		return { workDoneProgress: false };
	}

	public onHover(params: HoverParams): Hover | null {
		const position = params.position;
		const document = this._documentsHandler.get(params.textDocument.uri);

		if (!document) {
			return null;
		}

		const ast = this._astCache.generateAst(document.getText());

		const nodes = ast.valid.filter(x => (x.position.startToken?.line ?? 0) <= (position.line + 1) && (x.position.startToken?.column ?? 0) <= position.character && (x.position.stopToken?.line ?? 0) >= (position.line + 1) && (x.position.stopToken?.column ?? 0) >= position.character);

		const closestNode = nodes.at(nodes.length - 1);

		if (!closestNode) {
			return null;
		}

		// TODO: does not work in if statement (probably neither in the other complex statements)
		// TODO: find closest element in closest node (nodevisitor?) and return relevant info

		return {
			contents: { kind: 'markdown', value: `**${closestNode.toString(false)}**\\\n\\<useful info here\\>` }
		};
	}
}