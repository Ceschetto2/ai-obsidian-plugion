export default interface ChatService {
    resetConversation(): void;
    sendMessageStream(userMessage: string): any;
    sendMessage(userMessage: string):any;
}