import { ChatInterface, MessageInterface } from "../types/types.js";
import { getGPTTokens } from "./helpers.js";
type Tokenizer = 'OpenAI' | 'LLaMA';

export function fillChatContextToLimit(chatLog: ChatInterface, tokenLimit: number, tokenizer: Tokenizer = 'LLaMA'){
    console.log(`Filling chat context to ${tokenLimit} tokens.`);
    const messagesToInclude: MessageInterface[] = [];
    let tokenCount = 0;
    for(let i = chatLog.messages.length - 1; i >= 0; i--){
        const message = chatLog.messages[i];
        let tokens: number;
        if(tokenizer === 'OpenAI'){
            tokens = getGPTTokens(message.text);
        } else {
            tokens = getGPTTokens(message.text);
        }
        if(tokens+ tokenCount <= tokenLimit){
            messagesToInclude.unshift(message);
            tokenCount += tokens;
        } else {
            break;
        }
    }
    console.log(`Including ${messagesToInclude.length} messages with ${tokenCount} tokens.`);
    return messagesToInclude;
}