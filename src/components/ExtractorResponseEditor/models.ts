export interface InternalEditorModel {
    options: IOption[]
    text: string
    customEntities: IGenericEntity<any>[]
    preBuiltEntities: IGenericEntity<any>[]
}

export interface IEntityPickerProps {
    isOverlappingOtherEntities: boolean
    isVisible: boolean
    position: IPosition
}

export interface IPosition {
    top: number
    left: number
    bottom: number
}

export interface IOption {
    id: string
    name: string
    type: string
}

export interface IGenericEntity<T> {
    startIndex: number
    endIndex: number
    data: T
}

export interface IGenericEntityData<T> {
    option: IOption,
    displayName: string,
    original: T
}

export enum NodeType {
    CustomEntityNodeType = "custom-inline-node",
    PreBuiltEntityNodeType = "prebuilt-inline-node"
}

export enum SegementType {
    Normal = "normal",
    Inline = "inline"
}

export interface ISegement {
    text: string
    startIndex: number
    endIndex: number
    type: SegementType
    data: any
}

export interface FuseResult<T> {
    item: T
    matches: FuseMatch[]
}

export interface FuseMatch {
    indices: [number, number][]
    key: string
}

export interface MatchedOption<T> {
    highlighted: boolean
    matchedStrings: MatchedString[]
    original: T
}

export interface MatchedString {
    text: string
    matched: boolean
}
