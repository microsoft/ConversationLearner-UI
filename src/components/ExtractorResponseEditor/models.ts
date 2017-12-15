export interface ExtractResponse {
    text: string;
    predictedEntities: PredictedEntity[]
}

export interface PredictedEntity {
    startCharIndex: number
    endCharIndex: number
    entityId: string
    entityName: string
    entityText: string
    // TODO: PredictedEntities have entityType but it is not in blis-models so adding it here breaks compatibility
    // entityType: string 
    resolution: {}
    builtinType: string
}

export interface EntityBase {
    entityId: string
    entityName: string
    entityType: string
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
    matchedStrings: MatchedString[]
    original: T
}

export interface MatchedString {
    text: string
    matched: boolean
}
