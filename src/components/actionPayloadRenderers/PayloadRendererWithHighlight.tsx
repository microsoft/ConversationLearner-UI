/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import { EntityBase, Memory } from '@conversationlearner/models'
import { SlateValue } from '../modals/ActionPayloadEditor'
import { Value } from 'slate'
import { Editor } from 'slate-react'
import { NodeTypes } from '../modals/ActionPayloadEditor/APEModels'
import * as Util from '../../Utils/util'
import SlateTransformer from '../modals/ActionPayloadEditor/slateTransformer'
import SlateSerializer from '../modals/ActionPayloadEditor/slateSerializer'
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
    const isEntityMissing = props.node.data.get('entityMissing')
    return (
        <span className={`cl-action-payload-entity ${isEntityMissing ? 'cl-action-payload-entity--missing' : ''}`} {...props.attributes}>
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
    showMissingEntities: boolean
    value: SlateValue
    entities: EntityBase[]
    memories?: Memory[]
}

const Component: React.FC<Props> = (props) => {
    const hasEntities = React.useMemo(() => SlateSerializer.getEntityIds(props.value.document).length >= 1, [props.value])
    const slateValues = React.useMemo(() => {
        const entityEntryMap = Util.createEntityMapWithNamesAndValues(props.entities, props.memories)
        const valueShowingEntityNames = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(props.value), entityEntryMap, e => `$${e.name}`, props.showMissingEntities)
        const valueShowingCurrentMemory = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(props.value), entityEntryMap, e => e.value ? e.value : `$${e.name}`, props.showMissingEntities)

        // Show toggle if we have memory, payload has entities, and any entities have memory values
        const showToggle = hasEntities
            && Object.values(entityEntryMap).some(entry => entry.value)

        return {
            showToggle,
            names: Value.fromJSON(valueShowingEntityNames),
            values: Value.fromJSON(valueShowingCurrentMemory),
        }
    }, [props.value, props.entities])

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

    const [isOriginalVisible, setIsOriginalVisivilble] = React.useState(false)
    const onChangeVisible = () => {
        setIsOriginalVisivilble(x => !x)
    }

    const slateValue = isOriginalVisible
        ? slateValues.names
        : slateValues.values

    return (
        <div className={`cl-action-payload-renderer ${OF.FontClassNames.mediumPlus}`}>
            <Editor
                data-testid="action-payload-editor"
                className={`cl-action-payload-editor ${hasEntities ? 'cl-action-payload-editor--has-entities': ''}`}
                value={slateValue}
                renderNode={renderNode}
                readOnly={true}
            />
            {slateValues.showToggle && <div>
                <OF.Toggle
                    checked={isOriginalVisible}
                    onChange={onChangeVisible}
                />
            </div>}
        </div>

    )
}

export default Component