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
import './TranscriptValidatorPicker.css'
import { autobind } from 'core-decorators';

interface ComponentState {
    transcriptFiles: File[]
    lgFiles: File[]
    testName: string
}

class TranscriptValidatorPicker extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        transcriptFiles: [],
        lgFiles: [],
        testName: ''
    }
        
    private transcriptFileInput: any
    private lgFileInput: any

    componentDidUpdate(prevProps: Props) {
        // Reset when opening modal
        if (prevProps.open === false && this.props.open === true) {
            this.setState({
                transcriptFiles: [],
                lgFiles: []
            })
        }
    }

    @autobind
    onChangeName(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, testName: string) {
        this.setState({
            testName
        })
    }

    @autobind
    onChangeTranscriptFiles(files: any) {
        this.setState({
            transcriptFiles: files
        })
    }

    onChangeLGFiles = (lgFiles: any) => {
        this.setState({
            lgFiles
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
                    <div className={`cl-dialog-title ${OF.FontClassNames.xxLarge}`}>
                        {Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_PICKER_TITLE)} 
                    </div>
                </div>
                <div 
                    className="cl-transcript-validator-body"
                >
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onChangeTranscriptFiles(event.target.files)}
                        ref={ele => (this.transcriptFileInput = ele)}
                        multiple={true}
                    />
                    <OF.TextField
                        className={OF.FontClassNames.mediumPlus}
                        onChange={this.onChangeName}
                        label={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_NAME_LABEL)}
                        onGetErrorMessage={value => this.props.onGetNameErrorMessage(value)}
                        value={this.state.testName}
                    />
                    <div className="cl-file-picker">
                        <OF.PrimaryButton
                            className="cl-file-picker-button"
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_IMPORTER_TRANSCRIPT_BUTTON)} 
                            text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_IMPORTER_TRANSCRIPT_BUTTON)} 
                            iconProps={{ iconName: 'DocumentSearch' }}
                            onClick={() => this.transcriptFileInput.click()}
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
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onChangeLGFiles(event.target.files)}
                        ref={ele => (this.lgFileInput = ele)}
                        multiple={true}
                    />
                    <div className="cl-file-picker">
                        <OF.PrimaryButton
                            data-testid="transcript-locate-file-button"
                            className="cl-file-picker-button"
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_IMPORTER_LG_BUTTON)} 
                            text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_IMPORTER_LG_BUTTON)} 
                            iconProps={{ iconName: 'DocumentSearch' }}
                            onClick={() => this.lgFileInput.click()}
                        />
                        <OF.TextField
                            disabled={true}
                            value={!this.state.lgFiles 
                                ? undefined
                                : this.state.lgFiles.length === 1
                                ? this.state.lgFiles[0].name 
                                : `${this.state.lgFiles.length} files selected`
                            }
                        />
                    </div>
                </div>
                <div className='cl-modal_footer cl-modal-buttons'>
                    <div className="cl-modal-buttons_secondary" />
                    <div className="cl-modal-buttons_primary">
                        <OF.PrimaryButton
                            disabled={this.state.transcriptFiles.length === 0 || this.props.onGetNameErrorMessage(this.state.testName) !== ''}
                            data-testid="transcript-submit-button"
                            onClick={() => this.props.onValidateFiles(this.state.testName, this.state.transcriptFiles, this.state.lgFiles)}
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
    onValidateFiles: (testName: string, transcriptFiles: File[], glFiles: File[]) => void
    onGetNameErrorMessage: (value: string) => string 
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptValidatorPicker))