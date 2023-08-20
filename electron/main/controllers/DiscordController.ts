import { ipcMain } from 'electron';
import Store from 'electron-store';
import { generateContinueChatLog, regenerateMessageFromChatLog, removeMessagesFromChatLog, retrieveConstructs } from './ConstructController';
import { addChat, getChat, getConstruct, updateChat } from '../api/pouchdb';
import { assembleChatFromData, assembleConstructFromData, convertDiscordMessageToMessage } from '../helpers/helpers';
import { CommandInteraction, Message } from 'discord.js';
import { deleteMessage, editMessage, isAutoReplyMode, isMultiCharacterMode, sendMessage, sendMessageAsCharacter, sendTyping } from '../api/discord';
import { ChannelConfigInterface, ChatInterface, ConstructInterface } from '../types/types';

const store = new Store({
    name: 'discordData',
});

type DiscordMode = 'Character' | 'Construct';

const setDiscordMode = (mode: DiscordMode) => {
    store.set('mode', mode);
    console.log(store.get('mode'));
};

const getDiscordMode = (): DiscordMode => {
    console.log(store.get('mode'));
    return store.get('mode') as DiscordMode;
};

const clearDiscordMode = () => {
    store.set('mode', null);
};

export const getRegisteredChannels = (): ChannelConfigInterface[] => {
    return store.get('channels', []) as ChannelConfigInterface[];
}

export const addRegisteredChannel = (newChannel: ChannelConfigInterface): void => {
    const existingChannels = getRegisteredChannels();
    if (!existingChannels.includes(newChannel)) {
        existingChannels.push(newChannel);
        store.set('channels', existingChannels);
    }
}

export const removeRegisteredChannel = (channelToRemove: string): void => {
    const existingChannels = getRegisteredChannels();
    const updatedChannels = existingChannels.filter(channel => channel._id !== channelToRemove);
    store.set('channels', updatedChannels);
}

export const isChannelRegistered = (channel: string): boolean => {
    const existingChannels = getRegisteredChannels();
    for(let i = 0; i < existingChannels.length; i++){
        if(existingChannels[i]._id === channel){
            return true;
        }
    }
    return false;
}

export async function handleDiscordMessage(message: Message) {
    if(message.author.bot) return;
    if(message.channel.isDMBased()) return;
    if(message.content.startsWith('.')) return;
    let registeredChannels = getRegisteredChannels();
    let registered = false;
    for(let i = 0; i < registeredChannels.length; i++){
        if(registeredChannels[i]._id === message.channel.id){
            registered = true;
            break;
        }
    }
    if(!registered) return;
    const activeConstructs = retrieveConstructs();
    if(activeConstructs.length < 1) return;
    const newMessage = convertDiscordMessageToMessage(message, activeConstructs);
    let constructArray = [];
    for (let i = 0; i < activeConstructs.length; i++) {
        let constructDoc = await getConstruct(activeConstructs[i]);
        let construct = assembleConstructFromData(constructDoc);
        constructArray.push(construct);
    }
    let chatLogData = await getChat(message.channel.id);
    let chatLog;
    if (chatLogData) {
        chatLog = assembleChatFromData(chatLogData);
        chatLog.messages.push(newMessage);
    }else{
        chatLog = {
            _id: message.channel.id,
            name: message.channel.id + ' Chat ' + constructArray[0].name,
            type: 'Discord',
            messages: [newMessage],
            lastMessage: newMessage,
            lastMessageDate: newMessage.timestamp,
            firstMessageDate: newMessage.timestamp,
            agents: activeConstructs,
        }
        if(chatLog.messages.length > 0){
            await addChat(chatLog);
        }else{
            return;
        }
    }
    if(message.content.startsWith('-')){
        await updateChat(chatLog);
        return;
    }
    const mode = getDiscordMode();
    if(mode === 'Character'){
        sendTyping(message);
        if(isMultiCharacterMode()){
            chatLog = await doRoundRobin(constructArray, chatLog, message);
            if(chatLog !== undefined)
            if(isAutoReplyMode()){
                if(0.25 > Math.random()){
                    chatLog = await doRoundRobin(constructArray, chatLog, message);
                }
            }
        }else{
            chatLog = await doCharacterReply(constructArray[0], chatLog, message);
        }
    }else if (mode === 'Construct'){
        await sendMessage(message.channel.id, 'Construct Mode is not yet implemented.');
    }
    await updateChat(chatLog);
}

