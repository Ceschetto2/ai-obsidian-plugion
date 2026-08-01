import {App, Editor, MarkdownView ,Modal, Notice, Plugin, WorkspaceLeaf} from 'obsidian';
import {AntSettingsSchema, ant_settings, AntSettingTab} from "./settings";
import {AiChatView, ai_chat_view} from './ui/ai-chat-view';
import GeminiChatService from 'services/gemini-chat-services';

// Remember to rename these classes and interfaces!

export default class AINoteTakingPlugin extends Plugin {
	settings: AntSettingsSchema;
	chatService: GeminiChatService

	async onload() {
		await this.loadSettings();
		this.chatService = new GeminiChatService(this)
		this.registerView(
			ai_chat_view,
			(leaf)=> new AiChatView(leaf, this.settings, this.chatService)
		)

		this.addRibbonIcon('dice', 'AI Chat', () => {
			this.activateView()
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status bar text');

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-modal-simple',
		// 	name: 'Open modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-modal-complex',
		// 	name: 'Open modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 		return false;
		// 	}
		// });




		// This adds an editor command that can perform some operation on the current editor instance
		// This can be usefull to add a search on the web function / search in ai chat.
		// this.addCommand({
		// 	id: 'replace-selected',
		// 	name: 'Replace selected content',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		editor.replaceSelection('Sample editor command');
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AntSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// This function could be used for registrering key presses?
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	new Notice("Click");
		// });
	}

	async activateView() {
		const { workspace } = this.app;

		const existingLeaf = workspace.getLeavesOfType(ai_chat_view)[0] ?? null;

		if (!existingLeaf) {
			const leaf = workspace.getRightLeaf(false);

			if (!leaf) {
				return;
			}

			await leaf.setViewState({
				type: ai_chat_view,
				active: true
			});

			workspace.revealLeaf(leaf);
			return;
		}

		if (workspace.rightSplit.collapsed) {
			workspace.rightSplit.expand();
			workspace.revealLeaf(existingLeaf);
		} else {
			workspace.rightSplit.collapse();
		}
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, ant_settings, await this.loadData() as Partial<AntSettingsSchema>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		let {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }
