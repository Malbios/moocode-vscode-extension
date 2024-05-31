import { expect } from 'chai';
import { suite, test } from 'mocha';
import { generateAst } from 'moocode-parsing';
import { mock as createMock, instance, when } from 'ts-mockito';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { AstCache } from '../../../src/common/ast-cache';
import { DiagnosticsInput } from '../../../src/common/interfaces';
import { SyntaxIssueFinder } from './../../../src/handlers/diagnostics/syntax';

function getResult(input: string) {
	const ast = generateAst(input);

	const mockedTextDocument = createMock<TextDocument>();

	when(mockedTextDocument.getText()).thenReturn(input);

	const mockedAstCache = createMock<AstCache>();

	when(mockedAstCache.generateAst(input)).thenReturn(ast);

	const mockedAstCacheInstance = instance(mockedAstCache);

	const diagnosticsInput: DiagnosticsInput = {
		maxIssues: 999, document: instance(mockedTextDocument), astCache: mockedAstCacheInstance
	};

	const issueFinder = new SyntaxIssueFinder();

	return issueFinder.find(diagnosticsInput);
}

suite('diagnostics tests for syntax issues', () => {
	test('should find no issues for empty code', () => {
		const result = getResult('');

		expect(result).to.have.length(0);
	});

	test('should find no issues for valid code', () => {
		const result = getResult('if (valid(player)) player:tell("test"); else player:tell("nope"); endif');

		expect(result).to.have.length(0);
	});

	test('should find an issue in code with one syntax error', () => {
		const result = getResult('if (valid(player)) player:tell("test"); else player:tell("nope") endif');

		expect(result).to.have.length(1);

		expect(result[0].range.start.line).to.equal(0);
		expect(result[0].range.start.character).to.equal(65);
		expect(result[0].range.end.line).to.equal(0);
		expect(result[0].range.end.character).to.equal(65);
		expect(result[0].message).to.contain('missing \';\' at \'endif\'');
		expect(result[0].source).to.equal('MOOcode syntax diagnostics');
	});
});