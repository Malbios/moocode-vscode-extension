import { suite, test } from 'mocha';
import { MooClient as IMooClient } from 'moo-client-ts/lib/interfaces';
import { mock as createMock, instance } from 'ts-mockito';
import { _, _Connection } from 'vscode-languageserver';
import { InlineCompletionFeatureShape } from 'vscode-languageserver/lib/common/inlineCompletion.proposed';
import { DocumentsHandler } from '../src/handlers/documents';
import MOOcodeServer from '../src/server';

suite('language server tests', () => {
    test('should be created with no errors', async () => {
        const mockedMooClient = createMock<IMooClient>();
        const mockedMooClientInstance = instance(mockedMooClient);

        const mockedConnection = createMock<_Connection<_, _, _, _, _, _, InlineCompletionFeatureShape, _>>();
        const mockedConnectionInstance = instance(mockedConnection);

        const mockedDocumentsHandler = createMock<DocumentsHandler>();
        const mockedDocumentsHandlerInstance = instance(mockedDocumentsHandler);

        MOOcodeServer.create(mockedMooClientInstance, mockedConnectionInstance, mockedDocumentsHandlerInstance);
    });
});