async function doCharacterReply(construct: ConstructInterface, chatLog: ChatInterface, message: Message | CommandInteraction){
    let username: string = 'You';
    if(message instanceof Message){
        username = message.author.displayName;
    }
    if(message instanceof CommandInteraction){
        username = message.user.displayName;
    }
    if(message.channel === null) return;
    const result = await generateContinueChatLog(construct, chatLog, username);
    let reply: string;
    if (result !== null) {
        reply = result;
    } else {
        return;
    }
    const replyMessage = {
        _id: Date.now().toString(),
        user: construct._id,
        text: reply,
        timestamp: Date.now(),
        origin: 'Discord',
        isCommand: false,
        isPrivate: false,
        participants: [username, construct._id],
        attachments: [],
    }
    chatLog.messages.push(replyMessage);
    chatLog.lastMessage = replyMessage;
    chatLog.lastMessageDate = replyMessage.timestamp;
    await sendMessage(message.channel.id, reply);
    await updateChat(chatLog);
    return chatLog;
}

async function doRoundRobin(constructArray: ConstructInterface[], chatLog: ChatInterface, message: Message | CommandInteraction){
    let primaryConstruct = retrieveConstructs()[0];
    let username: string = 'You';
    if(message instanceof Message){
        username = message.author.displayName;
    }
    if(message instanceof CommandInteraction){
        username = message.user.displayName;
    }
    if(message.channel === null) return;
    let lastMessageContent = chatLog.lastMessage.text;
    let mentionedConstruct = containsName(lastMessageContent, constructArray);
    if (mentionedConstruct) {
        // Find the index of the mentioned construct
        let mentionedIndex = -1;
        for (let i = 0; i < constructArray.length; i++) {
            if (constructArray[i].name === mentionedConstruct) {
                mentionedIndex = i;
                break;
            }
        }

        // If the mentioned construct was found in the array,
        // rearrange the array to make it the first element
        if (mentionedIndex !== -1) {
            const [mentioned] = constructArray.splice(mentionedIndex, 1);
            constructArray.unshift(mentioned);
        }
    }
    for(let i = 0; i < constructArray.length; i++){
        if(i !== 0){
            if(0.25 > Math.random()){
                continue;
            }
        }
        const result = await generateContinueChatLog(constructArray[i], chatLog, username);
        let reply: string;
        if (result !== null) {
            reply = result;
        } else {
            continue;
        }
        const replyMessage = {
            _id: Date.now().toString(),
            user: constructArray[i].name,
            text: reply,
            timestamp: Date.now(),
            origin: 'Discord',
            isCommand: false,
            isPrivate: false,
            participants: [username, constructArray[i]._id],
            attachments: [],
        }
        chatLog.messages.push(replyMessage);
        chatLog.lastMessage = replyMessage;
        chatLog.lastMessageDate = replyMessage.timestamp;
        if(primaryConstruct === constructArray[i]._id){
            await sendMessage(message.channel.id, reply);
        }else{
            await sendMessageAsCharacter(constructArray[i], message.channel.id, reply);
        }
        await updateChat(chatLog);
    }
    return chatLog;
}

