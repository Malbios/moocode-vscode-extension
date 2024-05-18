import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
    files: 'tests/**/*.test.ts',
    mocha: {
        require: ['ts-node/register']
    }
});