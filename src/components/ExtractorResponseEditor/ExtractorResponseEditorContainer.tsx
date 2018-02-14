import * as React from 'react'
import ExtractorResponseEditor from './ExtractorResponseEditor'
import { convertExtractorResponseToEditorModels, convertGenericEntityToPredictedEntity } from './utilities'
import { IGenericEntity, IGenericEntityData } from './models';
import { EntityBase, PredictedEntity, ExtractResponse } from 'blis-models'

// Slate doesn't have type definitions but we still want type consistency and references so we make custom type
export type SlateValue = any

interface Props {
    readOnly: boolean
    isValid: boolean
    entities: EntityBase[]
    extractorResponse: ExtractResponse
    onChange: (extractorResponse: ExtractResponse) => void
    onClickNewEntity: () => void
}

/**
 * Purpose of the container is to convert extractResponses into sub parts such as grouping predictedEntities into pre-builts and custom entities
 */
class ExtractorResponseEditorContainer extends React.Component<Props, {}> {
    onChangeCustomEntities = (customEntities: IGenericEntity<IGenericEntityData<PredictedEntity>>[]) => {
        // TODO: Need to find out why entities sometimes come back with builtinType populated and other times have entitType populated
        // This should be normalized so we can only check one property here.
        const preBuiltPredictedEntities = this.props.extractorResponse.predictedEntities.filter(e => {
            if (e.builtinType) {
                console.warn(`ExtractorResponseEditorContainer#onChangeCustomEntities: When filtering prebuilts entities out of predicted entities encountered entity with builtinType defined`)
            }

            // TODO: Should not have to cast to any. After schema change all entities should have type available
            const entityType = (e as any).entityType
            return (typeof entityType === "string" && entityType !== "LUIS")
                || (typeof e.builtinType === "string" && e.builtinType !== "LUIS")
        })

        const newExtractResponse = {
            ...this.props.extractorResponse,
            predictedEntities: [...preBuiltPredictedEntities, ...customEntities.map(convertGenericEntityToPredictedEntity(this.props.entities))]
        }

        this.props.onChange(newExtractResponse)
    }

    render() {
        const { readOnly, isValid, onClickNewEntity } = this.props
        const editorProps = convertExtractorResponseToEditorModels(this.props.extractorResponse, this.props.entities)
        return (
            <ExtractorResponseEditor
                readOnly={readOnly}
                isValid={isValid}
                {...editorProps}

                onChangeCustomEntities={this.onChangeCustomEntities}
                onClickNewEntity={onClickNewEntity}
            />
        )
    }
}

export default ExtractorResponseEditorContainer