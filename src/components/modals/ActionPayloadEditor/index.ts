/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import Editor, { SlateValue } from './PayloadEditor'
import { defaultOptions } from './MentionPlugin'
import initialValue from './value'
import { getEntitiesFromValue } from './utilities'
import SlateTransformer from './slateTransformer'
import { IOption } from './APEModels'

const triggerCharacter = defaultOptions.triggerCharacter
const Utilities = {
    getEntitiesFromValue,
    updateOptionNames: SlateTransformer.updateOptionNames
}
export {
    triggerCharacter, 
    SlateValue,
    Editor,
    IOption,
    initialValue,
    Utilities
}
