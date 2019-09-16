/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { EntityBase, Memory } from '@conversationlearner/models'
import { SlateValue } from '../modals/ActionPayloadEditor'
import { Value } from 'slate'
import { Editor } from 'slate-react'
import { NodeTypes } from '../modals/ActionPayloadEditor/APEModels'
import './PayloadRendererWithHighlight.css'

interface EntityComponentProps {
    editor: any
    node: any
    attributes: any
    children: any
    readOnly: boolean
}

interface NodeProps extends EntityComponentProps {
}

export const EntityHighlight = (props: NodeProps) => {
    return (
        <span className="payload-entity" {...props.attributes}>
            {props.children}
        </span>
    )
}

export const OptionalHighlight = (props: NodeProps) => {
    return (
        <span className="payload-optional" {...props.attributes}>
            {props.children}
        </span>
    )
}

interface Props {
    value: SlateValue
    entities: EntityBase[]
    // TODO: Find better alternative than null
    // When memories is null it's assumed parent doesn't have access to it and intends to fallback to the entity names
    memories: Memory[] | null
}

const Component: React.FC<Props> = (props) => {
    const renderNode = (props: any): React.ReactNode | void => {
        switch (props.node.type) {
            case NodeTypes.Mention:
                return <EntityHighlight {...props} />
            case NodeTypes.Optional:
                return <OptionalHighlight {...props} />
            default:
                return
        }
    }

    return (
        <Editor
            data-testid="action-payload-editor"
            className="action-payload-editor"
            value={Value.fromJSON(props.value)}
            renderNode={renderNode}
            readOnly={true}
        />
    )
}

export default Component