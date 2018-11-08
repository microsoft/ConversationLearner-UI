/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { convertExtractorResponseToEditorModels, convertGenericEntityToPredictedEntity } from './utilities'
import { IGenericEntity, IGenericEntityData, IEditorProps } from './models';
import { EntityBase, PredictedEntity, ExtractResponse, EntityType } from '@conversationlearner/models'
import {getPrebuiltEntityName} from '../modals/EntityCreatorEditor/EntityCreatorContainer'

// Slate doesn't have type definitions but we still want type consistency and references so we make custom type
export type SlateValue = any

interface Props {
    entities: EntityBase[]
    extractorResponse: ExtractResponse
    onChange: (extractorResponse: ExtractResponse) => void
    render: (editorProps: IEditorProps, onChangeCustomEntities: (customEntities: IGenericEntity<IGenericEntityData<PredictedEntity>>[], entities: EntityBase[]) => void) => React.ReactNode
}

/**
 * Purpose of the container is to convert extractResponses into sub parts such as grouping predictedEntities into pre-builts and custom entities
 */
class ExtractorResponseEditorContainer extends React.Component<Props, {}> {
    onChangeCustomEntities = (customEntities: IGenericEntity<IGenericEntityData<PredictedEntity>>[], entities: EntityBase[]): void => {
        // TODO: Need to find out why entities sometimes come back with builtinType populated and other times have entityType populated
        // This should be normalized so we can only check one property here.
        const preBuiltPredictedEntities = this.props.extractorResponse.predictedEntities.filter(e => {
            if (!e.builtinType) {
                console.warn(`ExtractorResponseEditorContainer#onChangeCustomEntities: When filtering prebuilts entities out of predicted entities encountered entity with builtinType undefined`)
            }
            const entityDef = entities.find(entity => entity.entityId === e.entityId)
            return entityDef !== undefined && entityDef.entityName === getPrebuiltEntityName(entityDef.entityType) && typeof e.builtinType === "string" && e.builtinType !== EntityType.LUIS
        })

        const newExtractResponse = {
            ...this.props.extractorResponse,
            predictedEntities: [...preBuiltPredictedEntities, ...customEntities.map(convertGenericEntityToPredictedEntity(this.props.entities))]
        }

        this.props.onChange(newExtractResponse)
    }

    render() {
        const editorProps = convertExtractorResponseToEditorModels(this.props.extractorResponse, this.props.entities)
        return this.props.render(editorProps, this.onChangeCustomEntities)
    }
}

export default ExtractorResponseEditorContainer