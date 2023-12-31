import { removeAllMemories } from "../../../api/vectorapi";
import { Chat } from "../../../classes/Chat";
import { confirmModal } from "../../../components/confirm-modal";
import { Cog, Download, Edit2Icon, LucideArrowBigLeft, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ChatInfoProps { 
    chat: Chat;
    searchTerm: string;
    onEdit?: (chat: Chat) => void;
    setSearchTerm?: (term: string) => void;
    goBack: () => void;
    openSettings: () => void;
}
const ChatInfo = (props: ChatInfoProps) => {
    const { chat, onEdit, searchTerm, setSearchTerm, goBack, openSettings } = props;
    const [name, setName] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        setName(chat.name);
    }, [chat]);

    const handleEdit = () => {
        chat.name = name;
        if (onEdit !== undefined) onEdit(chat);
        setIsEditing(false);
    }

    
	const handleChatDownload = async () => {
		if(chat === null) return;
		const element = document.createElement("a");
		const file = new Blob([JSON.stringify(chat)], {type: 'text/plain'});
		element.href = URL.createObjectURL(file);
		element.download = `${chat.name}.json`;
		document.body.appendChild(element);
		element.click();
	}

    const handleRemoveAllMessages = async () => {
        if(chat === null) return;
        if(!await confirmModal(`Are you sure you want to clear all messages? This cannot be undone.`)) return;
        chat.messages = [];
        if (onEdit !== undefined) onEdit(chat);
        if (chat.doVector) {
            removeAllMemories(chat._id).then(() => {
                console.log("Removed all memories");
            }).catch((err) => {
                console.error(err);
            });
        }
    }

    return (
        <div className="themed-root w-full flex flex-row justify-between items-center gap-6 slide-in-top">
            <div className="flex flex-row gap-6">
                <button className="message-button" onClick={() => {goBack()}} title="Return to Select">
                    <LucideArrowBigLeft size={'2rem'} className="text-theme-text"/>
                </button>
                <button className="message-button" onClick={() => handleChatDownload()} title="Download ChatLog">
                    <Download size={'2rem'} className="text-theme-text"/>
                </button>
            </div>
    
            {isEditing ? (
                <input
                    value={name}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setName(newValue);
                    }}
                    onBlur={() => {
                        handleEdit();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleEdit();
                        }
                    }}
                    autoFocus
                    className="flex-grow bg-transparent"
                />
            ) : (
                <div className="flex flex-row items-center gap-6 flex-grow">
                    <p className="flex-grow">{name}</p>
                    {chat._id !== "activePool" && (
                        <button onClick={() => setIsEditing(true)} className="message-button" title="Edit Chat name">
                            <Edit2Icon size={'1rem'} />
                        </button>
                    )}
                </div>
            )}
    
            <div className="construct-search-bar flex-grow">
                <input
                    type="text"
                    placeholder="Search Messages"
                    value={searchTerm}
                    onChange={(event) => {if(setSearchTerm) setSearchTerm(event.target.value)}}
                    className="w-full"
                />
            </div>
            
            <button className="message-button" onClick={() => handleRemoveAllMessages()} title="Clear Messages">
                <X size={'2rem'} className="text-theme-text"/>
            </button>
            <button className="message-button" onClick={() => {openSettings()}} title="Edit Chat Settings">
                <Cog size={'2rem'} className="text-theme-text"/>
            </button>
        </div>
    );    
}
export default ChatInfo;