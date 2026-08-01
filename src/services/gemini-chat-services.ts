import ChatService from "./interface-chat-service";
import AINoteTakingPlugin from "main";
import {GoogleGenAI} from '@google/genai';
import { AntSettingsSchema } from 'settings';


export default class GeminiChatService implements ChatService{
    google_ai_sdk: GoogleGenAI
    settings: AntSettingsSchema
    model:string
    constructor(plugin: AINoteTakingPlugin){
        this.google_ai_sdk = new GoogleGenAI({apiKey : plugin.settings.api_key.value})
        this.model = plugin.settings.model.value
    }

    async sendMessage(userMessage: string) {
        const response = await this.google_ai_sdk.models.generateContent({
            model: this.model,
            contents: userMessage
        })
        return response.text
    }
    async *sendMessageStream(userMessage: string) {
        const stream = await this.google_ai_sdk.models.generateContentStream({
            model: this.model,
            contents: userMessage
        });

        for await (const chunk of stream) {
            yield chunk.text;
        }
    }
    async resetConversation(): Promise<void> {
        throw new Error("Not implemented error")
    }

}