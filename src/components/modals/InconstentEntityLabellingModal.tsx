/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { State } from '../../types'
import { ExtractResponse } from '@conversationlearner/models'
import * as ExtractorResponseEditor from '../ExtractorResponseEditor'
import * as OF from 'office-ui-fabric-react'
import { FM } from '../../react-intl-messages'
import './InconsistentEntityLabellingModal.css'

export interface InconsistentExtractResponse {
    new: ExtractResponse
    existing: ExtractResponse
}

interface ComponentState {
    currentResponseIndex: number
    acceptedResponses: ExtractResponse[]
}

class InconsistentEntityLabellingModal extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        currentResponseIndex: 0,
        acceptedResponses: []
    }

    onClickAccept = (inconsistentResponse: InconsistentExtractResponse) => {
        // Use the labels from the correct response but text from new input to preserve casing for text comparison
        const currentResponse = inconsistentResponse.existing
        currentResponse.text = inconsistentResponse.new.text

        if (this.state.currentResponseIndex === this.props.inconsistentExtractResponses.length - 1) {
            this.props.onClickAccept([...this.state.acceptedResponses, currentResponse])
            return
        }

        this.setState(prevState => ({
            currentResponseIndex: prevState.currentResponseIndex + 1,
            acceptedResponses: [...prevState.acceptedResponses, currentResponse]
        }))
    }

    render() {
        /**
         * TODO: Clean up props logic
         * THere is race condition where this inconsistentExtractResponses will be an empty array while the modal
         * is still open. This causes inconsistentResponse which is undefined to be passed to the EditorWrapper 
         * which should not happe. 
         */
        const inconsistentResponse = this.props.inconsistentExtractResponses[this.state.currentResponseIndex]

        return <Modal
            isOpen={this.props.isOpen && this.props.inconsistentExtractResponses.length > 0}
            containerClassName={`cl-modal cl-modal--medium ${OF.FontClassNames.large}`}
        >
            <div className={`cl-modal_header cl-text--error ${OF.FontClassNames.xLarge} `}>
                <OF.Icon iconName="Warning" />&nbsp;<FormattedMessage id={FM.INCONSISTENT_ENTITY_LABEL_TITLE} defaultMessage="Inconsistent Entity Labels" />
            </div>

            <div className="cl-modal_body">
                <div>
                    <p><FormattedMessage id={FM.INCONSISTENT_ENTITY_LABEL_SUBTITLE} defaultMessage="Entity labelled differently in another utterance" /></p>
            {inconsistentResponse
                ? <div>
                    <div className="cl-inconsistent-entity-modal-header cl-text--error"><OF.Icon iconName="ChromeClose" />&nbsp;Attempted Input:</div>
                    <ExtractorResponseEditor.EditorWrapper
                        render={(editorProps, onChangeCustomEntities) =>
                            <ExtractorResponseEditor.Editor
                                readOnly={true}
                                isValid={true}
                                {...editorProps}

                                onChangeCustomEntities={onChangeCustomEntities}
                                onClickNewEntity={() => {}}
                            />
                        }
                        entities={this.props.entities}
                        extractorResponse={inconsistentResponse.new}
                        onChange={() => {}}
                    />

                    <div className="cl-inconsistent-entity-modal-header cl-text--success"><OF.Icon iconName="Accept" />&nbsp;Previous Input:</div>
                    <ExtractorResponseEditor.EditorWrapper
                        render={(editorProps, onChangeCustomEntities) =>
                            <ExtractorResponseEditor.Editor
                                readOnly={true}
                                isValid={true}
                                {...editorProps}

                                onChangeCustomEntities={onChangeCustomEntities}
                                onClickNewEntity={() => {}}
                            />
                        }
                        entities={this.props.entities}
                        extractorResponse={inconsistentResponse.existing}
                        onChange={() => {}}
                    />
                </div>
                : <div>Response not defined.</div>}

                    <p>
                        <FormattedMessage id={FM.INCONSISTENT_ENTITY_LABEL_DESCRIPTION} defaultMessage="Clicking 'Accept' will replace your current labels with the existing labels." />
                    </p>
                </div>
            </div>


            <div className="cl-modal_footer cl-modal-buttons">
                <div className="cl-modal-buttons_secondary"></div>
                <div className="cl-modal-buttons_primary">
                    <OF.PrimaryButton
                        onClick={() => this.onClickAccept(inconsistentResponse)}
                        ariaDescription={'Accept'}
                        text={'Accept'}
                    />
                    <OF.DefaultButton
                        onClick={() => this.props.onClickClose(this.state.acceptedResponses)}
                        ariaDescription={'Close'}
                        text={'Close'}
                    />
                </div>
            </div>
        </Modal>
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        entities: state.entities
    }
}

interface ReceivedProps {
    isOpen: boolean
    inconsistentExtractResponses: InconsistentExtractResponse[]
    onClickAccept: (extractorResponses: ExtractResponse[]) => void
    onClickClose: (acceptedResponses: ExtractResponse[]) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(InconsistentEntityLabellingModal))


