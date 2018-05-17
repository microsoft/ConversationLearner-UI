import * as React from 'react'
import { ApiAction, EntityBase, Memory } from '@conversationlearner/models'
import * as Util from '../../util'
import ApiPayloadRenderer from './ApiPayloadRenderer'

interface Props {
    apiAction: ApiAction
    entities: EntityBase[]
    memories: Memory[] | null
}

export default class Component extends React.Component<Props, {}> {
    render() {
        const { apiAction, entities, memories } = this.props
        const defaultEntityMap = Util.getDefaultEntityMap(entities)
        const argumentsUsingEntityNames = apiAction.renderArguments(defaultEntityMap, { preserveOptionalNodeWrappingCharacters: true })
        const argumentsUsingCurrentMemory = memories === null
            ? null
            : apiAction.renderArguments(Util.createEntityMapFromMemories(entities, memories), { fallbackToOriginal: true })

        return <ApiPayloadRenderer
            name={apiAction.name}
            originalArguments={argumentsUsingEntityNames}
            substitutedArguments={argumentsUsingCurrentMemory}
        />
    }
}