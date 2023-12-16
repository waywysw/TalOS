interface Styles {
    // You've indicated "[...]", so you need to define its structure.
    // I'll use a placeholder for now. Update it with actual structure.
    [key: string]: any;
}
  
interface OverrideSettings {
    // The structure inside "Override Settings" isn't provided.
    // Use a placeholder for now. Update it with actual structure.
    [key: string]: any;
}
  
interface ScriptArgs {
    // You've indicated "{...}", so you need to define its structure.
    // I'll use a placeholder for now. Update it with actual structure.
    [key: string]: any;
}
  
interface AlwaysonScripts {
    // The structure inside "Alwayson Scripts" isn't provided.
    // Use a placeholder for now. Update it with actual structure.
    [key: string]: any;
}
  
export interface StableDiffusionProcessingTxt2Img {
    enable_hr?: boolean;
    denoising_strength?: number;
    firstphase_width?: number;
    firstphase_height?: number;
    hr_scale?: number;
    hr_upscaler?: string;
    hr_second_pass_steps?: number;
    hr_resize_x?: number;
    hr_resize_y?: number;
    hr_sampler_name?: string;
    hr_prompt?: string;
    hr_negative_prompt?: string;
    prompt?: string;
    styles?: Styles[];
    seed?: number;
    subseed?: number;
    subseed_strength?: number;
    seed_resize_from_h?: number;
    seed_resize_from_w?: number;
    sampler_name?: string;
    batch_size?: number;
    n_iter?: number;
    steps?: number;
    cfg_scale?: number;
    width?: number;
    height?: number;
    restore_faces?: boolean;
    tiling?: boolean;
    do_not_save_samples?: boolean;
    do_not_save_grid?: boolean;
    negative_prompt?: string;
    eta?: number;
    s_min_uncond?: number;
    s_churn?: number;
    s_tmax?: number;
    s_tmin?: number;
    s_noise?: number;
    override_settings?: OverrideSettings;
    override_settings_restore_afterwards?: boolean;
    script_args?: ScriptArgs[];
    sampler_index?: string;
    script_name?: string;
    send_images?: boolean;
    save_images?: boolean;
    alwayson_scripts?: AlwaysonScripts;
}

export type TavernCardV1 = {
    name: string
    description: string
    personality: string
    scenario: string
    first_mes: string
    mes_example: string
}

export type TavernCardV2 = {
    spec: 'chara_card_v2'
    spec_version: '2.0' // May 8th addition
    data: {
      name: string
      description: string
      personality: string
      scenario: string
      first_mes: string
      mes_example: string
  
      // New fields start here
      creator_notes: string
      system_prompt: string
      post_history_instructions: string
      alternate_greetings: Array<string>
      character_book?: CharacterBook
  
      // May 8th additions
      tags: Array<string>
      creator: string
      character_version: string
      extensions: Record<string, any> // see details for explanation
    }
}
  
/**
 * ? as in `name?: string` means the `name` property may be absent from the JSON
 * (aka this property is optional)
 * OPTIONAL PROPERTIES ARE ALLOWED TO BE UNSUPPORTED BY EDITORS AND DISREGARDED BY
 * FRONTENDS, however they must never be destroyed if already in the data.
 *
 * the `extensions` properties may contain arbitrary key-value pairs, but you are encouraged
 * to namespace the keys to prevent conflicts, and you must never destroy
 * unknown key-value pairs from the data. `extensions` is mandatory and must
 * default to `{}`. `extensions` exists for the character book itself, and for
 * each entry.
 **/

export type CharacterBook = {
    name?: string
    description?: string
    scan_depth?: number // agnai: "Memory: Chat History Depth"
    token_budget?: number // agnai: "Memory: Context Limit"
    recursive_scanning?: boolean // no agnai equivalent. whether entry content can trigger other entries
    extensions: Record<string, any>
    entries: Array<{
        keys: Array<string>
        content: string
        extensions: Record<string, any>
        enabled: boolean
        insertion_order: number // if two entries inserted, lower "insertion order" = inserted higher
        case_sensitive?: boolean

        // FIELDS WITH NO CURRENT EQUIVALENT IN SILLY
        name?: string // not used in prompt engineering
        priority?: number // if token budget reached, lower priority value = discarded first

        // FIELDS WITH NO CURRENT EQUIVALENT IN AGNAI
        id?: number // not used in prompt engineering
        comment?: string // not used in prompt engineering
        selective?: boolean // if `true`, require a key from both `keys` and `secondary_keys` to trigger the entry
        secondary_keys?: Array<string> // see field `selective`. ignored if selective == false
        constant?: boolean // if true, always inserted in the prompt (within budget limit)
        position?: 'before_char' | 'after_char' // whether the entry is placed before or after the character defs
    }>
}

