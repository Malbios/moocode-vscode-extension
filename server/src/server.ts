import {
	createConnection,
	InitializeParams,
	DidChangeConfigurationNotification,
	InitializeResult,
	ProposedFeatures,
	_,
	_Connection,
} from 'vscode-languageserver/node';

import { SettingsHandler } from './handlers/settings';
import { DocumentsHandler } from './handlers/documents';
import { DiagnosticsHandler } from './handlers/diagnostics';
import { CompletionHandler } from './handlers/completion';
import { SignatureHelpHandler } from './handlers/signatureHelp';
import { HoverHandler } from './handlers/hover';
import { SemanticsHandler } from './handlers/semantics';
import { DefinitionsHandler } from './handlers/definitions';
import { ReferencesHandler } from './handlers/references';

import MooClient from 'moo-client-ts';
import { InlineCompletionFeatureShape } from 'vscode-languageserver/lib/common/inlineCompletion.proposed';

export default class MoocodeServer {
	private connection: _Connection<_, _, _, _, _, _, InlineCompletionFeatureShape, _>;
	private documentHandler: DocumentsHandler;

	private constructor(connection: _Connection<_, _, _, _, _, _, InlineCompletionFeatureShape, _>, documentHandler: DocumentsHandler) {
		this.connection = connection;
		this.documentHandler = documentHandler;
	}

	public static create(connection?: _Connection<_, _, _, _, _, _, InlineCompletionFeatureShape, _>, documentsHandler?: DocumentsHandler) {
		if (connection && documentsHandler) {
			return new MoocodeServer(connection, documentsHandler);
		}

		connection = createConnection(ProposedFeatures.all);

		documentsHandler = new DocumentsHandler();

		// TODO: get credential from config
		const mooClient = MooClient.create('127.0.0.1', 7777, 'ServiceAccount', 'osywU');

		const settingsHandler = new SettingsHandler(x => connection.workspace.getConfiguration(x));

		const diagnosticsHandler = new DiagnosticsHandler(settingsHandler, documentsHandler);
		const completionHandler = new CompletionHandler(documentsHandler, mooClient);
		const signatureHelpHandler = new SignatureHelpHandler(documentsHandler);
		const hoverHandler = new HoverHandler(documentsHandler);
		const semanticsHandler = new SemanticsHandler(documentsHandler);
		const definitionsHandler = new DefinitionsHandler(documentsHandler);
		const referencesHandler = new ReferencesHandler(documentsHandler);

		documentsHandler.initializeOnDidClose(x => settingsHandler.delete(x.document.uri));
		documentsHandler.initializeOnDidChangeContent(x => diagnosticsHandler.validateTextDocument(x.document));

		connection.onInitialize((params: InitializeParams): InitializeResult => {
			console.log(params.capabilities);
			return {
				capabilities: {
					textDocumentSync: documentsHandler.getTextDocumentSyncKind(),
					hoverProvider: hoverHandler.getConfiguration(),
					signatureHelpProvider: signatureHelpHandler.getConfiguration(),
					completionProvider: completionHandler.getConfiguration(),
					diagnosticProvider: diagnosticsHandler.getConfiguration(),
					semanticTokensProvider: semanticsHandler.getConfiguration(),
					definitionProvider: true,
					referencesProvider: true,
					workspace: {
						fileOperations: {},
						workspaceFolders: {
							supported: true,
							changeNotifications: false
						}
					}
				}
			};
		});

		connection.onInitialized(() => {
			connection.client.register(DidChangeConfigurationNotification.type, undefined);

			connection.workspace.onDidChangeWorkspaceFolders(() => {
				throw Error('workspace folder change not yet supported');
			});
		});

		connection.onDidChangeConfiguration(() => {
			settingsHandler.clear();
			connection.languages.diagnostics.refresh();
		});

		connection.languages.diagnostics.on(x => diagnosticsHandler.handleDiagnostics(x));

		connection.onCompletion(x => completionHandler.onCompletion(x));
		connection.onCompletionResolve(x => completionHandler.onCompletionResolve(x));

		connection.onSignatureHelp(x => signatureHelpHandler.onSignatureHelp(x));

		connection.onHover(x => hoverHandler.onHover(x));

		connection.onRequest('textDocument/semanticTokens/full', params => {
			return semanticsHandler.getSemanticTokensFull(params);
		});

		connection.onRequest('textDocument/semanticTokens/range', params => {
			return semanticsHandler.getSemanticTokensRange(params);
		});

		connection.onDefinition(x => definitionsHandler.onDefinition(x));
		connection.onTypeDefinition(x => definitionsHandler.onTypeDefinition(x));

		connection.onReferences(x => referencesHandler.onReferences(x));

		connection.onDidChangeWatchedFiles(() => {
			throw Error('file change not yet supported');
		});

		return new MoocodeServer(connection, documentsHandler);
	}

	public listen() {
		this.documentHandler.listen(this.connection);
		this.connection.listen();
	}
}