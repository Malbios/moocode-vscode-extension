import { suite, test } from 'mocha';
import MOOcodeServer from '../src/server';

suite('language server tests', () => {
    test('should be created with no errors', async () => {
        MOOcodeServer.create();
    });
});