export interface Settings {
    rep_pen: number;
    rep_pen_range: number;
    temperature: number;
    sampler_order: number[];
    top_k: number;
    top_p: number;
    top_a: number;
    tfs: number;
    typical: number;
    singleline: boolean;
    sampler_full_determinism: boolean;
    max_length: number;
    min_length: number;
    max_context_length: number;
    max_tokens: number;
    presence_penalty: number;
    frequency_penalty: number;
    mirostat_mode: number;
    mirostat_tau: number;
    mirostat_eta: number;
}
export type EndpointType = 'Kobold' | 'Ooba' | 'OAI' | 'Horde' | 'P-OAI' | 'P-Claude' | 'PaLM' | 'Aphrodite' | 'TabbyAPI';

export interface LLMConnectionInformation {
    endpoint: string, 
    endpointType: EndpointType, 
    password: string, 
    settings: Settings,
    hordeModel: string,
    stopBrackets: boolean,
}

export type CompletionType = 'code' | 'novel' | 'song' | 'script' | 'other';

export const emotions = [
    {
        value: 'admiration',
        label: 'Admiration'
    },
    {
        value: 'amusement',
        label: 'Amusement'
    },
    {
        value: 'anger',
        label: 'Anger'
    },
    {
        value: 'annoyance',
        label: 'Annoyance'
    },
    {
        value: 'approval',
        label: 'Approval'
    },
    {
        value: 'caring',
        label: 'Caring'
    },
    {
        value: 'confusion',
        label: 'Confusion'
    },
    {
        value: 'curiosity',
        label: 'Curiosity'
    },
    {
        value: 'desire',
        label: 'Desire'
    },
    {
        value: 'disappointment',
        label: 'Disappointment'
    },
    {
        value: 'disapproval',
        label: 'Disapproval'
    },
    {
        value: 'disgust',
        label: 'Disgust'
    },
    {
        value: 'embarrassment',
        label: 'Embarrassment'
    },
    {
        value: 'fear',
        label: 'Fear'
    },
    {
        value: 'gratitude',
        label: 'Gratitude'
    },
    {
        value: 'grief',
        label: 'Grief'
    },
    {
        value: 'joy',
        label: 'Joy'
    },
    {
        value: 'love',
        label: 'Love'
    },
    {
        value: 'nervousness',
        label: 'Nervousness'
    },
    {
        value: 'neutral',
        label: 'Neutral'
    },
    {
        value: 'optimism',
        label: 'Optimism'
    },
    {
        value: 'pride',
        label: 'Pride'
    },
    {
        value: 'realization',
        label: 'Realization'
    },
    {
        value: 'relief',
        label: 'Relief'
    },
    {
        value: 'remorse',
        label: 'Remorse'
    },
    {
        value: 'sadness',
        label: 'Sadness'
    },
    {
        value: 'surprise',
        label: 'Surprise'
    },
    {
        value: 'excitement',
        label: 'Excitement'
    }
]

export type Emotion = 'surprise' | 'sadness' | 'remorse' | 'relief' | 'realization' | 'pride' | 'optimism' | 'neutral' | 'nervousness' | 'love' | 'joy' | 'grief' | 'gratitude' | 'fear' | 'embarrassment' | 'disgust' | 'disapproval' | 'disappointment' | 'desire' | 'curiosity' | 'confusion' | 'caring' | 'approval' | 'annoyance' | 'anger' | 'amusement' | 'admiration' | 'excitement';

export const spriteSetTypes = [
    {
        value: 'everyday',
        label: 'Everyday'
    },
    {
        value: 'formal',
        label: 'Formal'
    },
    {
        value: 'sleepwear',
        label: 'Sleepwear'
    },
    {
        value: 'swimwear',
        label: 'Swimwear'
    },
    {
        value: 'underwear',
        label: 'Underwear'
    },
    {
        value: 'naked',
        label: 'Naked'
    },
    {
        value: 'battle',
        label: 'Battle'
    },
    {
        value: 'winter',
        label: 'Winter',
    },
    {
        value: 'halloween',
        label: 'Halloween'
    },
    {
        value: 'christmas',
        label: 'Christmas'
    }
]

export const narrativeRoles = [
    {
        value: 'protagonist',
        label: 'Protagonist'
    },
    {
        value: 'antagonist',
        label: 'Antagonist'
    },
    {
        value: 'supporting',
        label: 'Supporting'
    },
    {
        value: 'neutral',
        label: 'Neutral'
    },
    {
        value: 'other',
        label: 'Other'
    },
    {
        value: 'love interest',
        label: 'Love Interest'
    },
    {
        value: 'mentor',
        label: 'Mentor'
    },
    {
        value: 'sidekick',
        label: 'Sidekick'
    },
    {
        value: 'villain',
        label: 'Villain'
    },
    {
        value: 'friend',
        label: 'Friend'
    },
];