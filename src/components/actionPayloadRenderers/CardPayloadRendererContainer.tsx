/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { CardAction, EntityBase, Memory } from '@conversationlearner/models'
import * as Util from '../../util'
import CardPayloadRenderer from './CardPayloadRenderer'

interface Props {
    isValidationError: boolean
    cardAction: CardAction
    entities: EntityBase[]
    memories: Memory[] | null
    onClickViewCard: (cardAction: CardAction, showOriginal: boolean) => void
}

export default class Component extends React.Component<Props, {}> {
    onClickViewCard = (showOriginal: boolean) => {
        this.props.onClickViewCard(this.props.cardAction, showOriginal)
    }

    render() {
        const { cardAction, entities, memories } = this.props
        const defaultEntityMap = Util.getDefaultEntityMap(entities)
        const argumentsUsingEntityNames = cardAction.renderArguments(defaultEntityMap, { preserveOptionalNodeWrappingCharacters: true })
        const argumentUsingCurrentMemory = memories === null
            ? null
            : cardAction.renderArguments(Util.createEntityMapFromMemories(entities, memories), { fallbackToOriginal: true })

        return <CardPayloadRenderer
            isValidationError={this.props.isValidationError}
            name={cardAction.templateName}
            originalArguments={argumentsUsingEntityNames}
            substitutedArguments={argumentUsingCurrentMemory}
            onClickViewCard={this.onClickViewCard}
        />
    }
}