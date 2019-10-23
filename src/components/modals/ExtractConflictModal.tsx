/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import * as ExtractorResponseEditor from '../ExtractorResponseEditor'
import * as Util from '../../Utils/util'
import * as DialogUtils from '../../Utils/dialogUtils'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './ExtractConflictModal.css'

// Renaming from Props because of https://github.com/Microsoft/tslint-microsoft-contrib/issues/339

// Keys must match values for indexing by value
export enum ExtractionType {
    Attempted = 'Attempted',
    Existing = 'Existing'
}

export type ExtractionChange = ExtractionChangeExisting | ExtractionChangeAttempted

export interface ExtractionChangeExisting {
    chosenExtractType: ExtractionType.Existing
    extractResponse: CLM.ExtractResponse
}

export interface ExtractionChangeAttempted {
    chosenExtractType: ExtractionType.Attempted
    extractResponse: CLM.ExtractResponse
    trainDialogs: CLM.TrainDialog[]
}

interface ReceivedProps {
    onClose: Function
    onAccept: (extractionChange: ExtractionChange) => void
    open: boolean
    entities: CLM.EntityBase[]
    attemptedExtractResponse: CLM.ExtractResponse
    extractResponse: CLM.ExtractResponse
    trainDialogs: CLM.TrainDialog[]
}

type Props = ReceivedProps & InjectedIntlProps

type ReadOnlyEditorProps = {
    entities: CLM.EntityBase[],
    extractResponse: CLM.ExtractResponse,
}

const ReadOnlyOkExtractionEditor: React.FC<ReadOnlyEditorProps> = ({ entities, extractResponse }) => {
    const noOp = () => { }
    return <ExtractorResponseEditor.EditorWrapper
        render={(editorProps, onChangeCustomEntities) =>
            <ExtractorResponseEditor.Editor
                readOnly={true}
                status={ExtractorResponseEditor.Models.ExtractorStatus.OK}
                entities={entities}
                {...editorProps}

                onChangeCustomEntities={onChangeCustomEntities}
                onClickNewEntity={noOp}
                isPickerVisible={false}
                onOpenPicker={noOp}
                onClosePicker={noOp}
            />
        }
        entities={entities}
        extractorResponse={extractResponse}
        onChange={noOp}
    />
}

