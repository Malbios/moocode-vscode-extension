import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
    label: 'unitTests',
    files: 'server/tests/**/*.test.ts',
    version: 'insiders',
    workspaceFolder: './sampleWorkspace',
    mocha: {
        ui: 'tdd',
        timeout: 20000,
        require: ['ts-node/register']
    }
});