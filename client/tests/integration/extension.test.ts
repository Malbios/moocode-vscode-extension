import 'mocha';
import { fail } from 'assert';
import { extensions } from 'vscode';

suite('extension tests', () => {
    test('should activate with no errors', async () => {
        const ext = extensions.getExtension('Malbios.moocode-vscode-extension-client');
        if (!ext) {
            fail();
        }

        await ext.activate();
    });
});