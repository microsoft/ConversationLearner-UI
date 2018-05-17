import * as React from 'react'
import { TextAction, EntityBase, Memory } from '@conversationlearner/models'
import * as Util from '../../util'
import TextPayloadRenderer from './TextPayloadRenderer'

interface Props {
    textAction: TextAction
    entities: EntityBase[]
    memories: Memory[] | null
}

export default class Component extends React.Component<Props, {}> {
    render() {
        const { entities, memories, textAction } = this.props
        const currentEntityMap = Util.createEntityMapFromMemories(entities, memories)
        const defaultEntityMap = Util.getDefaultEntityMap(entities)
        const renderStringUsingEntityNames = textAction.renderValue(defaultEntityMap, { preserveOptionalNodeWrappingCharacters: true })
        const renderStringUsingCurrentMemory = textAction.renderValue(currentEntityMap, { fallbackToOriginal: true })

        return <TextPayloadRenderer
            original={renderStringUsingEntityNames}
            currentMemory={renderStringUsingCurrentMemory}
        />
    }
}