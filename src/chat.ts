import { ItemView, WorkspaceLeaf } from "obsidian";
import { AntSettingsSchema } from "./settings";

export const ai_chat_view = "ai_chat_view";

export class AiChatView extends ItemView {
	private currentSettings: AntSettingsSchema;

	private chatContainer!: HTMLDivElement;
	private messageBox!: HTMLDivElement;

	constructor(leaf: WorkspaceLeaf, currentSettings: AntSettingsSchema) {
		super(leaf);
		this.currentSettings = currentSettings;
	}

	async onOpen(): Promise<void> {
		const container = this.contentEl;
		container.empty();

		container.createEl("h4", {
			text: "AI chat"
		});

		container.createDiv({
			cls: "ai-chat-model",
			text: `Model: ${this.currentSettings.model.value}`
		});

		this.chatContainer = container.createDiv({
			cls: "ai-chat-container"
		});

		this.messageBox = this.chatContainer.createDiv({
			cls: "ai-chat-message-box"
		});

		this.messageBox.createEl("p", {
			text: "No messages yet."
		});
	}

	async onClose(): Promise<void> {}

	getViewType(): string {
		return ai_chat_view;
	}

	getDisplayText(): string {
		return "AI chat";
	}
}