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
        const currentEntityMap = Util.createEntityMapFromMemories(entities, memories)
        const defaultEntityMap = Util.getDefaultEntityMap(entities)
        const argumentStringsUsingEntityNames = apiAction.renderArguments(defaultEntityMap, { preserveOptionalNodeWrappingCharacters: true })
        const argumentStringsUsingCurrentMemory = apiAction.renderArguments(currentEntityMap, { fallbackToOriginal: true })

        return <ApiPayloadRenderer
            name={apiAction.name}
            originalArguments={argumentStringsUsingEntityNames}
            substitutedArguments={argumentStringsUsingCurrentMemory}
        />
    }
}