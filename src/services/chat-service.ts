import {GenerateContentResponse, GoogleGenAI} from '@google/genai';
import AINoteTakingPlugin from "../main";
import { AntSettingsSchema } from 'settings';



export default class ChatService{
	resetConversation() {
		throw new Error("Method not implemented.");
	}
	sendMessageStream(userMessage: string): any {
		throw new Error("Method not implemented.");
	}
    google_sdk: GoogleGenAI
    settings: AntSettingsSchema

    constructor(plugin:AINoteTakingPlugin){ 
        this.settings = plugin.settings
        this.google_sdk = new GoogleGenAI({apiKey: this.settings.api_key.value});

    }
    async request_response (request:string):Promise<AsyncGenerator<GenerateContentResponse, any, any>> {
        const response = await this.google_sdk.models.generateContentStream({
            model: this.settings.model.value,
            contents: request
        })
        return response
    }



}