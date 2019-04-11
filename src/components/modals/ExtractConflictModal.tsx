/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import * as ExtractorResponseEditor from '../ExtractorResponseEditor'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { FM } from '../../react-intl-messages'
import { formatMessageId } from '../../Utils/util'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './ExtractConflictModal.css'

// Renaming from Props because of https://github.com/Microsoft/tslint-microsoft-contrib/issues/339
interface ReceivedProps {
    onClose: Function
    onAccept: Function
    open: boolean
    entities: CLM.EntityBase[]
    attemptedExtractResponse: CLM.ExtractResponse
    extractResponse: CLM.ExtractResponse
}

type Props = ReceivedProps & InjectedIntlProps

const ExtractConflictModal: React.SFC<Props> = (props) => {
    const { intl } = props
    return (
        <Modal
            isOpen={props.open}
            className={OF.FontClassNames.mediumPlus}
            containerClassName="cl-modal cl-modal--small"
            onDismiss={() => props.onClose()}
            data-testid="extract-conflict-modal"
        >
            <div className={`cl-modal_header cl-text--error ${OF.FontClassNames.xLarge} `}>
                <OF.Icon iconName="Warning" />&nbsp;{formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_TITLE)}
            </div>
            <div>
                <p>{formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_SUBTITLE)}</p>
                <div>{formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_REVIEW)}</div>

                <div className="cl-inconsistent-entity-modal-header cl-text--error" data-testid="extract-conflict-modal-conflicting-labels"><OF.Icon iconName="ChromeClose" />&nbsp;{formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_CONFLICTING_LABELS)}</div>
                <ExtractorResponseEditor.EditorWrapper
                    render={(editorProps, onChangeCustomEntities) =>
                        <ExtractorResponseEditor.Editor
                            readOnly={true}
                            status={ExtractorResponseEditor.Models.ExtractorStatus.OK}
                            entities={props.entities}
                            {...editorProps}

                            onChangeCustomEntities={onChangeCustomEntities}
                            onClickNewEntity={() => { }}
                        />
                    }
                    entities={props.entities}
                    extractorResponse={props.attemptedExtractResponse}
                    onChange={() => { }}
                />

                <div className="cl-inconsistent-entity-modal-header cl-text--success" data-testid="extract-conflict-modal-previously-submitted-labels"><OF.Icon iconName="Accept" />&nbsp;{formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_CORRECT_LABELS)}</div>
                <ExtractorResponseEditor.EditorWrapper
                    render={(editorProps, onChangeCustomEntities) =>
                        <ExtractorResponseEditor.Editor
                            readOnly={true}
                            status={ExtractorResponseEditor.Models.ExtractorStatus.OK}
                            entities={props.entities}
                            {...editorProps}

                            onChangeCustomEntities={onChangeCustomEntities}
                            onClickNewEntity={() => { }}
                        />
                    }
                    entities={props.entities}
                    extractorResponse={props.extractResponse}
                    onChange={() => { }}
                />

                <p>{formatMessageId(intl, FM.EXTRACTCONFLICTMODAL_CALLTOACTION)}</p>
            </div>
            <div className="cl-modal_footer cl-modal-buttons">
                <div className="cl-modal-buttons_secondary"/>
                <div className="cl-modal-buttons_primary">
                    <OF.PrimaryButton
                        onClick={() => props.onAccept()}
                        text={formatMessageId(intl, FM.BUTTON_ACCEPT)}
                        iconProps={{ iconName: 'Accept' }}
                        data-testid="entity-conflict-accept"
                    />
                    <OF.DefaultButton
                        onClick={() => props.onClose()}
                        text={formatMessageId(intl, FM.BUTTON_CLOSE)}
                        iconProps={{ iconName: 'Cancel' }}
                        data-testid="entity-conflict-cancel"
                    />
                </div>
            </div>
        </Modal>
    )
}

export default injectIntl(ExtractConflictModal)