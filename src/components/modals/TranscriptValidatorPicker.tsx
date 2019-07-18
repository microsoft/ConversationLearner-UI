/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import actions from '../../actions'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    transcriptFiles: File[]
}

class TranscriptValidatorPicker extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        transcriptFiles: []
    }
        
    private transcriptfileInput: any

    componentWillReceiveProps(nextProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && nextProps.open === true) {
            this.setState({
                transcriptFiles: []
            })
        }
    }

    @OF.autobind
    onChangeTranscriptFiles(files: any) {
        this.setState({
            transcriptFiles: files
        })
    }

    render() {
        return (
            <OF.Modal
                isOpen={this.props.open}
                onDismiss={this.props.onAbandon}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className="cl-modal_header">
                    <div className={`cl-dialog-title cl-dialog-title--import ${OF.FontClassNames.xxLarge}`}>
                        <OF.Icon
                            iconName='TestPlan'
                        />
                        {Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_TITLE)} 
                    </div>
                </div>
                <div 
                    className="cl-modal_body cl-transcript-validator-body"
                >
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onChangeTranscriptFiles(event.target.files)}
                        ref={ele => (this.transcriptfileInput = ele)}
                        multiple={true}
                    />
                    <div className="cl-file-picker">
                        <OF.PrimaryButton
                            className="cl-file-picker-button"
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_SELECT_FILES)} 
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_SELECT_FILES)} 
                            iconProps={{ iconName: 'DocumentSearch' }}
                            onClick={() => this.transcriptfileInput.click()}
                        />
                        <OF.TextField
                            disabled={true}
                            value={!this.state.transcriptFiles 
                                ? undefined
                                : this.state.transcriptFiles.length === 1
                                ? this.state.transcriptFiles[0].name 
                                : `${this.state.transcriptFiles.length} files selected`
                            }
                        />
                    </div>
                </div>
                <div className='cl-modal_footer cl-modal-buttons'>
                    <div className="cl-modal-buttons_secondary" />
                    <div className="cl-modal-buttons_primary">
                        <OF.PrimaryButton
                            disabled={this.state.transcriptFiles.length === 0}
                            data-testid="transcript-submit-button"
                            onClick={() => this.props.onValidateFiles(this.state.transcriptFiles)}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_TEST)}
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_TEST)}
                            iconProps={{ iconName: 'TestCase' }}
                        />
                        <OF.DefaultButton
                            data-testid="transcript-cancel-button"
                            onClick={this.props.onAbandon}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CANCEL)}
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_CANCEL)}
                            iconProps={{ iconName: 'Cancel' }}
                        />
                    </div>
                </div>
            </OF.Modal>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setErrorDisplay: actions.display.setErrorDisplay,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        apps: state.apps.all,
        actions: state.actions,
        entities: state.entities
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    open: boolean
    onAbandon: () => void
    onValidateFiles: (files: File[]) => void
    onViewResults: (set: CLM.TranscriptValidationSet) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptValidatorPicker))