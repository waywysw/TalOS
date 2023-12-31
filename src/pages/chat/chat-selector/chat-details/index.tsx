import { getConstruct, updateChat } from "../../../../api/dbapi";
import { Chat } from "../../../../classes/Chat";
import { Construct } from "../../../../classes/Construct";
import { getFormattedTime } from "../../../../pages/chat/chat-log/message";
import { Edit2Icon, TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RiQuestionMark } from "react-icons/ri";
import { truncateText } from "../../helpers";
import { confirmModal } from "../../../../components/confirm-modal";
import { getImageURL } from "../../../../api/baseapi";
interface ChatDetailsProps {
    chat: Chat;
    onDoubleClick?: (chat: Chat) => void;
    onClick?: (chat: Chat) => void;
    onEdit?: (chat: Chat) => void;
    onDelete?: (chat: Chat) => void;
    disabled?: boolean;
    selected?: boolean;
}
const ChatDetails = (props: ChatDetailsProps) => {
    const { chat, onDoubleClick, onClick, onDelete, onEdit, disabled, selected } = props;
    const [name, setName] = useState<string>("");
    const [avatar, setAvatar] = useState<string>("");
    const [constructs, setConstructs] = useState<Construct[]>([]);
    const [avatars, setAvatars] = useState<string[]>([]);
    const [groupAvatar, setGroupAvatar] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isDeleted, setIsDeleted] = useState<boolean>(false);

    const constructsRef = useRef<Construct[]>([]);  // to keep track of current state within async functions

    useEffect(() => {
        if(chat === undefined || chat === null) return;
        const init = async () => {
            setName(chat.name);
            let fetchedConstructs: Construct[] = [];
            for (let i = 0; i < chat.constructs.length; i++) {
                let construct = await getConstruct(chat.constructs[i]);
                if (!construct) {
                    console.error(`Failed to fetch data for construct with ID: ${chat.constructs[i]}`);
                    continue;
                }                
    
                if (!fetchedConstructs.some(existingConstruct => existingConstruct._id === construct._id)) {
                    fetchedConstructs.push(construct);
                }
            }
            constructsRef.current = fetchedConstructs; // update the ref
            setConstructs(fetchedConstructs); // update the state directly
        };
        init();
    }, [chat]);
    
    
    useEffect(() => {
        if (constructs.length === 0) return;
        let avatarList: string[] = [];
        for (let construct of constructs) {
            avatarList.push(construct.avatar);  // assuming `avatar` is the property name in Construct
        }
        setAvatars(avatarList);
    }, [constructs]);

    const saveModifiedChat = async () => {
        if (constructsRef.current.length === 0) return;
        let newChat = chat;
        newChat.name = name;
        await updateChat(newChat);
        onEdit?.(newChat);
    };

    useEffect(() => {
        const generateAvatar = async () => {
            const newGroupAvatar = await renderGroupAvatar();
            if (newGroupAvatar === null) return;
            if (newGroupAvatar === undefined) return;
            setGroupAvatar(newGroupAvatar);
        };
        generateAvatar();
    }, [avatars]);
    
    
    const loadImageFromBase64 = (base64: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (errorEvent) => {
                console.error('Failed to load an image', errorEvent);
                reject(new Error('Failed to load an image'));
            };
            img.src = `${base64}`;
        });
    };    

    const avatarSize = 32;  // The size of each avatar in the grid
    const avatarsPerRow = 2;  // The number of avatars in each row

    const renderGroupAvatar = async () => {
        const numAvatars = avatars.length;
        const canvas = document.createElement('canvas');
        canvas.width = avatarSize * avatarsPerRow;
        canvas.height = avatarSize * avatarsPerRow;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        // Load all images
        const images = await Promise.all(avatars.map(loadImageFromBase64));
    
        if (numAvatars === 1) {
            // If only one avatar, draw it maintaining the aspect ratio
    
            const imageAspect = images[0].width / images[0].height;
            const canvasAspect = canvas.width / canvas.height;
    
            let renderWidth, renderHeight, xOffset, yOffset;
    
            // If image is wider than the canvas in aspect ratio
            if (imageAspect > canvasAspect) {
                renderHeight = canvas.height;
                renderWidth = images[0].width * (renderHeight / images[0].height);
                xOffset = (canvas.width - renderWidth) / 2;
                yOffset = 0;
            } else {
                renderWidth = canvas.width;
                renderHeight = images[0].height * (renderWidth / images[0].width);
                xOffset = 0;
                yOffset = (canvas.height - renderHeight) / 2;
            }
            
            ctx.drawImage(images[0], xOffset, yOffset, renderWidth, renderHeight);
        }
    
        // Additional code to handle multiple avatars can go here
    
        return canvas.toDataURL();
    };    

    const handleSave = () => {
        setIsEditing(false);
        saveModifiedChat();
    };

    return (
        <div
            title="Double Click me to Open!"
            className={`rounded-theme-border-radius object-cover bg-theme-box border-theme-border-width border-theme-border hover:bg-theme-hover-pos p-2 flex flex-col justify-start items-start relative cursor-pointer ${isDeleted? 'slide-out-left': 'slide-in-left'} ` + (selected ? "bg-theme-hover-pos" : "bg-theme-box")}
            onClick={() => {if(onClick !== undefined) onClick(chat)}} 
            onDoubleClick={()=> {if(onDoubleClick !== undefined) onDoubleClick(chat)}}
        >
            <div className="flex flex-row items-center justify-start">
                <div className="flex items-center justify-center">
                    {avatars.length > 0 ? (<img src={getImageURL(groupAvatar)} className="themed-chat-avatar"/>) : (<RiQuestionMark className="themed-chat-avatar" size={`4rem`}/>)}
                </div>
                {isEditing ? (
                    <textarea 
                        value={name}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setName(newValue);
                        }}                                                    
                        onBlur={handleSave}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSave();
                            }
                        }}
                        autoFocus
                        style={{ width: 'auto', minWidth: '30px' }}
                        className="ml-2 themed-input h-6"
                    />
                ) : (
                    <>
                        <p className="ml-2">{truncateText(name, 35)}</p>
                        {!disabled &&
                        <>
                            <button onClick={() => setIsEditing(true)} className="message-button ml-2 cursor-pointer" title="Edit Chat name">
                                <Edit2Icon size={'1rem'} />
                            </button>
                        </>}
                    </>
                )}
                {!disabled && (
                    <>
                <button className="message-button ml-2 cursor-pointer"
                    onClick={async () => {
                        setIsDeleted(true);
                        await new Promise(r => setTimeout(r, 750));
                        if(onDelete === undefined) return;
                        if(!await confirmModal(`Are you sure you want to delete this chat? This cannot be undone.`)){
                            setIsDeleted(false);
                            return;
                        }
                        onDelete(chat);
                    }}
                    title="Delete Chat"
                >
                    <TrashIcon size={'1rem'} />
                </button>
                    </>
                )}
                <div className="grid w-1/3 gap-4 absolute right-4" id="info-text">
                    <div className="flex flex-row justify-end text-right">
                        <i className={"w-full text-right" + (selected? 'text-theme-text-hover' : 'text-theme-italic')}>{getFormattedTime(chat.lastMessage?.timestamp)}</i>
                    </div>
                </div>
            </div>
        </div>
    );
     
}

export default ChatDetails;