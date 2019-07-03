/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import actions from '../../actions'
import { ErrorType } from '../../types/const'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    transcriptFiles: File[] | null
    autoImport: boolean
    autoMerge: boolean
}

class TranscriptValidatorPicker extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        transcriptFiles: null,
        autoImport: false,
        autoMerge: false
    }
        
    private transcriptfileInput: any
    private resultfileInput: any

    componentWillReceiveProps(nextProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && nextProps.open === true) {
            this.setState({
                transcriptFiles: null
            })
        }
    }

    @OF.autobind
    onChangeAutoImport() {
        this.setState({
            autoImport: !this.state.autoImport
        })
    }

    @OF.autobind
    onChangeAutoMerge() {
        this.setState({
            autoMerge: !this.state.autoMerge
        })
    }

    @OF.autobind
    onChangeTranscriptFiles(files: any) {
        this.setState({
            transcriptFiles: files
        })
    }
    @OF.autobind
    onChangeResultFiles(files: any) {
        const reader = new FileReader()
        reader.onload = (e: Event) => {
            try {
                if (typeof reader.result !== 'string') {
                    throw new Error("String Expected")
                }
                const transcriptValidationResults = JSON.parse(reader.result) as CLM.TranscriptValidationResult[]
                if (!transcriptValidationResults || transcriptValidationResults.length === 0 || !transcriptValidationResults[0].validity) {
                    throw new Error("No test results found in file")
                }
                this.props.onViewResults(transcriptValidationResults)
            }
            catch (e) {
                const error = e as Error
                this.props.setErrorDisplay(ErrorType.Error, error.message, "Invalid file contents", null)
            }
        }
        reader.readAsText(files[0])
    }

    render() {
        return (
            <OF.Modal
                isOpen={this.props.open}
                onDismiss={this.props.onAbandon}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        {Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_TITLE)} 
                    </span>
                </div>
                <div 
                    data-testid="transcript-import-file-picker"
                    className="cl-form"
                >
                    <input
                        hidden={true}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onChangeResultFiles(event.target.files)}
                        ref={ele => (this.resultfileInput = ele)}
                        multiple={false}
                    />
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onChangeTranscriptFiles(event.target.files)}
                        ref={ele => (this.transcriptfileInput = ele)}
                        multiple={true}
                    />
                    <div className="cl-file-picker">
                        <OF.PrimaryButton
                            data-testid="transcript-locate-file-button"
                            className="cl-file-picker-button"
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_LOCATE_FILES)} 
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_LOCATE_FILES)} 
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
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                disabled={this.state.transcriptFiles !== null}
                                data-testid="transcript-locate-results-file-button"
                                className="cl-file-picker-button"
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_RESULTS_BUTTON)} 
                                text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_RESULTS_BUTTON)} 
                                iconProps={{ iconName: 'DownloadDocument' }}
                                onClick={() => this.resultfileInput.click()}
                            />
                            <OF.PrimaryButton
                                disabled={this.state.transcriptFiles === null}
                                data-testid="transcript-submit-button"
                                onClick={() => this.props.onTestFiles(this.state.transcriptFiles, this.state.autoImport, this.state.autoMerge)}
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
    onTestFiles: (files: File[] | null, autoImport: boolean, autoMerge: boolean) => void
    onViewResults: (transcriptValidationResults: CLM.TranscriptValidationResult[]) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptValidatorPicker))