import * as React from 'react'
import { CardAction, EntityBase, Memory } from '@conversationlearner/models'
import * as Util from '../../util'
import CardPayloadRenderer from './CardPayloadRenderer'

interface Props {
    isValidationError: boolean
    cardAction: CardAction
    entities: EntityBase[]
    memories: Memory[] | null
    onClickViewCard: (cardAction: CardAction) => void
}

export default class Component extends React.Component<Props, {}> {
    onClickViewCard = () => {
        this.props.onClickViewCard(this.props.cardAction)
    }

    render() {
        const { cardAction, entities, memories } = this.props
        const defaultEntityMap = Util.getDefaultEntityMap(entities)
        const argumentStringsUsingEntityNames = cardAction.renderArguments(defaultEntityMap, { preserveOptionalNodeWrappingCharacters: true })
        
        if (memories === null) {
            return <CardPayloadRenderer
                isValidationError={this.props.isValidationError}
                name={cardAction.templateName}
                originalArguments={argumentStringsUsingEntityNames}
                substitutedArguments={null}
                onClickViewCard={this.onClickViewCard}
            />
        }

        const currentEntityMap = Util.createEntityMapFromMemories(entities, memories)
        const argumentStringsUsingCurrentMemory = cardAction.renderArguments(currentEntityMap, { fallbackToOriginal: true })

        return <CardPayloadRenderer
            isValidationError={this.props.isValidationError}
            name={cardAction.templateName}
            originalArguments={argumentStringsUsingEntityNames}
            substitutedArguments={argumentStringsUsingCurrentMemory}
            onClickViewCard={this.onClickViewCard}
        />
    }
}