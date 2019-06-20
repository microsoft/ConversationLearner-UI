/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { TextAction, EntityBase, Memory } from '@conversationlearner/models'
import SessionPayloadRenderer from './SessionPayloadRenderer'

interface Props {
    sessionAction: TextAction
    entities: EntityBase[]
    memories: Memory[] | null
}

export default class Component extends React.Component<Props> {
    render() {
        return <SessionPayloadRenderer
            sessionAction={this.props.sessionAction}
            entities={this.props.entities}
            memories={this.props.memories}
        />
    }
}