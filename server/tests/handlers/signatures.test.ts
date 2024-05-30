import { fail } from 'assert';
import { expect } from 'chai';
import { suite, test } from 'mocha';
import { mock as createMock, instance, when } from 'ts-mockito';
import { SignatureHelpTriggerKind } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentsHandler } from '../../src/handlers/documents';
import { SignatureHelpHandler } from './../../src/handlers/signatures';

suite('signature help tests', () => {
	test('should be created with no errors', () => {
		const mockedDocumentsHandler = createMock<DocumentsHandler>();
		const mockedDocumentsHandlerInstance = instance(mockedDocumentsHandler);

		new SignatureHelpHandler(mockedDocumentsHandlerInstance);
	});

	test('should provide configuration', () => {
		const mockedDocumentsHandler = createMock<DocumentsHandler>();
		const mockedDocumentsHandlerInstance = instance(mockedDocumentsHandler);

		const handler = new SignatureHelpHandler(mockedDocumentsHandlerInstance);

		const result = handler.getConfiguration();

		if (!result.triggerCharacters) {
			fail();
		}

		expect(result.triggerCharacters).to.have.length(1);
		expect(result.retriggerCharacters).to.have.length(0);

		expect(result.triggerCharacters[0]).to.equal('(');
	});

	test('should provide signature help', () => {
		const mockedTextDocument = createMock<TextDocument>();

		when(mockedTextDocument.getText()).thenReturn('player:tell("test1");\nplayer:tell(\nplayer:tell("test3");');

		when(mockedTextDocument.lineCount).thenReturn(3);

		const mockedTextDocumentInstance = instance(mockedTextDocument);

		const mockedDocumentsHandler = createMock<DocumentsHandler>();

		when(mockedDocumentsHandler.get('doc-uri')).thenReturn(mockedTextDocumentInstance);

		const mockedDocumentsHandlerInstance = instance(mockedDocumentsHandler);

		const handler = new SignatureHelpHandler(mockedDocumentsHandlerInstance);

		const signatureHelpParams = { textDocument: { uri: 'doc-uri' }, position: { line: 2, character: 11 }, context: { isRetrigger: false, triggerKind: SignatureHelpTriggerKind.Invoked } };

		const result = handler.onSignatureHelp(signatureHelpParams);

		expect(result?.activeParameter).to.equal(0);
		expect(result?.activeSignature).to.equal(0);
		expect(result?.signatures).to.have.length(1);
	});
});

/*

Real SignatureHelpParams:
{
  textDocument: { uri: 'file:///c%3A/Users/abrae/Documents/test/samples.moo' },
  position: { line: 14, character: 7 },
  context: { isRetrigger: false, triggerKind: 1 }
}

*/