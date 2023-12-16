import { ConnectionPreset, OAI_Model, addLLMConnectionPreset, getCurrentLLMConnectionPreset, getLLMConnectionInformation, getLLMConnectionPresets, getStatus, removeLLMConnectionPreset, setCurrentLLMConnectionPreset, setLLMConnectionInformation, setPaLMFilters, setPalmModel } from "../../../api/llmapi";
import { EndpointType } from "../../../types";
import { useEffect, useState } from "react";
import HordePanel from "../horde-panel";
import OpenAIPanel from "../openai-panel";
import PaLMPanel, { PaLMFilterType, PaLMFilters, PaLMModel, defaultPaLMFilters } from "../palm-panel";
import { Save, Trash } from "lucide-react";

interface ConnectionBoxProps {
};
const ConnectionBox = (props: ConnectionBoxProps) => {
    const [endpoint, setEndpoint] = useState<string>("");
    const [endpointType, setEndpointType] = useState<EndpointType>("Ooba");
    const [password, setPassword] = useState<string>("");
    const [status, setStatus] = useState<string>("Disconnected");
    const endpointTypes = ["Kobold", "Ooba", "Aphrodite", "TabbyAPI", "OAI", "P-OAI", "P-Claude", "PaLM", "Horde"]
    const [currentConnectionPreset, setCurrentConnectionPreset] = useState<string>("");
    const [connectionPresets, setConnectionPresets] = useState<ConnectionPreset[]>([]);
    const [connectionPresetName, setConnectionPresetName] = useState<string>("");
    const [connectionPreset, setConnectionPreset] = useState<ConnectionPreset>();
    const [selectedModel, setSelectedModel] = useState('');
    const [filters, setFilters] = useState<PaLMFilters>(defaultPaLMFilters);
    const [selectedFilter, setSelectedFilter] = useState<keyof PaLMFilters>('HARM_CATEGORY_UNSPECIFIED');
    const [selectedFilterValue, setSelectedFilterValue] = useState<PaLMFilterType>('BLOCK_NONE');
    const [models, setModels] = useState<PaLMModel[]>([]);
    const [selectedPaLMModel, setSelectedPaLMModel] = useState<string>('');
    const [selectedModelObject, setSelectedModelObject] = useState<PaLMModel | null>(null);
    const [selectedOpenAIModel, setSelectedOpenAIModel] = useState<OAI_Model>('gpt-3.5-turbo-16k');

    useEffect(() => {
        const getConnectionSettings = async () => {
            const connectionSettings = await getLLMConnectionInformation();
            setEndpoint(connectionSettings.endpoint);
            setEndpointType(connectionSettings.endpointType);
            setPassword(connectionSettings.password);
            let status = await getStatus(connectionSettings.endpoint, connectionSettings.endpointType);
            if(status?.error){
                setStatus(status.error);
            }else{
                setStatus(status.data);
            }
        }
        const getPresetInformation = async () => {
            const presets = await getLLMConnectionPresets();
            setConnectionPresets(presets);
            const current = await getCurrentLLMConnectionPreset();
            setCurrentConnectionPreset(current);
            const preset = presets.find((preset) => preset._id === current);
            if(preset){
                setConnectionPresetName(preset.name);
                setConnectionPreset(preset);
                setEndpoint(preset.endpoint);
                setEndpointType(preset.endpointType);
                setPassword(preset.password);
                setPaLMFilters(preset.palmFilters);
                setPalmModel(preset.palmModel);
            }
        }
        getPresetInformation();
        getConnectionSettings();
    }, []);

    const saveConnectionPreset = async () => {
        if(connectionPreset){
            connectionPreset.endpoint = endpoint;
            connectionPreset.endpointType = endpointType;
            connectionPreset.password = password;
            connectionPreset.palmFilters = filters;
            connectionPreset.palmModel = selectedPaLMModel;
            connectionPreset.openaiModel = selectedOpenAIModel;
            connectionPreset.name = connectionPresetName;
            connectionPreset.hordeModel = selectedModel;
            const newPresets = await addLLMConnectionPreset(connectionPreset);
            if(newPresets){
                setConnectionPresets(newPresets);
            }
        }else{
            let newPreset: ConnectionPreset = {
                _id: Date.now().toString(),
                name: connectionPresetName,
                endpoint: endpoint,
                endpointType: endpointType,
                password: password,
                palmFilters: filters,
                palmModel: selectedPaLMModel,
                hordeModel: selectedModel,
                openaiModel: selectedOpenAIModel,
            }
            const newPresets = await addLLMConnectionPreset(newPreset);
            if(newPresets){
                setConnectionPresets(newPresets);
            }
        }
    }

    useEffect(() => {
        if(connectionPreset){
            setConnectionPresetName(connectionPreset.name);
            setEndpoint(connectionPreset.endpoint);
            setEndpointType(connectionPreset.endpointType);
            setPassword(connectionPreset.password);
            setPaLMFilters(connectionPreset.palmFilters);
            setPalmModel(connectionPreset.palmModel);
            setSelectedOpenAIModel(connectionPreset.openaiModel);
        }else{
            setConnectionPresetName("");
            setEndpoint("");
            setEndpointType("Ooba");
            setPassword("");
            setPaLMFilters(defaultPaLMFilters);
            setPalmModel("");
            setSelectedOpenAIModel('gpt-3.5-turbo-16k');
        }
    }, [connectionPreset]);

    const selectConnectionPreset = async (preset: ConnectionPreset) => {
        setCurrentConnectionPreset(preset._id);
        setConnectionPresetName(preset.name);
        setConnectionPreset(preset);
        setEndpoint(preset.endpoint);
        setEndpointType(preset.endpointType);
        setPassword(preset.password);
        setPaLMFilters(preset.palmFilters);
        setPalmModel(preset.palmModel);
        setSelectedOpenAIModel(preset.openaiModel);
        setCurrentLLMConnectionPreset(preset._id);
        setLLMConnectionInformation(preset.endpoint, preset.endpointType, preset.password);
    }

    const saveEndpoint = async () => {
        await setLLMConnectionInformation(endpoint, endpointType, password);
    }

    const connect = async () => {
        let status = await getStatus(endpoint, endpointType);
        setStatus(status);
    }

    useEffect(() => {
        try{
            if(endpoint !== ""){
                connect();
            }
        }catch(e){
            setStatus("Disconnected");
        }
    }, [endpoint, endpointType, password]);

    return (
        <div className="flex flex-col w-full text-left gap-2">
            <div className="flex flex-col w-full text-left gap-2">
                <label className="text-theme-text text-shadow-xl font-semibold">Connection Preset Name</label>
                <div className="flex flex-row w-full gap-2">
                    <input className="themed-input w-full flex-grow"
                        value={connectionPresetName}
                        onChange={(e) => setConnectionPresetName(e.target.value)}
                    />
                    <button className="themed-button-pos justify-center items-center flex"
                        onClick={() => {
                            saveConnectionPreset();
                        }}
                    >
                        <Save/>
                    </button>
                    <button className="themed-button-neg justify-center items-center flex"
                        onClick={() => {
                            setConnectionPresetName("");
                            setConnectionPreset(undefined);
                            setCurrentConnectionPreset("");
                            setCurrentLLMConnectionPreset("");
                            removeLLMConnectionPreset(connectionPresets.find((preset) => preset._id === currentConnectionPreset) as ConnectionPreset);
                            setConnectionPresets(connectionPresets.filter((preset) => preset._id !== currentConnectionPreset));
                        }}
                    >
                        <Trash/>
                    </button>
                </div>
                <label className="text-theme-text text-shadow-xl font-semibold">Select Preset</label>
                <select className="themed-input w-full"
                    value={currentConnectionPreset}
                    onChange={(e) => {
                        if(e.target.value === ''){
                            setConnectionPresetName("");
                            setConnectionPreset(undefined);
                            setCurrentConnectionPreset("");
                            setCurrentLLMConnectionPreset("");
                            return;
                        }
                        selectConnectionPreset(connectionPresets.find((preset) => preset._id === e.target.value) as ConnectionPreset);
                    }}
                >   
                    <option className='themed-input' key={''} value={''}>None</option>
                    {connectionPresets.map((preset) => {
                        return <option className='themed-input' key={preset._id} value={preset._id}>{preset.name}</option>
                    })}
                </select>
            </div>
            <div className="flex flex-col w-full text-left">
                <label className="text-theme-text text-shadow-xl font-semibold">Endpoint Type</label>
                <select className="themed-input w-full"
                    value={endpointType}
                    onChange={(e) => setEndpointType(e.target.value as EndpointType)}
                >
                    {endpointTypes.map((key) => {
                        return <option className='themed-input' key={key} value={key}>{key}</option>
                    })}
                </select>
            </div>
            <div className="flex flex-col w-full text-left">
                <label className="text-theme-text text-shadow-xl font-semibold">Endpoint</label>
                <input className="themed-input w-full"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                />
            </div>
            {endpointType === "P-OAI" || endpointType === "P-Claude" || endpointType === "Aphrodite" || endpointType === "TabbyAPI" ? (
                <div className="flex flex-col w-full text-left">
                    <label className="text-theme-text text-shadow-xl font-semibold">Password</label>
                    <input className="themed-input w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            ) : null}
            <button className="themed-button-pos w-full"
                onClick={() => {
                    saveEndpoint();
                    connect();
                }}
            >
                Connect and Save
            </button>
            {(endpointType === "OAI" || endpointType === "P-OAI") && (
                <OpenAIPanel selectedModel={selectedOpenAIModel} setSelectedModel={setSelectedOpenAIModel}/>
            )}
            {endpointType === "Horde" && (
                <HordePanel selectedModel={selectedModel} setSelectedModel={setSelectedModel}/>
            )}
            {endpointType === "PaLM" && (
                <PaLMPanel endpoint={endpoint} selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} selectedFilterValue={selectedFilterValue} setSelectedFilterValue={setSelectedFilterValue} selectedModel={selectedPaLMModel} setSelectedModel={setSelectedPaLMModel} setFilters={setFilters} filters={filters} selectedModelObject={selectedModelObject} setSelectedModelObject={setSelectedModelObject} models={models} setModels={setModels}/>
            )}
            <div className="flex flex-col w-full text-left">
                <label className="text-theme-text text-shadow-xl font-semibold">Status</label>
                <input className="themed-input w-full flex-grow"
                    value={status}
                    readOnly
                />
            </div>
        </div>
    );
};
export default ConnectionBox;