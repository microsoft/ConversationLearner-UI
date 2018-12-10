/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { State } from '../../types'
import { ExtractResponse } from '@conversationlearner/models'
import * as ExtractorResponseEditor from '../ExtractorResponseEditor'
import * as OF from 'office-ui-fabric-react'

interface ComponentState {
    currentResponseIndex: number
}

class InconsistentEntityLabellingModal extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        currentResponseIndex: 0
    }

    onClickAccept = () => {
        if (this.state.currentResponseIndex === this.props.inconsistentExtractResponses.length - 1) {
            this.props.onClickAccept(this.props.inconsistentExtractResponses)
            return
        }

        this.setState(prevState => ({
            currentResponseIndex: prevState.currentResponseIndex + 1
        }))
    }

    render() {
        const inconsistentResponse = this.props.inconsistentExtractResponses[this.state.currentResponseIndex]

        return <Modal
            isOpen={this.props.isOpen && this.props.inconsistentExtractResponses.length > 0}
            containerClassName={`cl-modal cl-modal--small ${OF.FontClassNames.large}`}
        >
            <div className={`cl-modal_header ${OF.FontClassNames.xLarge}`}>Entity labelled differently in another utterance</div>

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
                extractorResponse={inconsistentResponse}
                onChange={() => {}}
            />

            <div>
                Clicking 'Accept' will replace your current labels with the existing labels.
            </div>

            <div className="cl-modal_footer cl-modal-buttons">
                <div className="cl-modal-buttons_secondary"></div>
                <div className="cl-modal-buttons_primary">
                    <OF.PrimaryButton
                        onClick={() => this.onClickAccept()}
                        ariaDescription={'Accept'}
                        text={'Accept'}
                    />
                    <OF.DefaultButton
                        onClick={() => this.props.onClickClose()}
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
    inconsistentExtractResponses: ExtractResponse[]
    onClickAccept: (extractorResponse: ExtractResponse[]) => void
    onClickClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(InconsistentEntityLabellingModal))


