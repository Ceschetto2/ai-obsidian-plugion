import {App, Setting, PluginSettingTab} from "obsidian";
import AINoteTakingPlugin from "./main";

export interface AntSettings {
	model: string,
	auto_completition: boolean,
	ttc: number,
	response_lenght: number 
}

export const DEFAULT_ANT_SETTINGS: AntSettings = {
	model: 'default',
	auto_completition: false,
	ttc: 25,
	response_lenght: 100
}

export class AntSettingTab extends PluginSettingTab {
	plugin: AINoteTakingPlugin;

	constructor(app: App, plugin: AINoteTakingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Settings #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				}));
	}
}
