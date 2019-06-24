/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    files: File[] | null
    autoImport: boolean
    autoMerge: boolean
}

class TranscriptValidatorPicker extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        files: null,
        autoImport: false,
        autoMerge: false
    }
        
    private fileInput: any

    componentWillReceiveProps(nextProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && nextProps.open === true) {
            this.setState({
                files: null
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

    onChangeFile = (files: any) => {
        this.setState({
            files
        })
    }

    render() {
        const invalidImport = this.state.files === null
        return (
            <OF.Modal
                isOpen={this.props.open}
                onDismiss={() => this.props.onClose(null, false, false)}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        Select .transcript files to test
                    </span>
                </div>
                <div 
                    data-testid="transcript-import-file-picker"
                    className="cl-form"
                >
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onChangeFile(event.target.files)}
                        ref={ele => (this.fileInput = ele)}
                        multiple={true}
                    />
                    <div className="cl-file-picker">
                        <OF.PrimaryButton
                            data-testid="transcript-locate-file-button"
                            className="cl-file-picker-button"
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_LOCATE_FILES)} 
                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_LOCATE_FILES)} 
                            iconProps={{ iconName: 'DocumentSearch' }}
                            onClick={() => this.fileInput.click()}
                        />
                        <OF.TextField
                            disabled={true}
                            value={!this.state.files 
                                ? undefined
                                : this.state.files.length === 1
                                ? this.state.files[0].name 
                                : `${this.state.files.length} files selected`
                            }
                        />
                    </div>
                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                disabled={invalidImport}
                                data-testid="transcript-submit-button"
                                onClick={() => this.props.onClose(this.state.files, this.state.autoImport, this.state.autoMerge)}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_TEST)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_TEST)}
                                iconProps={{ iconName: 'TestCase' }}
                            />
                            <OF.DefaultButton
                                data-testid="transcript-cancel-button"
                                onClick={() => this.props.onClose(null, false, false)}
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
    onClose: (files: File[] | null, autoImport: boolean, autoMerge: boolean) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptValidatorPicker))