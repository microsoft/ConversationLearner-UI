import * as React from 'react'
import ExtractorResponseEditor from './ExtractorResponseEditor'
import { convertExtractorResponseToEditorModels, convertGenericEntityToPredictedEntity } from './utilities'
import { IGenericEntity, IGenericEntityData, PredictedEntity, ExtractResponse, EntityBase } from './models';

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

class ExtractorResponseEditorContainer extends React.Component<Props, {}> {
    onChangeCustomEntities = (customEntities: IGenericEntity<IGenericEntityData<PredictedEntity>>[]) => {
        const preBuiltPredictedEntities = this.props.extractorResponse.predictedEntities.filter(e => e.builtinType !== "LUIS")
        const newExtractResponse = {
            ...this.props.extractorResponse,
            predictedEntities: [...preBuiltPredictedEntities, ...customEntities.map(convertGenericEntityToPredictedEntity)]
        }

        this.props.onChange(newExtractResponse)
    }

    render() {
        const { readOnly, isValid, onClickNewEntity } = this.props
        const editorParts = convertExtractorResponseToEditorModels(this.props.extractorResponse, this.props.entities)
        return (
            <ExtractorResponseEditor
                readOnly={readOnly}
                isValid={isValid}
                options={editorParts.options}
                text={editorParts.text}
                customEntities={editorParts.customEntities}
                preBuiltEntities={editorParts.preBuiltEntities}

                onChangeCustomEntities={this.onChangeCustomEntities}
                onClickNewEntity={onClickNewEntity}
            />
        )
    }
}

export default ExtractorResponseEditorContainer