const ExtractConflictModal: React.FC<Props> = (props) => {
    const { intl, trainDialogs, attemptedExtractResponse } = props
    const [selectedExtractionType, setSelectedExtractionType] = React.useState(ExtractionType.Existing)
    const attemptedTextVariation = CLM.ModelUtils.ToTextVariation(attemptedExtractResponse)
    // This will hold the conflicting dialogs with corrections incase the user chooses to save the attempted labels.
    // Originally, had separate calculations. We only need to show the length in beginner and only need correction after they choose
    // but there was so much overlap in the calculation that adding correction is negligible they are now computed together.
    const [conflictingDialogs, setConflictingDialogs] = React.useState<CLM.TrainDialog[]>([])

    React.useEffect(() => {
        const correctedDialogs = DialogUtils.getCorrectedDialogs(attemptedTextVariation, trainDialogs)
        setConflictingDialogs(correctedDialogs)
    }, [props.trainDialogs, props.attemptedExtractResponse])

    const onClickOption = (extractionType: ExtractionType) => {
        setSelectedExtractionType(extractionType)
    }

    const onAccept = () => {
        const extractionChange: ExtractionChange = {
            chosenExtractType: selectedExtractionType,
            extractResponse: selectedExtractionType === ExtractionType.Attempted
                ? props.attemptedExtractResponse
                : props.extractResponse,
            trainDialogs: conflictingDialogs
        }

        props.onAccept(extractionChange)
    }

    const selectedAttempted = selectedExtractionType === ExtractionType.Attempted

    return (
        <OF.Modal
            isOpen={props.open}
            className={OF.FontClassNames.mediumPlus}
            containerClassName="cl-modal cl-modal--small"
            onDismiss={() => props.onClose()}
            data-testid="extract-conflict-modal"
        >
            <div className={`cl-modal_header cl-text--error ${OF.FontClassNames.xLarge} `}>
                <OF.Icon iconName="Warning" />&nbsp;{Util.formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_TITLE)}
            </div>
            <div>
                <p>{Util.formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_SUBTITLE)}</p>
                <div className="cl-inconsistent-entity-modal-header">{Util.formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_REVIEW)}</div>
                <div 
                    className={`cl-inconsistent-entity-modal-option ${selectedAttempted ? 'cl-inconsistent-entity-modal-option--selected' : ''}`}
                    data-testid="extract-conflict-modal-attempted"
                    onClick={() => onClickOption(ExtractionType.Attempted)}
                    role="button"
                >
                    <OF.ChoiceGroup
                        options={[
                            // data-testid is not defined on IChoiceGroupOption, so the type assertion is required.
                            // tslint:disable-next-line:no-object-literal-type-assertion
                            {
                                key: ExtractionType.Attempted,
                                text: '',
                                'data-testid': 'inconsistent-entity-modal-option-attempted',
                            } as OF.IChoiceGroupOption,
                        ]}
                        selectedKey={selectedExtractionType}
                    />
                    <div>
                        <div className={`cl-inconsistent-entity-modal-header ${selectedAttempted ? 'cl-text--success' : 'cl-text--error'}`} data-testid="extract-conflict-modal-conflicting-labels">
                            <OF.Icon iconName={selectedAttempted ? 'Accept' : 'ChromeClose'} />&nbsp;{Util.formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_ATTEMPTED_LABELS_TITLE)}
                        </div>
                        <div className="cl-inconsistent-entity-modal-header">{Util.formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_ATTEMPTED_LABELS_SUBTITLE, { conflictingDialogs: conflictingDialogs.length })}</div>
                        <ReadOnlyOkExtractionEditor
                            entities={props.entities}
                            extractResponse={props.attemptedExtractResponse}
                        />
                    </div>
                </div>

                <div 
                    className={`cl-inconsistent-entity-modal-option ${selectedAttempted ? '' : 'cl-inconsistent-entity-modal-option--selected'}`}
                    data-testid="extract-conflict-modal-existing"
                    onClick={() => onClickOption(ExtractionType.Existing)}
                    role="button"
                >
                    <OF.ChoiceGroup
                        options={[
                            // data-testid is not defined on IChoiceGroupOption, so the type assertion is required.
                            // tslint:disable-next-line:no-object-literal-type-assertion
                            {
                                key: ExtractionType.Existing,
                                text: '',
                                'data-testid': 'inconsistent-entity-modal-option-existing',
                            } as OF.IChoiceGroupOption,
                        ]}
                        selectedKey={selectedExtractionType}
                    />
                    <div>
                        <div className={`cl-inconsistent-entity-modal-header ${selectedAttempted ? 'cl-text--error' : 'cl-text--success'}`} data-testid="extract-conflict-modal-previously-submitted-labels">
                            <OF.Icon iconName={selectedAttempted ? 'ChromeClose' : 'Accept'} />&nbsp;{Util.formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_EXISTING_LABELS_TITLE)}
                        </div>
                        <div className="cl-inconsistent-entity-modal-header">{Util.formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_EXISTING_LABELS_SUBTITLE)}</div>
                        <ReadOnlyOkExtractionEditor
                            entities={props.entities}
                            extractResponse={props.extractResponse}
                        />
                    </div>
                </div>
            </div>
            <div className="cl-modal_footer cl-modal-buttons">
                <div className="cl-modal-buttons_secondary" />
                <div className="cl-modal-buttons_primary">
                    <OF.PrimaryButton
                        onClick={onAccept}
                        text={Util.formatMessageId(intl, FM.BUTTON_CHANGE)}
                        iconProps={{ iconName: 'Accept' }}
                        data-testid="entity-conflict-accept"
                    />
                    <OF.DefaultButton
                        onClick={() => props.onClose()}
                        text={Util.formatMessageId(intl, FM.BUTTON_CLOSE)}
                        iconProps={{ iconName: 'Cancel' }}
                        data-testid="entity-conflict-cancel"
                    />
                </div>
            </div>
        </OF.Modal>
    )
}

export default injectIntl(ExtractConflictModal)