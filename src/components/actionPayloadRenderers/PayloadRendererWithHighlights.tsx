/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { SlateValue } from '../modals/ActionPayloadEditor'
import { Editor } from 'slate-react'
import { NodeTypes } from '../modals/ActionPayloadEditor/APEModels'
import classnames from 'classnames'
import './PayloadRendererWithHighlights.css'

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
    const isEntityMissing = props.node.data.get('missing')
    const isEntityRequired = props.node.data.get('required')
    const isEntityFilled = props.node.data.get('filled')

    const classNames = classnames({
        'cl-action-payload-entity': true,
        'cl-action-payload-entity--filled': isEntityFilled,
        'cl-action-payload-entity--missing': isEntityMissing,
        'cl-action-payload-entity--required': isEntityRequired,
    })

    return (
        <span className={classNames} {...props.attributes}>
            {props.children}
        </span>
    )
}

export const OptionalHighlight = (props: NodeProps) => {
    return (
        <span className="cl-action-payload-optional" {...props.attributes}>
            {props.children}
        </span>
    )
}

interface Props {
    hasEntities: boolean
    slateValue: SlateValue
}


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

const Component: React.FC<Props> = (props) => {
    const editorClassnames = classnames({
        'cl-action-payload-editor': true,
        'cl-action-payload-editor--has-entities': props.hasEntities,
    })

    return (
        <Editor
            data-testid="action-scorer-text-response"
            className={editorClassnames}
            value={props.slateValue}
            renderNode={renderNode}
            readOnly={true}
        />
    )
}

export default Component