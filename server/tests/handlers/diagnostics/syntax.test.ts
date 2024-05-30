import { expect } from 'chai';
import { suite, test } from 'mocha';
import { mock as createMock, instance, when } from 'ts-mockito';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticsInput } from '../../../src/common/interfaces';
import { SyntaxIssueFinder } from './../../../src/handlers/diagnostics/syntax';

suite('diagnostics tests for syntax issues', () => {
	test('should find no issues for empty code', () => {
		const mockedTextDocument = createMock<TextDocument>();

		when(mockedTextDocument.getText()).thenReturn('');

		const input: DiagnosticsInput = { maxIssues: 999, document: instance(mockedTextDocument) };

		const issueFinder = new SyntaxIssueFinder();

		const result = issueFinder.find(input);

		expect(result).to.have.length(0);
	});

	test('should find no issues for valid code', () => {
		const mockedTextDocument = createMock<TextDocument>();

		when(mockedTextDocument.getText()).thenReturn('if (valid(player)) player:tell("test"); else player:tell("nope"); endif');

		const input: DiagnosticsInput = { maxIssues: 999, document: instance(mockedTextDocument) };

		const issueFinder = new SyntaxIssueFinder();

		const result = issueFinder.find(input);

		expect(result).to.have.length(0);
	});

	test('should find an issue in code with one syntax error', () => {
		const mockedTextDocument = createMock<TextDocument>();

		when(mockedTextDocument.getText()).thenReturn('if (valid(player)) player:tell("test"); else player:tell("nope") endif');

		const input: DiagnosticsInput = { maxIssues: 999, document: instance(mockedTextDocument) };

		const issueFinder = new SyntaxIssueFinder();

		const result = issueFinder.find(input);

		expect(result).to.have.length(1);
		expect(result[0].range.start.line).to.equal(1);
		expect(result[0].range.start.character).to.equal(65);
		expect(result[0].message).to.contain('missing \';\' at \'endif\'');
	});
});