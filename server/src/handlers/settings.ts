import { ConfigurationItem } from 'vscode-languageserver';

import { EXTENSION_ID } from '../common/constants';
import { MoocodeSettings } from '../common/interfaces';

export class SettingsHandler {
	private settings = new Map<string, Thenable<MoocodeSettings>>();
	private getConnectionConfigurationAction: (item: ConfigurationItem) => Thenable<MoocodeSettings>;

	public constructor(
		getConnectionConfigurationAction: (item: ConfigurationItem) => Thenable<MoocodeSettings>
	) {
		this.getConnectionConfigurationAction = getConnectionConfigurationAction;
	}

	public getSettings(resource: string): Thenable<MoocodeSettings> {
		let result = this.settings.get(resource);
		if (!result) {
			result = this.getConnectionConfigurationAction({ scopeUri: resource, section: EXTENSION_ID });
			this.settings.set(resource, result);
		}

		return result;
	}

	public clear() {
		this.settings.clear();
	}

	public delete(key: string) {
		this.settings.delete(key);
	}
}