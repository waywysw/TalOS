import { Construct } from "../../classes/Construct";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { RiQuestionMark } from "react-icons/ri";
import './ConstructBox.scss';
import { deleteConstruct, getConstruct } from "../../api/dbapi";
import { setConstructAsPrimary, addConstructToActive, constructIsActive, getActiveConstructList, removeConstructFromActive } from "../../api/constructapi";
import StringArrayEditorCards from "../string-array-editor-cards";
import { saveTavernCardAsImage } from "../../api/extrasapi";
import { Download, Edit, Trash } from "lucide-react";
import { confirmModal } from "../confirm-modal";
import QuickChatCongfig from "./construct-quick-chat-config";
import TokenTextarea from "../token-textarea";
import { getImageURL } from "../../api/baseapi";
interface Props {
    character: Construct;
    onCharacterDelete: (character: Construct) => void;
    onCharacterEdit: (character: Construct) => void;
    onEditStatus: () => void;
}
const ConstructBox: React.FC<Props> = ({character, onCharacterDelete, onCharacterEdit, onEditStatus}) => {
    const [characterName, setCharacterName] = useState<string>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isPrimary, setIsPrimary] = useState<boolean>(false);
    const [authorsNote, setAuthorsNote] = useState<string>('');
    const [characterRelationships, setCharacterRelationships] = useState<string[]>([]);
    const [characterInterests, setCharacterInterests] = useState<string[]>([]);
    const [characterGreetings, setCharacterGreetings] = useState<string[]>([]);
    const [characterFarewells, setCharacterFarewells] = useState<string[]>([]);
    const [characterPersonality, setCharacterPersonality] = useState<string>('');
    const [characterBackground, setCharacterBackground] = useState<string>('');

    useEffect(() => {
        setCharacterName(character.name);
        const getActiveStatus = async () => {
            let activeConstructs = await getActiveConstructList();
            let status = false;
            for(let i = 0; i < activeConstructs.length; i++){
                if(activeConstructs[i] === character._id){
                    status = true;
                }
            }
            setIsActive(status);
        }
        const getPrimaryStatus = async () => {
            getActiveConstructList().then((constructs) => {
                if(constructs.length > 0){
                    if(constructs[0] === character._id){
                        setIsPrimary(true);
                    } else {
                        setIsPrimary(false);
                    }
                }
            }).catch((err) => {
                console.error(err);
            });
        }
        getPrimaryStatus();
        getActiveStatus();
        setAuthorsNote(character.authorsNote);
        setCharacterRelationships(character.relationships);
        setCharacterInterests(character.interests);
        setCharacterGreetings(character.greetings);
        setCharacterFarewells(character.farewells);
        setCharacterPersonality(character.personality);
        setCharacterBackground(character.background);
    }, [character]);

    const deleteConstructFrom = async () => {
        if(!await confirmModal(`Are you sure you want to delete this construct? This cannot be undone.`)) return;
        await deleteConstruct(character._id);
        onCharacterDelete(character);
        onEditStatus();
    }

    const makeActive = async () => {
        await addConstructToActive(character._id);
        setIsActive(true);
        setIsPrimary(false);
        onEditStatus();
    }

    const makePrimary = async () => {
        await setConstructAsPrimary(character._id);
        setIsPrimary(true);
        setIsActive(true);
        onEditStatus();
    }

    const makeInactive = async () => {
        await removeConstructFromActive(character._id);
        setIsActive(false);
        setIsPrimary(false);
        onEditStatus();
    }

    useEffect(() => {
        if(localStorage.getItem(characterName+'-expanded')){
            let state = JSON.parse(localStorage.getItem(characterName+'-expanded')?.toString() || '{}');
            if(state.isExpanded === true){
                setIsOpen(true);
            }
        }
    }, [characterName]);

    useEffect(() => {
        localStorage.setItem(characterName+'-expanded', JSON.stringify({isExpanded: isOpen}));
    }, [isOpen, characterName]);

    const handleConstructExport = async () => {
        if(character === null) return;
        const url = await saveTavernCardAsImage(character);
        const element = document.createElement("a");
        element.href = url;
        element.download = `${character.name}.ConstructOS.png`;
        document.body.appendChild(element);
        element.click();
    }

    return (
        <div className="themed-root h-calc(100vh/6) w-full justify-center pop-in">
            <div className="text-2xl font-bold z-10 flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex flex-row gap-2 justify-center items-center">
                    {!isOpen ? (
                    <div>
                        {character && (character.avatar === '' ? <RiQuestionMark className="themed-message-avatar"/> : <img id={character._id} src={getImageURL(character.avatar)} alt={characterName} className="themed-message-avatar"/>)}
                    </div>
                    ): null}
                    {characterName}
                </div>
                <button onClick={() => setIsOpen(!isOpen)} data-tooltip={isOpen ? `Collapse ${characterName} details.` : `Expand ${characterName} details.`}>
                    {isOpen ? <AiOutlineUp/> : <AiOutlineDown/>}
                </button>
            </div>
            {isOpen && character && (
            <div className="grid grid-cols-5 gap-2">
                <div className="col-span-1 flex flex-col text-left items-center">
                    <Link to={`/constructs/${character._id}`}>
                        {character && (character.avatar === '' ? <RiQuestionMark className="construct-image-default"/> : <img id={character._id} src={getImageURL(character.avatar)} alt={characterName} className="agent-image-default cursor-pointer object-fit rounded-theme-border-radius"/>)}
                    </Link>
                    <i className="mt-4 font-semibold text-left w-full">
                        {character.nickname}
                    </i>
                    <div className="text-left w-full">
                        <b>Construct Status:</b> {isActive ? <span className="text-theme-flavor-text font-bold">Active</span> : <span className="text-theme-hover-neg font-bold">Inactive</span>}{isActive && <span className="text-theme-flavor-text font-bold"> + {isPrimary ? 'Primary': 'Secondary'}</span>}
                    </div>
                </div>
                <div className="col-span-4 grid-cols-3 gap-2 grid justify-start w-full">
                    <div className="col-span-1 flex flex-col justify-start items-start">
                        <label className="text-xl font-semibold text-left">User Actions</label>
                        <div className="w-full h-1/2 overflow-hidden">
                            <div className="grid grid-rows-2 h-full gap-1">
                                <div className="row-span-1 flex flex-row gap-1">
                                    <button disabled={isPrimary} className="w-1/3 themed-button-pos" onClick={() => makePrimary()}>Set as Primary Construct</button>
                                    <button disabled={isActive && !isPrimary} className="w-1/3 themed-button-pos" onClick={() => makeActive()}>Add as Secondary Construct</button>
                                    <button className="themed-button-neg w-1/3" onClick={() => makeInactive()}>Remove Active Construct</button>
                                </div>
                                <div className="row-span-1 flex flex-row gap-1">
                                    <Link to={`/constructs/${character._id}`} className="w-1/3 themed-button-pos flex justify-center items-center" title="Edit">
                                        <Edit size={36}/>
                                    </Link>
                                    <button className="themed-button-neg w-1/3 flex justify-center items-center" onClick={() => deleteConstructFrom()}><Trash size={36}/></button>
                                    <button title="Export as V2 Card" className="themed-button-pos w-1/3 flex flex-col items-center justify-center" onClick={() => handleConstructExport()}><Download size={36}/></button>
                                </div>
                            </div>
                        </div>
                        <label className="text-xl font-semibold text-left">Quick Config</label>
                        <div className="w-full h-1/2 overflow-hidden themed-input">
                            <QuickChatCongfig
                                construct={character}
                                onEdit={(construct: Construct) => {onCharacterEdit(construct)}}
                            />
                        </div>
                    </div>
                    <div className="col-span-1 flex flex-col justify-start items-start">
                        <label className="text-xl font-semibold text-left">Personality</label>
                        <TokenTextarea
                            className="overflow-hidden w-full h-1/3 themed-input flex-grow"
                            value={characterPersonality}
                            onChange={(string) => setCharacterPersonality(string)}
                            disabled={true}
                        />
                        <label className="text-xl font-semibold text-left">Background</label>
                        <TokenTextarea
                            className="overflow-hidden w-full h-1/3 themed-input flex-grow"
                            value={characterBackground}
                            onChange={(string) => setCharacterBackground(string)}
                            disabled={true}
                        />
                        <label className="text-xl font-semibold text-left">Author's Note</label>
                        <TokenTextarea
                            className="overflow-hidden w-full h-1/3 themed-input flex-grow"
                            value={authorsNote}
                            onChange={(string) => setAuthorsNote(string)}
                            disabled={true}
                        />
                    </div>
                    <div className="col-span-1 flex flex-col justify-start">
                        <label className="text-xl font-semibold text-left">Relationships</label>
                        <div className="w-full h-1/4 overflow-hidden text-left">
                            <StringArrayEditorCards
                                value={characterRelationships}
                                onChange={(array) => setCharacterRelationships(array)}
                                disabled={true}
                            />
                        </div>
                        <label className="text-xl font-semibold text-left">Interests</label>
                        <div className="w-full h-1/4 overflow-hidden">
                            <StringArrayEditorCards
                                value={characterInterests}
                                onChange={(array) => setCharacterInterests(array)}
                                disabled={true}
                            />
                        </div>
                        <label className="text-xl font-semibold text-left">Greetings</label>
                        <div className="w-full h-1/4 overflow-hidden">
                            <StringArrayEditorCards
                                value={characterGreetings}
                                onChange={(array) => setCharacterGreetings(array)}
                                disabled={true}
                            />
                        </div>
                        <label className="text-xl font-semibold text-left">Farewells</label>
                        <div className="w-full h-1/4 overflow-hidden">
                            <StringArrayEditorCards
                                value={characterFarewells}
                                onChange={(array) => setCharacterFarewells(array)}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    )
}
export default ConstructBox;