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
import "./TranscriptValidatorPicker.css"

enum ChoiceOption {
    FILES = "FILES",
    LOAD = "LOAD"
}

interface ComponentState {
    transcriptFiles: File[] | null
    autoImport: boolean
    autoMerge: boolean
    choiceOption: ChoiceOption
}

class TranscriptValidatorPicker extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        transcriptFiles: null,
        autoImport: false,
        autoMerge: false,
        choiceOption: ChoiceOption.FILES
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
                const set = JSON.parse(reader.result) as CLM.TranscriptValidationSet
                if (!set || set.transcriptValidationResults.length === 0 || !set.transcriptValidationResults[0].validity) {
                    throw new Error("No test results found in file")
                }
                if (set.appId !== this.props.app.appId) {
                    throw new Error("Loaded results are from a different Model")
                }
                set.fileName = files[0].name
                this.props.onViewResults(set)
            }
            catch (e) {
                const error = e as Error
                this.props.setErrorDisplay(ErrorType.Error, error.message, "Invalid file contents", null)
            }
        }
        if (files[0]) {
            reader.readAsText(files[0])
        }
    }

    @OF.autobind
    onChoiceChange(choiceOption: OF.IChoiceGroupOption | undefined) {
        if (choiceOption && choiceOption.key === ChoiceOption.LOAD) {
            this.setState({choiceOption: ChoiceOption.LOAD})
        }
        else {
            this.setState({choiceOption: ChoiceOption.FILES})
        }
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
                    <OF.Icon
                        iconName='TestPlan'
                    />
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
                    <OF.ChoiceGroup
                        defaultSelectedKey={ChoiceOption.FILES}
                        options={[
                            {
                                key: ChoiceOption.FILES,
                                text: Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_TITLE_LOCATE),
                                onRenderField: (props, render) => {
                                    return (
                                        <div>
                                            {render!(props)}
                                            <div className="cl-transcript-validation-picker-option">
                                                <div className="cl-file-picker">
                                                    <OF.PrimaryButton
                                                        disabled={this.state.choiceOption !== ChoiceOption.FILES}
                                                        data-testid="transcript-locate-file-button"
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
                                                    <OF.PrimaryButton
                                                        disabled={this.state.transcriptFiles === null || this.state.choiceOption !== ChoiceOption.FILES}
                                                        data-testid="transcript-submit-button"
                                                        onClick={() => this.props.onTestFiles(this.state.transcriptFiles, this.state.autoImport, this.state.autoMerge)}
                                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_TEST)}
                                                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_TEST)}
                                                        iconProps={{ iconName: 'TestCase' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            },
                            {
                                key: ChoiceOption.LOAD,
                                text: Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_TITLE_LOAD),
                                onRenderField: (props, render) => {
                                    return (
                                        <div>
                                            {render!(props)}
                                            <div className="cl-transcript-validation-picker-option">
                                                <OF.PrimaryButton
                                                    disabled={this.state.choiceOption !== ChoiceOption.LOAD}
                                                    data-testid="transcript-locate-results-file-button"
                                                    className="cl-file-picker-button"
                                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_RESULTS_BUTTON)} 
                                                    text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_RESULTS_BUTTON)} 
                                                    iconProps={{ iconName: 'DownloadDocument' }}
                                                    onClick={() => this.resultfileInput.click()}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                            }
                        ]}
                        onChange={(ev, option) => this.onChoiceChange(option)}
                        required={true}
                    />
                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">
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
    onViewResults: (set: CLM.TranscriptValidationSet) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptValidatorPicker))