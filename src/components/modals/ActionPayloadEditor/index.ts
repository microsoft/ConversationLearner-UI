import Editor, { SlateValue } from './PayloadEditor'
import { defaultOptions } from './MentionPlugin'
import initialValue from './value'
import { getEntitiesFromValue } from './utilities'
import { IOption } from './models'

const triggerCharacter = defaultOptions.triggerCharacter
const Utilities = {
    getEntitiesFromValue
}
export {
    triggerCharacter, 
    SlateValue,
    Editor,
    IOption,
    initialValue,
    Utilities
}
