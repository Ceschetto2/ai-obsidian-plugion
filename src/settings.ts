import {App, Setting, PluginSettingTab} from "obsidian";
import AINoteTakingPlugin from "./main";

type AntSetting<T> = {
	value: T;
	description: string;
};

export type AntSettingsSchema = {
	model: AntSetting<ModelValues>;
	auto_completion: AntSetting<boolean>;
	ttc: AntSetting<number>;
	response_length: AntSetting<number>;
	api_key: AntSetting<string>;
};

export enum ModelValues {
    // ---- Latest generation (recommended) ----
    GEMINI_3_5_FLASH = "gemini-3.5-flash",
    GEMINI_3_5_FLASH_LITE = "gemini-3.5-flash-lite",
    GEMINI_3_6_FLASH = "gemini-3.6-flash",

    GEMINI_3_1_FLASH_LITE = "gemini-3.1-flash-lite",
    GEMINI_3_1_FLASH_LITE_PREVIEW = "gemini-3.1-flash-lite-preview",
    GEMINI_3_1_PRO_PREVIEW = "gemini-3.1-pro-preview",

    GEMINI_3_FLASH_PREVIEW = "gemini-3-flash-preview",
    GEMINI_3_PRO_PREVIEW = "gemini-3-pro-preview",

    // ---- "Latest" rolling aliases (always point to newest stable) ----
    GEMINI_FLASH_LATEST = "gemini-flash-latest",
    GEMINI_FLASH_LITE_LATEST = "gemini-flash-lite-latest",
    GEMINI_PRO_LATEST = "gemini-pro-latest",

    // ---- 2.5 generation (still listed for your project) ----
    GEMINI_2_5_FLASH = "gemini-2.5-flash",
    GEMINI_2_5_FLASH_LITE = "gemini-2.5-flash-lite",
    GEMINI_2_5_PRO = "gemini-2.5-pro",

    // ---- Gemma models available through the Gemini API ----
    GEMMA_4_31B_IT = "gemma-4-31b-it",
    GEMMA_4_26B_A4B_IT = "gemma-4-26b-a4b-it",
}

export const ant_settings: AntSettingsSchema = {
	model: {
		value: ModelValues.GEMMA_4_31B_IT,
		description: "The model used by the assistant."
	},
	auto_completion: {
		value: false,
		description: "Enable or disable automatic completion."
	},
	ttc: {
		value: 25,
		description: "Maximum time to complete a response."
	},
	response_length: {
		value: 100,
		description: "Maximum response length."
	},
	api_key: {
		value: "",
		description: "API key used to access the model provider."
	}
};

export class AntSettingTab extends PluginSettingTab {
	plugin: AINoteTakingPlugin;

	constructor(app: App, plugin: AINoteTakingPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const {containerEl} = this

		containerEl.empty();
		//refactor splitting in different function based on the input kind	
		Object.entries(this.plugin.settings).forEach(([key, values]) => {
			const item = new Setting(containerEl)
				.setName(key)
				.setDesc(values.description);

			if (key === "model") {
				const modelSetting = values as AntSetting<ModelValues>;

				item.addDropdown(dropdown => {
					Object.entries(ModelValues).forEach(([label, modelId]) => {
						dropdown.addOption(modelId, label);
					});

					dropdown
						.setValue(modelSetting.value)
						.onChange(async (value) => {
							modelSetting.value = value as ModelValues;
							await this.plugin.saveSettings();
						});
				});
			}
			else if (typeof values.value === "boolean") {
				item.addToggle(toggle =>
					toggle
						.setValue(values.value)
						.onChange(async (value) => {
							values.value = value;
							await this.plugin.saveSettings();
						})
				);
			}
			else if (typeof values.value === "number") {
				item.addText(text =>
					text
						.setPlaceholder("Enter a number")
						.setValue(String(values.value))
						.onChange(async (value) => {
							const parsedValue = Number(value);

							if (Number.isNaN(parsedValue)) {
								return;
							}

							values.value = parsedValue;
							await this.plugin.saveSettings();
						})
				);
			}
			else {
				item.addText(text => {
					text
						.setPlaceholder(key === "api_key" ? "Enter your API key" : "Enter a value")
						.setValue(values.value)
						.onChange(async (value) => {
							values.value = value;
							await this.plugin.saveSettings();
						});

					if (key === "api_key") {
						text.inputEl.type = "password";
						text.inputEl.autocomplete = "off";
						text.inputEl.spellcheck = false;
					}
				});
			}
		});
	}
}
