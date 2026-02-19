export interface coassembleType {
    id: number
    title: string
    description: string
    image: string
    thumbnail: string
    start: Start
    finish: Finish
    theme: Theme
    screens: Screen[]
    active: boolean
    identified: boolean
    private: boolean
    key: string
    source: string
    emails: any
}

export interface Start {
    start: boolean
    finish: boolean
    legacy: boolean
    overlay: number
    display_button: boolean
    display_description: boolean
    display_duration: boolean
    display_pattern: boolean
    text_alignment: string
    button_label: string
    button_style: string
    mode: string
    layout: string
    title_colour: string
    title_size: string
    duration: string
    image: string
    image_path: string
    image_alt: string
    image_offset: any
    drag_index: number
    bg_colour: any
    image_mode: string
    link_type: string
    text_colour: string
}

export interface Finish {
    title: string
    description: string
    asset: string
    finish: boolean
    legacy: boolean
    overlay: number
    text_alignment: string
    bg_colour: any
    display_title: boolean
    display_description: boolean
    display_button: boolean
    display_pattern: boolean
    display_feedback: boolean
    display_confetti: boolean
    confetti_style: string
    button_label: string
    button_style: string
    link_url: string
    link_type: string
    layout: string
    mode: string
    title_colour: string
}

export interface Theme {
    preset: string
    font: string
    colours: Colours
}

export interface Colours {
    standard: Standard
    cover: Cover
}

export interface Standard {
    primary: string
    headings: string
    background: string
}

export interface Cover {
    primary: string
    headings: string
    background: string
    pattern: string
}

export interface Screen {
    id: number
    sequence: number
    title: string
    description?: string
    type: Type
    object: Object
    questions: any[]
    asset?: string
    asset_alt_text: any
    completed: boolean
}

export interface Type {
    id: number
    name: string
    title: string
    icon: string
    completable: number
    premium: boolean
    caps: any
}

export interface Object {
    elements?: Element[]
    legacy?: boolean
    display_image?: boolean
    display_title: boolean
    display_description?: boolean
    display_image_title?: boolean
    display_image_description?: boolean
    display_background_colour?: boolean
    text_alignment?: string
    smart_colour: any
    title_size: any
    title_colour?: string
    title_alignment: any
    bg_colour?: string
    link_type: any
    link_title: any
    link_url: any
    link_module: any
    display_duration: any
    display_button: any
    display_pattern: any
    duration: any
    drag_index?: number
    mode?: string
    layout?: string
    image?: string
    image_mode?: string
    button_style: any
    button_colour: any
    text_colour: any
    button_label: any
    image_position: any
    image_offset: any
    overlay?: number
    stage_colour: any
    show_numbers: any
    show_step_heading: any
    step_heading_text: any
    variant: any
    slide_size: any
}

export interface Element {
    image: string
    image_position?: string
    image_alt?: string
    image_source: any
    image_offset: any
    title: string
    title_size: any
    description?: string
    desc_size: any
    drag_index?: number
    mode?: string
    image_mode?: string
    title_colour: any
    title_alignment: any
    card_back?: string
    btn_text: any
    colour?: string
    ratio?: number
    offset_x?: number
    offset_y?: number
    display_image: any
    display_title: any
    display_description: any
    display_background_colour: any
}
