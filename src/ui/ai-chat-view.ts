import {
	ItemView,
	MarkdownRenderer,
	WorkspaceLeaf
} from "obsidian";

import { AntSettingsSchema } from "../settings";
import  ChatService from "../services/interface-chat-service";

export const ai_chat_view = "ai_chat_view";

type MessageRole = "user" | "assistant";

export class AiChatView extends ItemView {
	private currentSettings: AntSettingsSchema;
	private readonly chatService: ChatService;

	private chatContainer!: HTMLDivElement;
	private modelLabel!: HTMLSpanElement;
	private statusLabel!: HTMLSpanElement;

	private promptInput!: HTMLTextAreaElement;
	private sendButton!: HTMLButtonElement;
	private newChatButton!: HTMLButtonElement;

	private emptyState?: HTMLDivElement;
	private isGenerating = false;

	constructor(
		leaf: WorkspaceLeaf,
		currentSettings: AntSettingsSchema,
		chatService: ChatService
	) {
		super(leaf);

		this.currentSettings = currentSettings;
		this.chatService = chatService;
	}

	async onOpen(): Promise<void> {
		const container = this.contentEl;

		container.empty();
		container.addClass("ai-chat-view");

		this.renderHeader(container);
		this.renderMessagesArea(container);
		this.renderComposer(container);

		this.promptInput.focus();
	}

	async onClose(): Promise<void> {
		this.contentEl.empty();
	}

	getViewType(): string {
		return ai_chat_view;
	}

	getDisplayText(): string {
		return "AI chat";
	}

	/**
	 * Call this method after the plugin settings change.
	 */
	updateSettings(settings: AntSettingsSchema): void {
		this.currentSettings = settings;

		if (this.modelLabel) {
			this.modelLabel.setText(
				`Model: ${this.currentSettings.model.value}`
			);
		}
	}

	private renderHeader(container: HTMLElement): void {
		const header = container.createDiv({
			cls: "ai-chat-header"
		});

		const information = header.createDiv({
			cls: "ai-chat-header-information"
		});

		information.createEl("h4", {
			cls: "ai-chat-title",
			text: "AI chat"
		});

		this.modelLabel = information.createSpan({
			cls: "ai-chat-model",
			text: `Model: ${this.currentSettings.model.value}`
		});

		const actions = header.createDiv({
			cls: "ai-chat-header-actions"
		});

		this.statusLabel = actions.createSpan({
			cls: "ai-chat-status",
			text: "Ready"
		});

		this.newChatButton = actions.createEl("button", {
			cls: "ai-chat-new-chat-button",
			text: "New chat",
			attr: {
				type: "button",
				"aria-label": "Start a new conversation"
			}
		});

		this.registerDomEvent(
			this.newChatButton,
			"click",
			() => this.resetConversation()
		);
	}

	private renderMessagesArea(container: HTMLElement): void {
		this.chatContainer = container.createDiv({
			cls: "ai-chat-messages"
		});

		this.renderEmptyState();
	}

	private renderEmptyState(): void {
		this.emptyState = this.chatContainer.createDiv({
			cls: "ai-chat-empty-state"
		});

		this.emptyState.createEl("p", {
			cls: "ai-chat-empty-state-title",
			text: "No messages yet"
		});

		this.emptyState.createEl("p", {
			cls: "ai-chat-empty-state-description",
			text: "Ask a question about your notes or start a new conversation."
		});
	}

	private renderComposer(container: HTMLElement): void {
		const composer = container.createEl("form", {
			cls: "ai-chat-composer"
		});

		this.promptInput = composer.createEl("textarea", {
			cls: "ai-chat-prompt-input",
			attr: {
				rows: "1",
				placeholder: "Write a message...",
				"aria-label": "Chat message"
			}
		});

		this.sendButton = composer.createEl("button", {
			cls: "ai-chat-send-button",
			text: "Send",
			attr: {
				type: "submit"
			}
		});

		this.sendButton.disabled = true;

		this.registerDomEvent(composer, "submit", (event) => {
			event.preventDefault();
			void this.submitMessage();
		});

		this.registerDomEvent(this.promptInput, "input", () => {
			this.resizePromptInput();
			this.updateSendButtonState();
		});

		this.registerDomEvent(
			this.promptInput,
			"keydown",
			(event: KeyboardEvent) => {
				if (
					event.key === "Enter" &&
					!event.shiftKey &&
					!event.isComposing
				) {
					event.preventDefault();
					void this.submitMessage();
				}
			}
		);
	}

