/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export enum NodeTypes {
    Mention = 'mention-inline-node',
    Optional = 'optional-inline-node'
}

export interface IOption {
    id: string
    name: string
    highlighted?: boolean
}

export interface IPickerProps {
    isVisible: boolean
    top: number
    bottom: number
    left: number
    searchText: string
}