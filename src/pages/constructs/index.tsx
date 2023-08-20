
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiX } from "react-icons/fi";
import { Construct } from "@/classes/Construct";
import { getConstructs, saveNewConstruct } from "@/api/dbapi";
import ConstructBox from "@/components/construct-box";
import './construct-page.scss';
import { importTavernCharacter } from "@/api/extrasapi";
import { AiOutlineUpload } from "react-icons/ai";
import { removeAllActiveConstructs } from "@/api/constructapi";

const ConstructsPage = () => {
    const [characters, setCharacters] = useState<Construct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCharacters = characters ? characters.filter((character) => {
        return Object.values(character).some((value) =>
          value && 
          value
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
    }) : [];


    const handleImageUpload = async (files: FileList | null) => {
        if (!files) return;
        const filesArray = Array.from(files);
        
        const uploadPromises = filesArray.map(async (file) => {
            try {
                const importData = await importTavernCharacter(file);
                return importData;
            } catch (error) {
                console.error(error);
            }
        });
        await Promise.all(uploadPromises);
        window.location.reload();
    };    

    useEffect(() => {
        const retrieveCharacters = async () => {
            let retrievedChars: Construct[] = await getConstructs();
            if(retrievedChars){
                setCharacters(retrievedChars);
            }else{
                console.log('no constructs found');
                setCharacters([]);
            }
        }
        retrieveCharacters();
    }, []);

    const clearActive = async () => {
        await removeAllActiveConstructs();
        window.location.reload();
    }

    return (
        <div className="w-full h-[calc(100vh-70px)] grid grid-rows-[auto,1fr] overflow-y-auto overflow-x-hidden themed-root gap-4">
            <h2 className="text-2xl font-bold text-theme-text text-shadow-xl">Constructs</h2>
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-5 gap-0 w-15vw h-5vh">
                    <Link to="/constructs/new" className="themed-button-pos flex items-center justify-center" data-tooltip="Add New Construct">
                        <FiPlus className='absolute'size={50}/>
                    </Link>
                    <button onClick={clearActive} className="themed-button-pos flex items-center justify-center" data-tooltip="Clear Active Constructs">
                        <FiX className='absolute'size={50}/>
                    </button>
                    <label htmlFor="character-image-input" className="themed-button-pos flex items-center justify-center" data-tooltip="Import Character Card">
                        <AiOutlineUpload className='absolute'size={50}/>
                    </label>
                    <input
                        type="file"
                        accept="image/png, application/json"
                        id="character-image-input"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        style={{ display: 'none' }}
                        multiple={true}
                    />
                    {characters && 
                        <div className="construct-search-bar col-span-2">
                            <input
                            type="text"
                            placeholder="Search Constructs"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>
                    }
                </div>
                <div className="flex flex-col gap-4">
                    {Array.isArray(filteredCharacters) && filteredCharacters.map((character, index) => (
                        <ConstructBox key={index} character={character} />
                    ))}
                </div>
            </div>
        </div>
    )
};

export default ConstructsPage;