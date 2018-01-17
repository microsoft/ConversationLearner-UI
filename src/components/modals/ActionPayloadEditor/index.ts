import Editor, { SlateValue } from './PayloadEditor'
import { defaultOptions } from './MentionPlugin'
import initialValue from './value'
import { getEntitiesFromValue, createTextValue } from './utilities'
import { IOption } from './models'

const triggerCharacter = defaultOptions.triggerCharacter
const Utilities = {
    getEntitiesFromValue,
    createTextValue
}
export {
    triggerCharacter, 
    SlateValue,
    Editor,
    IOption,
    initialValue,
    Utilities
}
