/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react'
import { State, ErrorType } from '../../types'
import { FM } from '../../react-intl-messages'
import { AT } from '../../types/ActionTypes'
import { FilePicker } from 'react-file-picker'
import { setErrorDisplay } from '../../actions/displayActions'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import * as CLM from '@conversationlearner/models'

interface ComponentState {
    file: File | null
}

class ConversationImporter extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        file: null,
    }

    componentWillReceiveProps(nextProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && nextProps.open === true) {
            this.setState({
                file: null
            })
        }
    }

    @OF.autobind
    onClickCancel() {
        this.props.onCancel()
    }

    onImport(object: any): void {
        let firstKey = Object.keys(object)[0]
        let firstObj = object[firstKey]
        let log = firstObj.log

        let trainDialog: CLM.TrainDialog = {
            trainDialogId: undefined!,
            version: undefined!,
            packageCreationId: undefined!,
            packageDeletionId: undefined!,
            sourceLogDialogId: undefined!,
            initialFilledEntities: [],
            rounds: [],
            tags: [], 
            description: '',
            createdDateTime: Date.now().toString(),  
            lastModifiedDateTime: Date.now().toString() 
        }
        let isUser: boolean = true
        let curRound: CLM.TrainRound | null = null
        log.forEach((l: any) => {
            if (isUser) {
                let textVariation: CLM.TextVariation = {
                    text: l.text,
                    labelEntities: []
                }
                let extractorStep: CLM.TrainExtractorStep = {
                    textVariations: [textVariation]
                }
                curRound = {
                    extractorStep,
                    scorerSteps: []
                }
                trainDialog.rounds.push(curRound)
                isUser = false
            }
            else {
                let scoreInput: CLM.ScoreInput = {
                    filledEntities: [],
                    context: {},
                    maskedActions: []
                }
                let scorerStep: CLM.TrainScorerStep = {
                    stubText: l.text,
                    input: scoreInput,
                    labelAction: "NEW",
                    logicResult: undefined,
                    scoredAction: undefined
                }
                curRound!.scorerSteps.push(scorerStep)
                isUser = true
            }
        })

        this.props.onSubmit(trainDialog)
    }

    onChangeFile = (file: File) => {
        this.setState({
            file
        })
    }

    onClickImport = () => {
        if (!this.state.file) {
            console.warn(`You clicked import before a file was selected. This should not be possible. Contact support`)
            return
        }

        const reader = new FileReader()
        reader.onload = (e: Event) => {
            try {
                if (typeof reader.result !== 'string') {
                    throw new Error("String Expected")
                }
                const source = JSON.parse(reader.result)
                this.onImport(source);
            }
            catch (e) {
                const error = e as Error
                this.props.setErrorDisplay(ErrorType.Error, error.message, "Invalid file contents", AT.CREATE_APPLICATION_ASYNC)
            }
        }
        reader.readAsText(this.state.file)
    }

    render() {
        const { intl } = this.props
        const invalidImport = this.state.file === null
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        Import a conversation...
                    </span>
                </div>
                <div className="cl-action-creator-fieldset">
                    <div data-testid="model-creator-import-file-picker">
                        <OF.Label>Import File</OF.Label>
                        <FilePicker
                          //  extensions={['cl']}
                            onChange={this.onChangeFile}
                            onError={(error: string) => this.props.setErrorDisplay(ErrorType.Error, error, "", null)}
                            maxSize={300}
                        >
                            <div className="cl-action-creator-file-picker">
                                <OF.PrimaryButton
                                    data-testid="model-creator-locate-file-button"
                                    className="cl-action-creator-file-button"
                                    ariaDescription={this.props.intl.formatMessage({
                                        id: FM.APPCREATOR_CHOOSE_FILE_BUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Choose a file'
                                    })}
                                    text={this.props.intl.formatMessage({
                                        id: FM.APPCREATOR_CHOOSE_FILE_BUTTON_TEXT,
                                        defaultMessage: 'Choose'
                                    })}
                                />
                                <OF.TextField
                                    disabled={true}
                                    value={this.state.file
                                        ? this.state.file.name
                                        : ''}
                                />
                            </div>
                        </FilePicker>
                    </div>
                    
                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                disabled={invalidImport}
                                data-testid="model-creator-submit-button"
                                onClick={this.onClickImport}
                                ariaDescription={this.props.intl.formatMessage({
                                    id: FM.APPCREATOR_IMPORT_BUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Import from File'
                                })}
                                text={this.props.intl.formatMessage({
                                    id: FM.APPCREATOR_IMPORT_BUTTON_TEXT,
                                    defaultMessage: 'Import'
                                })}
                            />
                            <OF.DefaultButton
                                data-testid="model-creator-cancel-button"
                                onClick={this.onClickCancel}
                                ariaDescription={intl.formatMessage({
                                    id: FM.APPCREATOR_CANCELBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Cancel'
                                })}
                                text={intl.formatMessage({
                                    id: FM.APPCREATOR_CANCELBUTTON_TEXT,
                                    defaultMessage: 'Cancel'
                                })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setErrorDisplay
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        apps: state.apps.all
    }
}

export interface ReceivedProps {
    open: boolean
    onSubmit: (trainDialog: CLM.TrainDialog) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(ConversationImporter))