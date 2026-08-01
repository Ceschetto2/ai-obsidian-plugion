export default interface ChatService {
    resetConversation(): Promise<void>;
    sendMessageStream(userMessage: string): AsyncGenerator<string| undefined,void,unknown>;
    sendMessage(userMessage: string): Promise<string | undefined>;
}
