import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic } from 'vscode-languageserver/node';
import { AstCache } from './ast-cache';

export interface MoocodeSettings {
	maxNumberOfProblems: number
}

export interface DiagnosticsInput {
	maxIssues: number,
	document: TextDocument
	astCache: AstCache
}

export interface IssueFinder {
	find(input: DiagnosticsInput): Diagnostic[];
}