	private async submitMessage(): Promise<void> {
		const userMessage = this.promptInput.value.trim();

		if (!userMessage || this.isGenerating) {
			return;
		}

		this.addPlainTextMessage("user", userMessage);

		this.promptInput.value = "";
		this.resizePromptInput();
		this.setGeneratingState(true);

		const assistantMessageElement =
			this.createMessageElement("assistant");

		assistantMessageElement.setText("Thinking...");

		let completeResponse = "";

		try {
			for await (
				const chunk of this.chatService.sendMessageStream(userMessage)
			) {
				completeResponse += chunk;

				/*
				 * Render plain text while streaming.
				 * This avoids rebuilding Markdown elements after every chunk.
				 */
				assistantMessageElement.setText(
					completeResponse || "Thinking..."
				);

				this.scrollToLatestMessage();
			}

			await this.renderMarkdownMessage(
				assistantMessageElement,
				completeResponse || "_No response received._"
			);
		} catch (error) {
			console.error("Unable to generate chatbot response:", error);

			assistantMessageElement.empty();
			assistantMessageElement.addClass(
				"ai-chat-message-content-error"
			);

			assistantMessageElement.setText(
				error instanceof Error
					? error.message
					: "An unknown error occurred."
			);
		} finally {
			this.setGeneratingState(false);
			this.scrollToLatestMessage();
			this.promptInput.focus();
		}
	}

	private addPlainTextMessage(
		role: MessageRole,
		text: string
	): void {
		const messageElement = this.createMessageElement(role);

		/*
		 * User input is displayed as plain text.
		 * This prevents arbitrary HTML or Markdown rendering.
		 */
		messageElement.setText(text);

		this.scrollToLatestMessage();
	}

	private createMessageElement(
		role: MessageRole
	): HTMLDivElement {
		this.removeEmptyState();

		const message = this.chatContainer.createDiv({
			cls: [
				"ai-chat-message",
				`ai-chat-message-${role}`
			]
		});

		message.createDiv({
			cls: "ai-chat-message-role",
			text: role === "user" ? "You" : "Assistant"
		});

		return message.createDiv({
			cls: "ai-chat-message-content"
		});
	}

	private async renderMarkdownMessage(
		element: HTMLElement,
		markdown: string
	): Promise<void> {
		element.empty();

		const sourcePath =
			this.app.workspace.getActiveFile()?.path ?? "";

		await MarkdownRenderer.render(
			this.app,
			markdown,
			element,
			sourcePath,
			this
		);
	}

	private resetConversation(): void {
		if (this.isGenerating) {
			return;
		}

		void this.chatService.resetConversation();

		this.chatContainer.empty();
		this.renderEmptyState();

		this.statusLabel.setText("Ready");
		this.promptInput.focus();
	}

	private setGeneratingState(isGenerating: boolean): void {
		this.isGenerating = isGenerating;

		this.statusLabel.setText(
			isGenerating ? "Generating..." : "Ready"
		);

		this.newChatButton.disabled = isGenerating;

		this.updateSendButtonState();
	}

	private updateSendButtonState(): void {
		const hasText =
			this.promptInput.value.trim().length > 0;

		this.sendButton.disabled =
			this.isGenerating || !hasText;
	}

	private resizePromptInput(): void {
		this.promptInput.setCssProps({ height: "auto" });

		const maximumHeight = 160;

		this.promptInput.setCssProps({
			height: `${Math.min(this.promptInput.scrollHeight, maximumHeight)}px`
		});
	}

	private scrollToLatestMessage(): void {
		requestAnimationFrame(() => {
			this.chatContainer.scrollTop =
				this.chatContainer.scrollHeight;
		});
	}

	private removeEmptyState(): void {
		if (this.emptyState?.isConnected) {
			this.emptyState.remove();
		}

		this.emptyState = undefined;
	}
}