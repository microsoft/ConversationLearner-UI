/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { TextAction, EntityBase, Memory } from '@conversationlearner/models'
import * as Util from '../../Utils/util'
import TextPayloadRenderer from './TextPayloadRenderer'

interface Props {
    textAction: TextAction
    entities: EntityBase[]
    // TODO: Find better alternative than null
    // When memories is null it's assumed parent doesn't have access to it and intends to fallback to the entity names
    memories: Memory[] | null
}

export default class Component extends React.Component<Props, {}> {
    render() {
        const { entities, memories, textAction } = this.props
        const defaultEntityMap = Util.getDefaultEntityMap(entities)
        
        let renderStringUsingEntityNames: string
        try {
            renderStringUsingEntityNames = textAction.renderValue(defaultEntityMap, { preserveOptionalNodeWrappingCharacters: true })
        }
        catch (error) {
            // Show raw payload as fallback
            renderStringUsingEntityNames = JSON.parse(textAction.payload).text
        }
        const renderStringUsingCurrentMemory = memories === null
            ? null
            : textAction.renderValue(Util.createEntityMapFromMemories(entities, memories), { fallbackToOriginal: true })

        return (<TextPayloadRenderer
            original={renderStringUsingEntityNames}
            currentMemory={renderStringUsingCurrentMemory}
        />)
    }
}