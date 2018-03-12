import Editor, { SlateValue } from './PayloadEditor'
import { defaultOptions } from './MentionPlugin'
import initialValue from './value'
import { getEntitiesFromValue } from './utilities'
import EntityIdSerializer from './slateSerializer'
import SlateTransformer from './slateTransformer'
import { IOption } from './models'

const triggerCharacter = defaultOptions.triggerCharacter
const Utilities = {
    getEntitiesFromValue,
    updateOptionNames: SlateTransformer.updateOptionNames
}
export {
    triggerCharacter, 
    SlateValue,
    Editor,
    EntityIdSerializer,
    IOption,
    initialValue,
    Utilities
}
