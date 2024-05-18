import 'mocha';
import { mock as createMock, instance } from 'ts-mockito';

import { _, _Connection } from 'vscode-languageserver';
import { InlineCompletionFeatureShape } from 'vscode-languageserver/lib/common/inlineCompletion.proposed';

import MOOcodeServer from '../src/server';
import { DocumentsHandler } from '../src/handlers/documents';

describe('language server tests', () => {
    it('should be created with no errors', async () => {
        const mockedConnection = createMock<_Connection<_, _, _, _, _, _, InlineCompletionFeatureShape, _>>();
        const mockedConnectionInstance = instance(mockedConnection);

        const mockedDocumentsHandler = createMock<DocumentsHandler>();
        const mockedDocumentsHandlerInstance = instance(mockedDocumentsHandler);

        MOOcodeServer.create(mockedConnectionInstance, mockedDocumentsHandlerInstance);
    });
});