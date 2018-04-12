import * as React from 'react'
import { convertExtractorResponseToEditorModels, convertGenericEntityToPredictedEntity } from './utilities'
import { IGenericEntity, IGenericEntityData, IEditorProps } from './models';
import { EntityBase, PredictedEntity, ExtractResponse } from 'conversationlearner-models'

// Slate doesn't have type definitions but we still want type consistency and references so we make custom type
export type SlateValue = any

interface Props {
    entities: EntityBase[]
    extractorResponse: ExtractResponse
    onChange: (extractorResponse: ExtractResponse) => void
    render: (editorProps: IEditorProps, onChangeCustomEntities: (customEntities: IGenericEntity<IGenericEntityData<PredictedEntity>>[]) => void) => React.ReactNode
}

/**
 * Purpose of the container is to convert extractResponses into sub parts such as grouping predictedEntities into pre-builts and custom entities
 */
class ExtractorResponseEditorContainer extends React.Component<Props, {}> {
    onChangeCustomEntities = (customEntities: IGenericEntity<IGenericEntityData<PredictedEntity>>[]): void => {
        // TODO: Need to find out why entities sometimes come back with builtinType populated and other times have entitType populated
        // This should be normalized so we can only check one property here.
        const preBuiltPredictedEntities = this.props.extractorResponse.predictedEntities.filter(e => {
            if (!e.builtinType) {
                console.warn(`ExtractorResponseEditorContainer#onChangeCustomEntities: When filtering prebuilts entities out of predicted entities encountered entity with builtinType undefined`)
            }

            return typeof e.builtinType === "string" && e.builtinType !== "LUIS"
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