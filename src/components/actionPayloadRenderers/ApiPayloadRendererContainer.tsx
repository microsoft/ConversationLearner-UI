/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { ApiAction, EntityBase, Memory, Callback } from '@conversationlearner/models'
import * as Util from '../../Utils/util'
import ApiPayloadRenderer from './ApiPayloadRenderer'

interface Props {
    apiAction: ApiAction
    entities: EntityBase[]
    memories: Memory[] | null
    callback: Callback | undefined
}

export default class Component extends React.Component<Props> {
    render() {
        const { apiAction, entities, memories, callback } = this.props
        const defaultEntityMap = Util.getDefaultEntityMap(entities)
        const logicArgumentsUsingEntityNames = apiAction.renderLogicArguments(defaultEntityMap, { preserveOptionalNodeWrappingCharacters: true })
        const logicArgumentsUsingCurrentMemory = memories === null
            ? null
            : apiAction.renderLogicArguments(Util.createEntityMapFromMemories(entities, memories), { fallbackToOriginal: true })

        const renderArgumentsUsingEntityNames = apiAction.renderRenderArguments(defaultEntityMap, { preserveOptionalNodeWrappingCharacters: true })
        const renderArgumentsUsingCurrentMemory = memories === null
            ? null
            : apiAction.renderRenderArguments(Util.createEntityMapFromMemories(entities, memories), { fallbackToOriginal: true })

        const showLogicFunction = !callback
            ? true
            : callback.isLogicFunctionProvided
                // && callback.logicArguments.length > 0

        const showRenderFunction = !callback
            ? true
            : callback.isRenderFunctionProvided
                // && callback.renderArguments.length > 0

        return <ApiPayloadRenderer
            name={apiAction.name}
            isStub={apiAction.isStub || false}
            showLogicFunction={showLogicFunction}
            originalLogicArguments={logicArgumentsUsingEntityNames}
            substitutedLogicArguments={logicArgumentsUsingCurrentMemory}
            showRenderFunction={showRenderFunction}
            originalRenderArguments={renderArgumentsUsingEntityNames}
            substitutedRenderArguments={renderArgumentsUsingCurrentMemory}
        />
    }
}