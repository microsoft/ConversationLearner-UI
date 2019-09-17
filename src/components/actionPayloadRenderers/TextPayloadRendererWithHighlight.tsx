/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import { SlateValue } from '../modals/ActionPayloadEditor'
import { Value } from 'slate'
import { Editor } from 'slate-react'
import { NodeTypes } from '../modals/ActionPayloadEditor/APEModels'
import * as Util from '../../Utils/util'
import SlateTransformer from '../modals/ActionPayloadEditor/slateTransformer'
import SlateSerializer from '../modals/ActionPayloadEditor/slateSerializer'
import classnames from 'classnames'
import './TextPayloadRendererWithHighlight.css'

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
    showMissingEntities: boolean
    value: SlateValue
    entities: CLM.EntityBase[]
    memories?: CLM.Memory[]
}

export function usePayloadRenderer(value: any, entities: CLM.EntityBase[], showMissingEntities: boolean, memories?: CLM.Memory[]) {
    const hasEntities = React.useMemo(() => SlateSerializer.getEntityIds(value.document).length >= 1, [value])
    const slateValues = React.useMemo(() => {
        const entityEntryMap = Util.createEntityMapWithNamesAndValues(entities, memories)
        const valueShowingEntityNames = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(value), entityEntryMap, e => `$${e.name}`, showMissingEntities)
        const valueShowingCurrentMemory = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(value), entityEntryMap, e => e.value ? e.value : `$${e.name}`, showMissingEntities)

        // Show toggle if we have memory, payload has entities, and any entities have memory values
        const showToggle = hasEntities
            && Object.values(entityEntryMap).some(entry => entry.value)

        return {
            showToggle,
            slateValueShowingNames: Value.fromJSON(valueShowingEntityNames),
            slateValueShowingMemory: Value.fromJSON(valueShowingCurrentMemory),
        }
    }, [value, entities])

    return {
        ...slateValues,
        hasEntities
    }
}

const Component: React.FC<Props> = (props) => {
    const payloadRenderData = usePayloadRenderer(props.value, props.entities, props.showMissingEntities, props.memories)

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

    const visibleSlateValue = isOriginalVisible
        ? payloadRenderData.slateValueShowingNames
        : payloadRenderData.slateValueShowingMemory

    const editorClassnames = classnames({
        'cl-action-payload-editor': true,
        'cl-action-payload-editor--has-entities': payloadRenderData.hasEntities,
    })

    return (
        <div className={`cl-action-payload-renderer ${OF.FontClassNames.mediumPlus}`}>
            <Editor
                data-testid="action-scorer-text-response"
                className={editorClassnames}
                value={visibleSlateValue}
                renderNode={renderNode}
                readOnly={true}
            />
            {payloadRenderData.showToggle && <div>
                <OF.Toggle
                    checked={isOriginalVisible}
                    onChange={onChangeVisible}
                />
            </div>}
        </div>

    )
}

export default Component