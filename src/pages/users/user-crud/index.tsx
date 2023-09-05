import { saveNewUser, updateUser } from "@/api/dbapi";
import { User } from "@/classes/User";
import Loading from "@/components/loading";
import StringArrayEditorCards from "@/components/string-array-editor-cards";
import { useEffect, useState } from "react";
import { RiQuestionMark } from "react-icons/ri";

interface UserCrudProps {
    user: User | null;
    onSave?: (user: User) => void;
    onEdit?: (user: User) => void;
    onDelete?: (user: User) => void;
}

const UserCrud = (props: UserCrudProps) => {
    const { user, onSave, onDelete, onEdit } = props;
    const [userName, setUserName] = useState<string>('');
    const [userImage, setUserImage] = useState<string>('');
    const [userNickname, setUserNick] = useState<string>('');
    const [userBackground, setUserBackground] = useState<string>('');
    const [userPersonality, setUserPersonality] = useState<string>('');
    const [userInterests, setUserInterests] = useState<string[]>(['']);
    const [userRelationships, setUserRelationships] = useState<string[]>(['']);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        if(user) {
            setUserName(user.name);
            setUserImage(user.avatar);
            setUserNick(user.nickname);
            setUserBackground(user.background);
            setUserPersonality(user.personality);
            setUserInterests(user.interests);
            setUserRelationships(user.relationships);
            setCurrentUser(user)
        }else{
            setUserBackground('');
            setUserImage('');
            setUserName('');
            setUserNick('');
            setUserPersonality('');
            setUserRelationships(['']);
            setUserInterests(['']);
        }
    }, [user]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setUserImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUserUpdate = async () => {
        if(user) {
            user.name = userName;
            user.avatar = userImage;
            user.nickname = userNickname;
            user.background = userBackground;
            user.personality = userPersonality;
            user.interests = userInterests;
            user.relationships = userRelationships;
            await updateUser(user);
            if(onEdit === undefined) return;
            onEdit(user);
        }else{
            const newUser = new User()
            newUser.name = userName;
            newUser.avatar = userImage;
            newUser.nickname = userNickname;
            newUser.background = userBackground;
            newUser.personality = userPersonality;
            newUser.interests = userInterests;
            newUser.relationships = userRelationships;
            await saveNewUser(newUser);
            setCurrentUser(newUser);
            if(onSave === undefined) return;
            onSave(newUser);
        }
    }

    const handleUserDelete = async () => {
        if(user) {
            if(onDelete === undefined) return;
            onDelete(user);
            setCurrentUser(null);
        }else{
            setUserBackground('');
            setUserImage('');
            setUserName('');
            setUserNick('');
            setUserPersonality('');
            setUserRelationships(['']);
            setUserInterests(['']);
        }
    }

    const makeCurrentUser = async () => {
        if(currentUser !== null) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser._id));
        }
    }

    return (
        <div className="themed-root gap-2 h-full overflow-y-auto flex flex-col">
            <div className="w-full h-full grid grid-cols-3 justify-start gap-4">
                <div className="col-span-1 flex flex-col gap-4 h-full text-left">
                    <div className="flex flex-col items-center justify-center h-3/6">
                        <label htmlFor="image-upload">
                            {userImage === '' ? <RiQuestionMark className="user-image-default"/> : <img src={userImage} alt={userName} className="user-image"/>}
                        </label>
                        <input 
                            type="file" 
                            required={true}
                            id="image-upload" 
                            className="hidden" 
                            accept=".png, .jpg, .jpeg"
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div className="flex flex-col w-full h-1/12">
                        <label htmlFor="user-role" className="font-semibold">Name</label>
                        <input
                            type="text"
                            required={true}
                            id="user-name"
                            className="themed-input w-full"
                            value={userName}
                            onChange={(event) => setUserName(event.target.value)}
                        />
                    </div>
                    <div className="flex flex-col flex-grow-0 w-full h-1/12">
                        <label htmlFor="user-role" className="font-semibold">Nickname</label>
                        <input
                            type="text"
                            required={false}
                            id="user-role"
                            className="themed-input w-full"
                            value={userNickname}
                            onChange={(event) => setUserNick(event.target.value)}
                        />
                    </div>
                    <div className="flex flex-col flex-grow-0 w-full h-1/6">
                        <label htmlFor="user-role" className="font-semibold">Background</label>
                        <textarea
                            required={false}
                            id="user-role"
                            className="themed-input w-full h-full"
                            value={userBackground}
                            onChange={(event) => setUserBackground(event.target.value)}
                        />
                    </div>
                </div>
                <div className="col-span-2 flex flex-col gap-4 h-full w-full text-left">
                    <div className="flex flex-col flex-grow-0 w-full h-1/4">
                        <label htmlFor="user-role" className="font-semibold">Personality</label>
                        <textarea
                            required={false}
                            id="user-role"
                            className="themed-input w-full h-full"
                            value={userPersonality}
                            onChange={(event) => setUserPersonality(event.target.value)}
                        />
                    </div>
                    <div className="flex flex-col flex-grow-0 w-full h-1/4">
                        <label htmlFor="user-role" className="font-semibold">Interests</label>
                        <StringArrayEditorCards
                            value={userInterests}
                            onChange={setUserInterests}
                        />
                    </div>
                    <div className="flex flex-col flex-grow-0 w-full h-1/4">
                        <label htmlFor="user-role" className="font-semibold">Relationships</label>
                        <StringArrayEditorCards
                            value={userInterests}
                            onChange={setUserInterests}
                        />
                    </div>
                    <div className="flex flex-col flex-grow-0 w-full h-1/4">
                        <div className="flex flex-row gap-1 h-1/2">
                            <button className="themed-button-pos w-1/2" onClick={handleUserUpdate}>Save</button>
                            <button className="themed-button-neg w-1/2" onClick={handleUserDelete}>{user !== null ? 'Delete' : 'Clear'}</button>
                        </div>
                        {currentUser !== null ? (
                            <button className="themed-button-pos w-full h-1/2" onClick={makeCurrentUser}>Set as Current User</button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
};
export default UserCrud;