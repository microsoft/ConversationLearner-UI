/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import * as BB from 'botbuilder'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import * as DialogEditing from '../../Utils/dialogEditing'
import * as DialogUtils from '../../Utils/dialogUtils'
import actions from '../../actions'
import FormattedMessageId from '../FormattedMessageId'
import HelpIcon from '../HelpIcon'
import { TipType } from '../ToolTips/ToolTips'
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { State, ErrorType, CL_STUB_IMPORT_ACTION_ID } from '../../types'
import { FM } from '../../react-intl-messages'
import { AT } from '../../types/ActionTypes'
import { FilePicker } from 'react-file-picker'
import { injectIntl, InjectedIntlProps } from 'react-intl'

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

    async addEntityExtractions(trainDialog: CLM.TrainDialog) {
        // TODO: Consider checking locally stored TrainDialogs first for matches to lighten load on server

        // Generate list of all unique user utterances
        const userInput: string[] = []
        trainDialog.rounds.forEach(round => round.extractorStep.textVariations.forEach(textVariation => userInput.push(textVariation.text)))
        const uniqueInput = [...new Set(userInput)]

        // Get extraction results
        const extractResponses = await ((this.props.fetchExtractionsAsync(this.props.app.appId, uniqueInput) as any) as Promise<CLM.ExtractResponse[]>)

        // Now swap in any extract values
        trainDialog.rounds.forEach(round => round.extractorStep.textVariations
            .forEach(textVariation => {
                const extractResponse = extractResponses.find(er => er.text === textVariation.text)
                if (extractResponse && extractResponse.predictedEntities.length > 0) {
                    textVariation.labelEntities = CLM.ModelUtils.ToLabeledEntities(extractResponse.predictedEntities)
                }
                console.log(extractResponses[0])
            })
        )
    }

    async onImport(transcript: BB.Activity[]): Promise<void> {

        // This can take a while, so add a spinner
        this.props.spinnerAdd()

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
            createdDateTime: new Date().toJSON(),
            lastModifiedDateTime: new Date().toJSON(),
            // It's initially invalid
            validity: CLM.Validity.INVALID
        }

        let curRound: CLM.TrainRound | null = null
        transcript.forEach((activity: BB.Activity) => {
            // TODO: Handle conversation updates
            if (activity.type === "message") {
                if (activity.from.role === "user") {
                    let textVariation: CLM.TextVariation = {
                        text: activity.text,
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
                }
                else {
                    let scoreInput: CLM.ScoreInput = {
                        filledEntities: [],
                        context: {},
                        maskedActions: []
                    }
                    // As a first pass, try to match by exact text
                    const action = DialogUtils.findActionByText(activity.text, this.props.actions)
                    let scorerStep: CLM.TrainScorerStep = {
                        importText: action ? undefined : activity.text,
                        input: scoreInput,
                        labelAction: action ? action.actionId : CL_STUB_IMPORT_ACTION_ID,
                        logicResult: undefined,
                        scoredAction: undefined
                    }

                    curRound!.scorerSteps.push(scorerStep)
                }
            }
        })

        // Extract entities
        await this.addEntityExtractions(trainDialog)

        // Replay to fill in memory
        const newTrainDialog = await DialogEditing.onReplayTrainDialog(
            trainDialog,
            this.props.app.appId,
            this.props.entities,
            this.props.actions,
            this.props.trainDialogReplayAsync as any,
        )

        // Try to map action again now that we have entities
        DialogUtils.replaceImportActions(newTrainDialog, this.props.actions, this.props.entities)

        this.props.spinnerRemove()

        this.props.onSubmit(newTrainDialog)
    }

    onChangeFile = (file: File) => {
        this.setState({
            file
        })
    }

    @OF.autobind
    async onClickImport() {
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
                        <FormattedMessageId id={FM.CONVERSATION_IMPORTER_TITLE}/>
                    </span>
                    <div className={OF.FontClassNames.medium}>
                        <FormattedMessageId id={FM.CONVERSATION_IMPORTER_DESCRIPTION}/>
                        <HelpIcon tipType={TipType.CONVERSATION_IMPORTER}/>
                    </div>
                </div>
                <div className="cl-action-creator-fieldset">
                    <div data-testid="model-creator-import-file-picker">
                        <OF.Label>Import File</OF.Label>
                        <FilePicker
                            extensions={['transcript']}
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
        setErrorDisplay: actions.display.setErrorDisplay,
        fetchExtractionsAsync: actions.app.fetchExtractionsThunkAsync,
        trainDialogReplayAsync: actions.train.trainDialogReplayThunkAsync,
        spinnerAdd: actions.display.spinnerAdd,
        spinnerRemove: actions.display.spinnerRemove
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
    onSubmit: (trainDialog: CLM.TrainDialog) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(ConversationImporter))