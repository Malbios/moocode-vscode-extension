import * as path from 'path';

import {
    ExtensionContext,
    workspace
} from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
    const serverModule = context.asAbsolutePath(
        path.join('server', 'out', 'index')
    );

    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'moocode' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
        },
        outputChannelName: 'MOOcode Language Server'
    };

    client = new LanguageClient(
        'moocode',
        'MOOcode',
        serverOptions,
        clientOptions
    );

    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }

    return client.stop();
}