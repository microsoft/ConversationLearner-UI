/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import FormattedMessageId from '../FormattedMessageId'
import HelpIcon from '../HelpIcon'
import { TipType } from '../ToolTips/ToolTips'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { autobind } from 'core-decorators';

interface ComponentState {
    transcriptFiles: File[]
    lgFiles: File[]
    autoImport: boolean
    autoMerge: boolean,
    autoActionMatch: boolean
}

class TranscriptImporter extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        transcriptFiles: [],
        lgFiles: [],
        autoImport: false,
        autoMerge: false,
        autoActionMatch: false
    }
        
    private transcriptFileInput: any
    private lgFileInput: any

    componentDidUpdate(prevProps: Props) {
        // Reset when opening modal
        if (prevProps.open === false && this.props.open === true) {
            this.setState({
                transcriptFiles: []
            })
        }
    }

    @autobind
    onChangeAutoImport() {
        this.setState({
            autoImport: !this.state.autoImport
        })
    }

    @autobind
    onChangeAutoMerge() {
        this.setState({
            autoMerge: !this.state.autoMerge
        })
    }

    @autobind
    onChangeAutoActionMatch() {
        this.setState({
            autoActionMatch: !this.state.autoActionMatch
        })
    }

    onChangeTranscriptFiles = (transcriptFiles: any) => {
        this.setState({
            transcriptFiles
        })
    }

    onChangeLGFiles = (lgFiles: any) => {
        this.setState({
            lgFiles
        })
    }

    render() {
        const invalidImport = this.state.transcriptFiles.length === 0
        return (
            <OF.Modal
                isOpen={this.props.open}
                onDismiss={() => this.props.onCancel()}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessageId id={FM.TRANSCRIPT_IMPORTER_TITLE}/>
                    </span>
                    <div className={OF.FontClassNames.medium}>
                        <FormattedMessageId id={FM.TRANSCRIPT_IMPORTER_DESCRIPTION}/>
                        <HelpIcon tipType={TipType.TRANSCRIPT_IMPORTER}/>
                    </div>
                </div>
                <div 
                    data-testid="transcript-import-file-picker"
                    className="cl-form"
                >
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onChangeTranscriptFiles(event.target.files)}
                        ref={ele => (this.transcriptFileInput = ele)}
                        multiple={true}
                    />
                    <div className="cl-file-picker">
                        <OF.PrimaryButton
                            data-testid="transcript-locate-file-button"
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
                    <OF.Checkbox
                        label={Util.formatMessageId(this.props.intl, FM.IMPORT_AUTOIMPORT)}
                        checked={this.state.autoImport}
                        onChange={this.onChangeAutoImport}
                    />
                    <OF.Checkbox
                        label={Util.formatMessageId(this.props.intl, FM.IMPORT_AUTOMERGE)}
                        checked={this.state.autoMerge}
                        onChange={this.onChangeAutoMerge}
                    />
                    <OF.Checkbox
                        label={Util.formatMessageId(this.props.intl, FM.IMPORT_AUTOACTIONMATCH)}
                        checked={this.state.autoActionMatch}
                        onChange={this.onChangeAutoActionMatch}
                    />
                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                disabled={invalidImport}
                                data-testid="import-submit-button"
                                iconProps={{iconName: "DownloadDocument"}}
                                onClick={() => this.props.onSubmit(this.state.transcriptFiles, this.state.lgFiles, this.state.autoImport, this.state.autoMerge, this.state.autoActionMatch)}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_IMPORT)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_IMPORT)}
                            />
                            <OF.DefaultButton
                                data-testid="import-cancel-button"
                                onClick={() => this.props.onCancel()}
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
    onSubmit: (transcriptFiles: File[], lgFiles: File[], autoImport: boolean, autoMerge: boolean, autoActionMatch: boolean) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptImporter))