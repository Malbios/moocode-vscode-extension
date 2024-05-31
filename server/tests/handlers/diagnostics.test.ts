import { expect } from 'chai';
import { suite, test } from 'mocha';
import { generateAst } from 'moocode-parsing';
import { mock as createMock, instance, when } from 'ts-mockito';
import { DocumentDiagnosticParams, DocumentDiagnosticReportKind, FullDocumentDiagnosticReport, TextDocumentIdentifier } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { AstCache } from '../../src/common/ast-cache';
import { DiagnosticsHandler } from '../../src/handlers/diagnostics';
import { DocumentsHandler } from '../../src/handlers/documents';

suite('diagnostics tests for diagnostics handler', () => {
	test('should find an issue in code with one syntax error', () => {
		const code = '$stuff.blob.bla:sthisia();\n$\nvar = 0.0;';
		const ast = generateAst(code);

		const mockedTextDocument = createMock<TextDocument>();

		when(mockedTextDocument.uri).thenReturn('doc-uri');
		when(mockedTextDocument.getText()).thenReturn(code);

		const mockedTextDocumentInstance = instance(mockedTextDocument);

		const mockedDocumentsHandler = createMock<DocumentsHandler>();

		when(mockedDocumentsHandler.get('doc-uri')).thenReturn(mockedTextDocumentInstance);

		const mockedDocumentsHandlerInstance = instance(mockedDocumentsHandler);

		const mockedTextDocumentIdentifier = createMock<TextDocumentIdentifier>();

		when(mockedTextDocumentIdentifier.uri).thenReturn('doc-uri');

		const mockedTextDocumentIdentifierInstance = instance(mockedTextDocumentIdentifier);

		const mockedDocumentDiagnosticParams = createMock<DocumentDiagnosticParams>();

		when(mockedDocumentDiagnosticParams.textDocument).thenReturn(mockedTextDocumentIdentifierInstance);

		const mockedDocumentDiagnosticParamsInstance = instance(mockedDocumentDiagnosticParams);

		const mockedAstCache = createMock<AstCache>();

		when(mockedAstCache.generateAst(code)).thenReturn(ast);

		const mockedAstCacheInstance = instance(mockedAstCache);

		const handler = new DiagnosticsHandler(mockedDocumentsHandlerInstance, mockedAstCacheInstance);

		const result = handler.handleDiagnostics(mockedDocumentDiagnosticParamsInstance, 1000);

		expect(result.kind).to.equal(DocumentDiagnosticReportKind.Full);

		const report = result as FullDocumentDiagnosticReport;

		expect(report.items).to.have.length(1);
		
		expect(report.items[0].range.start.line).to.equal(1);
		expect(report.items[0].range.start.character).to.equal(0);
		expect(report.items[0].range.end.line).to.equal(2);
		expect(report.items[0].range.end.character).to.equal(9);
		expect(report.items[0].message).to.contain('could not generate a node from \'AssignmentContext\'');
		expect(report.items[0].source).to.equal('MOOcode syntax diagnostics');
	});
});