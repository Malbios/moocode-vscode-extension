import { Diagnostic } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

export interface MoocodeSettings {
	maxNumberOfProblems: number
}

export interface DiagnosticsInput {
	maxIssues: number,
	document: TextDocument
}

export interface IssueFinder {
	find(input: DiagnosticsInput): Diagnostic[];
}