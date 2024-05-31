import { MooClient } from 'moo-client-ts';
import { MooClient as IMooClient } from 'moo-client-ts/lib/interfaces';
import { InlineCompletionFeatureShape } from 'vscode-languageserver/lib/common/inlineCompletion.proposed';
import {
	DidChangeConfigurationNotification,
	InitializeParams,
	InitializeResult,
	ProposedFeatures,
	_,
	_Connection,
	createConnection,
} from 'vscode-languageserver/node';
import { AstCache } from './common/ast-cache';
import { CompletionHandler } from './handlers/completions';
import { DefinitionsHandler } from './handlers/definitions';
import { DiagnosticsHandler } from './handlers/diagnostics';
import { DocumentsHandler } from './handlers/documents';
import { HoverHandler } from './handlers/hover';
import { ReferencesHandler } from './handlers/references';
import { SemanticsHandler } from './handlers/semantics';
import { SettingsHandler } from './handlers/settings';
import { SignatureHelpHandler } from './handlers/signatures';

export default class MoocodeServer {
	private connection: _Connection<_, _, _, _, _, _, InlineCompletionFeatureShape, _>;
	private documentHandler: DocumentsHandler;
	private _astCache: AstCache;

	public get AstCache() {
		return this._astCache;
	}

	private constructor(connection: _Connection<_, _, _, _, _, _, InlineCompletionFeatureShape, _>, documentHandler: DocumentsHandler, astCache: AstCache) {
		this.connection = connection;
		this.documentHandler = documentHandler;
		this._astCache = astCache;
	}

	public static create(mooClient?: IMooClient, connection?: _Connection<_, _, _, _, _, _, InlineCompletionFeatureShape, _>, documentsHandler?: DocumentsHandler, astCache?: AstCache) {
		if (!mooClient) {
			// TODO: get credential from config
			mooClient = MooClient.create('87.106.230.58', 7777, 'ServiceAccount', 'osywU');
		}

		if (!connection) {
			connection = createConnection(ProposedFeatures.all);
		}

		if (!documentsHandler) {
			documentsHandler = new DocumentsHandler();
		}

		if (!astCache) {
			astCache = new AstCache();
		}

		const settingsHandler = new SettingsHandler(x => connection.workspace.getConfiguration(x));

		const diagnosticsHandler = new DiagnosticsHandler(documentsHandler, astCache);
		const completionHandler = new CompletionHandler(documentsHandler, mooClient);
		const signatureHelpHandler = new SignatureHelpHandler(documentsHandler);
		const hoverHandler = new HoverHandler(documentsHandler, astCache);
		const semanticsHandler = new SemanticsHandler(documentsHandler);
		const definitionsHandler = new DefinitionsHandler(documentsHandler);
		const referencesHandler = new ReferencesHandler(documentsHandler);

		documentsHandler.initializeOnDidClose(x => settingsHandler.delete(x.document.uri));

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

		connection.languages.diagnostics.on(async documentDiagnosticParams => {
			return diagnosticsHandler.handleDiagnostics(documentDiagnosticParams, (await settingsHandler.getSettings(documentDiagnosticParams.textDocument.uri)).maxNumberOfProblems);
		});

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

		return new MoocodeServer(connection, documentsHandler, astCache);;
	}

	public listen() {
		this.documentHandler.listen(this.connection);
		this.connection.listen();
	}
}