export async function continueChatLog(interaction: CommandInteraction) {
    let registeredChannels = getRegisteredChannels();
    let registered = false;
    if(interaction.channel === null) return;
    for(let i = 0; i < registeredChannels.length; i++){
        if(registeredChannels[i]._id === interaction.channel.id){
            registered = true;
            break;
        }
    }
    if(!registered) return;
    const activeConstructs = retrieveConstructs();
    if(activeConstructs.length < 1) return;
    let constructArray = [];
    for (let i = 0; i < activeConstructs.length; i++) {
        let constructDoc = await getConstruct(activeConstructs[i]);
        let construct = assembleConstructFromData(constructDoc);
        constructArray.push(construct);
    }
    let chatLogData = await getChat(interaction.channel.id);
    let chatLog;
    if (chatLogData) {
        chatLog = assembleChatFromData(chatLogData);
    }
    if(chatLog === undefined){
        return;
    }
    if(chatLog.messages.length < 1){
        return;
    }
    const mode = getDiscordMode();
    if(mode === 'Character'){
        sendTyping(interaction);
        if(isMultiCharacterMode()){
            chatLog = await doRoundRobin(constructArray, chatLog, interaction);
            if(chatLog !== undefined)
            if(isAutoReplyMode()){
                if(0.25 > Math.random()){
                    chatLog = await doRoundRobin(constructArray, chatLog, interaction);
                }
            }
        }else{
            chatLog = await doCharacterReply(constructArray[0], chatLog, interaction);
        }
    }else if (mode === 'Construct'){
        await sendMessage(interaction.channel.id, 'Construct Mode is not yet implemented.');
    }
    await updateChat(chatLog);
}

export async function handleRengenerateMessage(message: Message){
    let registeredChannels = getRegisteredChannels();
    let registered = false;
    if(message.channel === null) return;
    for(let i = 0; i < registeredChannels.length; i++){
        if(registeredChannels[i]._id === message.channel.id){
            registered = true;
            break;
        }
    }
    if(!registered) return;
    let chatLogData = await getChat(message.channel.id);
    let chatLog;
    if (chatLogData) {
        chatLog = assembleChatFromData(chatLogData);
    }
    if(chatLog === undefined){
        return;
    }
    if(chatLog.messages.length < 1){
        return;
    }
    let edittedMessage = await regenerateMessageFromChatLog(chatLog, message.content);
    if(edittedMessage === undefined) return;
    await editMessage(message, edittedMessage);
}

export async function handleRemoveMessage(message: Message){
    let registeredChannels = getRegisteredChannels();
    let registered = false;
    if(message.channel === null) return;
    for(let i = 0; i < registeredChannels.length; i++){
        if(registeredChannels[i]._id === message.channel.id){
            registered = true;
            break;
        }
    }
    if(!registered) return;
    let chatLogData = await getChat(message.channel.id);
    let chatLog;
    if (chatLogData) {
        chatLog = assembleChatFromData(chatLogData);
    }
    if(chatLog === undefined){
        return;
    }
    if(chatLog.messages.length < 1){
        return;
    }
    await removeMessagesFromChatLog(chatLog, message.content);
    await deleteMessage(message);
}

function containsName(message: string, chars: ConstructInterface[]){
    for(let i = 0; i < chars.length; i++){
        if(message.includes(chars[i].name)){
            return chars[i].name;
        }
    }
    return false;
}

function DiscordController(){
    ipcMain.on('discordMode', (event, arg) => {
        setDiscordMode(arg);
    });

    ipcMain.handle('getDiscordMode', () => {
        return getDiscordMode();
    });

    ipcMain.on('clearDiscordMode', () => {
        clearDiscordMode();
    });

    ipcMain.handle('getRegisteredChannels', () => {
        return getRegisteredChannels();
    });

    ipcMain.handle('addRegisteredChannel', (event, arg) => {
        addRegisteredChannel(arg);
    });

    ipcMain.handle('removeRegisteredChannel', (event, arg) => {
        removeRegisteredChannel(arg);
    });

    ipcMain.handle('isChannelRegistered', (event, arg) => {
        return isChannelRegistered(arg);
    });
}

export default DiscordController;