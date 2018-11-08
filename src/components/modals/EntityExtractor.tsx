/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { setStateAsync } from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'
import * as ExtractorResponseEditor from '../ExtractorResponseEditor'
import ExtractConflictModal from './ExtractConflictModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import actions from '../../actions'
import * as ToolTips from '../ToolTips/ToolTips'
import HelpIcon from '../HelpIcon'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { EditDialogType } from '.'
import { FM } from '../../react-intl-messages'
import './EntityExtractor.css'

interface ExtractResponseForDisplay {
    extractResponse: CLM.ExtractResponse
    isValid: boolean
}

interface ComponentState {
    // Has the user made any changes
    isPendingSubmit: boolean
    pendingVariationChange: boolean
    entityModalOpen: boolean
    entityTypeFilter: string
    warningOpen: boolean
    // Handle saves after round change
    savedExtractResponses: CLM.ExtractResponse[]
    savedRoundIndex: number
    textVariationValue: string
    newTextVariations: CLM.TextVariation[]
}

// TODO: Need to re-define TextVariation / ExtractResponse class defs so we don't need
// to do all the messy conversion back and forth
class EntityExtractor extends React.Component<Props, ComponentState> {
    private doneExtractingButton: any = null;

    constructor(p: any) {
        super(p);
        this.state = {
            isPendingSubmit: false,
            pendingVariationChange: false,
            entityModalOpen: false,
            warningOpen: false,
            savedExtractResponses: [],
            savedRoundIndex: 0,
            textVariationValue: '',
            newTextVariations: [], 
            entityTypeFilter: CLM.EntityType.LUIS
        }
    }
    
    componentDidMount() {
        this.setState({ newTextVariations: this.props.originalTextVariations })
        setTimeout(this.focusPrimaryButton, 100)
    }

    @OF.autobind
    focusPrimaryButton(): void {
        if (this.doneExtractingButton) {
            this.doneExtractingButton.focus();
        }
        else {
            setTimeout(this.focusPrimaryButton, 100)
        }
    }

    componentWillReceiveProps(newProps: Props) {
        // If I'm switching my round or have added/removed text variations
        if (this.props.teachId !== newProps.teachId ||
            this.props.roundIndex !== newProps.roundIndex ||
            this.props.originalTextVariations.length !== newProps.originalTextVariations.length) {

            let nextState: Pick<ComponentState, any> = {
                newTextVariations: [...newProps.originalTextVariations],
                extractionChanged: false,
            }
            // If I made an unsaved change, show save prompt before switching
            if (this.state.isPendingSubmit) {
                nextState = {
                    ...nextState,
                    savedExtractResponses: this.allResponses(),
                    savedRoundIndex: this.props.roundIndex
                }
            }

            this.setState(nextState)
            this.props.clearExtractResponses();  
        }
    }
  
    @OF.autobind
    onEntityConflictModalAbandon() {
        this.setState({
            isPendingSubmit: true
        })
        this.props.clearExtractConflict()
    }

    @OF.autobind
    async onEntityConflictModalAccept() {

        if (!this.props.extractConflict) {
            throw new Error("ExtractConflict is null")
        }
        await this.onUpdateExtractResponse(this.props.extractConflict)

        // If extractions are valid, go ahead and submit them
        const allResponses = this.allResponses()
        if (this.allValid(allResponses)) {
            this.onClickSubmitExtractions()
        }

        // Clear the conflict
        this.props.clearExtractConflict()
    }

    @OF.autobind
    entityEditorHandleClose() {
        this.setState({
            entityModalOpen: false
        })
    }

    @OF.autobind
    onNewEntity(entityTypeFilter: string) {
        this.setState({
            entityModalOpen: true,
            entityTypeFilter: entityTypeFilter
        })
    }
    handleCloseWarning() {
        this.setState({
            warningOpen: false
        })
    }
    handleOpenWarning() {
        this.setState({
            warningOpen: true
        })
    }
    // Returns true if predicted entities match
    isValid(primaryResponse: CLM.ExtractResponse, extractResponse: CLM.ExtractResponse): boolean {
        let missing = primaryResponse.predictedEntities.filter(item =>
            !extractResponse.predictedEntities.find(er => item.entityId === er.entityId));

        if (missing.length > 0) {
            return false;
        }
        missing = extractResponse.predictedEntities.filter(item =>
            !primaryResponse.predictedEntities.find(er => item.entityId === er.entityId));
        if (missing.length > 0) {
            return false;
        }
        return true;
    }

    /**
     * Ensure each extract response has the same types of predicted entities
     * E.g. if Primary (response[0]) has name and color declared, all variations (1 through n) must also
     * have name and color declared
     */
    allValid(extractResponses: CLM.ExtractResponse[]): boolean {
        const primaryExtractResponse = extractResponses[0]
        return extractResponses.every(extractResponse => (extractResponse === primaryExtractResponse) ? true : this.isValid(primaryExtractResponse, extractResponse))
    }

    // Return merge of extract responses and text variations
    allResponses(): CLM.ExtractResponse[] {
        return [...CLM.ModelUtils.ToExtractResponses(this.state.newTextVariations), ...this.props.extractResponses]
            .map(e => ({
                ...e,
                definitions: {
                    ...e.definitions,
                    entities: this.props.entities
                }
            }))
    }

    @OF.autobind
    onClickUndoChanges() {
        this.props.clearExtractResponses();
        this.setState({
            newTextVariations: [...this.props.originalTextVariations],
            isPendingSubmit: false,
        })
        if (this.props.onPendingStatusChanged) {
            this.props.onPendingStatusChanged(false)
        }
    }

    @OF.autobind
    onClickSubmitExtractions(): void {
        this.setState({
            isPendingSubmit: false,
        })
        if (this.props.onPendingStatusChanged) {
            this.props.onPendingStatusChanged(false)
        }
        
        this.submitExtractions(this.allResponses(), this.props.roundIndex)
    }

    submitExtractions(allResponses: CLM.ExtractResponse[], roundIndex: number | null): void {
        const primaryExtractResponse = allResponses[0]
        
        if (!this.allValid(allResponses)) {
            this.handleOpenWarning()
            return
        }

        const textVariations = allResponses.map<CLM.TextVariation>(extractResponse => ({
            text: extractResponse.text,
            // When converting predicted entities to labeled entities the metadata field was lost and causing problems
            // so here we simply re-use predicted entities.
            labelEntities: extractResponse.predictedEntities
        }))

        this.props.onSubmitExtractions(primaryExtractResponse, textVariations, roundIndex);
    }

    onAddExtractResponse(): void {
        this.setState({
            isPendingSubmit: true,
            pendingVariationChange: false
        });

        if (this.props.onPendingStatusChanged) {
            this.props.onPendingStatusChanged(true);
        }
    }

    onChangeTextVariation = (value: string): void => {
        this.setState({
            textVariationValue: value,
            pendingVariationChange: (value.trim().length > 0)
        })
    }

    @OF.autobind
    onRemoveExtractResponse(extractResponse: CLM.ExtractResponse): void {

        // First look for match in extract responses
        let foundResponse = this.props.extractResponses.find(e => e.text === extractResponse.text);
        if (foundResponse) {
            this.props.removeExtractResponse(foundResponse);
            this.setState({ isPendingSubmit: true });
        } else {
            // Otherwise change is in text variation
            let newVariations = this.state.newTextVariations
                .filter(v => v.text !== extractResponse.text);
            this.setState({
                newTextVariations: newVariations,
                isPendingSubmit: true
            });
        }

        if (this.props.onPendingStatusChanged) {
            this.props.onPendingStatusChanged(true);
        }
    }

    @OF.autobind
    async onUpdateExtractResponse(extractResponse: CLM.ExtractResponse): Promise<void> {
        // First look for match in extract responses
        let foundResponse = this.props.extractResponses.find(e => e.text === extractResponse.text)
        if (foundResponse) {
            await this.props.updateExtractResponse(extractResponse)
            await setStateAsync(this, { isPendingSubmit: true })
        } else {
            // Replace existing text variation (if any) with new one and maintain ordering
            let index = this.state.newTextVariations.findIndex((v: CLM.TextVariation) => v.text === extractResponse.text)
            if (index < 0) {
                // Should never happen, but protect just in case
                return
            }
            let newVariation = CLM.ModelUtils.ToTextVariation(extractResponse)
            let newVariations = [...this.state.newTextVariations]
            newVariations[index] = newVariation
            await setStateAsync(this, {
                newTextVariations: newVariations,
                isPendingSubmit: true
            })
        }
        if (this.props.onPendingStatusChanged) {
            this.props.onPendingStatusChanged(true)
        }
    }
    onClickSaveCheckYes() {
        // Submit saved extractions and clear saved responses
        this.submitExtractions(this.state.savedExtractResponses, this.state.savedRoundIndex)
        this.setState({
            savedExtractResponses: [],
            savedRoundIndex: 0
        });
    }
    onClickSaveCheckNo() {
        // Clear saved responses
        this.setState({
            savedExtractResponses: [],
            savedRoundIndex: 0
        });
    }

    @OF.autobind
    async onSubmitTextVariation() {
        let text = this.state.textVariationValue.trim();
        if (text.length === 0) {
            return
        }

        if (this.props.extractType !== CLM.DialogType.TEACH && this.props.roundIndex === null) {
            throw new Error(`You attempted to submit text variation but roundIndex was null. This is likely a problem with the code. Please open an issue.`)
        }
        
        let extractType = this.props.extractType
        // Can't extract on running teach session on existing round
        if (this.props.roundIndex !== null) { 
            if (this.props.editType === EditDialogType.LOG_ORIGINAL || this.props.editType === EditDialogType.LOG_EDITED) {
                extractType = CLM.DialogType.LOGDIALOG
            }
            else {
                extractType = CLM.DialogType.TRAINDIALOG
            }
        }

        // Use teach session Id when in teach, otherwise use dialog Id
        const extractId = extractType === CLM.DialogType.TEACH ? this.props.teachId : this.props.dialogId
        if (extractId === null) {
            throw new Error('Invalid extract Id')
        }

        const userInput: CLM.UserInput = { text: text }
        await this.props.runExtractorThunkAsync(
            this.props.app.appId,
            extractType,
            extractId,
            this.props.roundIndex,
            userInput,
            this.props.originalTrainDialogId
        )

        this.setState({
            isPendingSubmit: true,
            pendingVariationChange: false,
            textVariationValue: ''
        })

        if (this.props.onPendingStatusChanged) {
            this.props.onPendingStatusChanged(true);
        }
    }

    render() {
        const allResponses = this.allResponses();
        const primaryExtractResponse = allResponses[0]
        if (!primaryExtractResponse) {
            return null;
        }

        // Don't show edit components when in auto TEACH or on score step
        const canEdit = (!this.props.autoTeach && this.props.dialogMode === CLM.DialogMode.Extractor && this.props.canEdit) 
        
        // I'm editing an existing round if I'm not in Teach or have selected a round
        const editingRound = canEdit && (this.props.extractType !== CLM.DialogType.TEACH || this.props.roundIndex !== null)

        // If editing is not allowed, only show the primary response which is the first response
        const extractResponsesToRender = canEdit ? allResponses : [primaryExtractResponse]
        const extractResponsesForDisplay = extractResponsesToRender
            .map<ExtractResponseForDisplay>(extractResponse =>
                ({
                    extractResponse,
                    isValid: this.isValid(primaryExtractResponse, extractResponse)
                }))
        const allExtractResponsesValid = extractResponsesForDisplay.every(e => e.isValid)

        return (
            <div className="entity-extractor">
                <OF.Label className={`entity-extractor-help-text ${OF.FontClassNames.smallPlus}`}>
                    <FormattedMessage
                        id={FM.TOOLTIP_ENTITY_EXTRACTOR_HELP}
                        defaultMessage="Select text to label it as an entity."
                    />
                    <HelpIcon tipType={ToolTips.TipType.ENTITY_EXTRACTOR_HELP} />
                </OF.Label>
                {extractResponsesForDisplay.map(({ isValid, extractResponse }, key) => {
                    return <div key={key} className={`editor-container ${OF.FontClassNames.mediumPlus}`}>
                        <ExtractorResponseEditor.EditorWrapper
                            render={(editorProps, onChangeCustomEntities) =>
                                <ExtractorResponseEditor.Editor
                                    readOnly={!canEdit}
                                    isValid={isValid}
                                    entities={this.props.entities}
                                    {...editorProps}

                                    onChangeCustomEntities={onChangeCustomEntities}
                                    onClickNewEntity={this.onNewEntity}
                                />
                            }
                            entities={this.props.entities}
                            extractorResponse={extractResponse}
                            onChange={this.onUpdateExtractResponse}
                        />
                        {(key !== 0) && <div className="editor-container__icons">
                            <button type="button" className={`editor-button-delete ${OF.FontClassNames.large}`} onClick={() => this.onRemoveExtractResponse(extractResponse)}>
                                <OF.Icon iconName="Delete" />
                            </button>
                            {!isValid && ToolTips.wrap(
                                <OF.Icon iconName="IncidentTriangle" className="editor-button-invalid" />,
                                ToolTips.TipType.ENTITY_EXTRACTOR_WARNING)}
                        </div>}
                        {!isValid && <div className="ms-TextField-errorMessage css-84 errorMessage_20d9206e">
                            <FormattedMessage id={FM.TOOLTIP_ENTITY_EXTRACTOR_WARNING} defaultMessage="Text Variations must contain the same detected Entities as the primary input text." />
                        </div>}
                    </div>
                })}
                {canEdit &&
                    <div className='cl-textfield--withButton editor-alt-offset'>
                        <OF.TextField
                            data-testid="entity-extractor-alternative-input-text"
                            value={this.state.textVariationValue}
                            onChanged={this.onChangeTextVariation}
                            placeholder={this.props.intl.formatMessage({
                                id: FM.TEXTVARIATION_PLACEHOLDER,
                                defaultMessage: "Add alternative input..."
                            })}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    this.onSubmitTextVariation()
                                    event.preventDefault()
                                }
                            }}
                        />
                        <OF.PrimaryButton
                            data-testid="entity-extractor-add-alternative-input-button"
                            className='cl-button--inline'
                            disabled={this.state.textVariationValue.trim().length === 0}
                            onClick={this.onSubmitTextVariation}
                            ariaDescription={'Add'}
                            text={'Add'}
                            componentRef={(ref: any) => { this.doneExtractingButton = ref }}
                        />
                </div>}
                {editingRound &&
                    <div className="cl-buttons-row">
                        <OF.PrimaryButton
                            disabled={!this.state.isPendingSubmit || !allExtractResponsesValid || this.state.pendingVariationChange}
                            onClick={this.onClickSubmitExtractions}
                            ariaDescription={'Submit Changes'}
                            text={'Submit Changes'}
                            componentRef={(ref: any) => { this.doneExtractingButton = ref }}
                        />
                        <OF.PrimaryButton
                            disabled={!this.state.isPendingSubmit}
                            onClick={this.onClickUndoChanges}
                            ariaDescription="Undo Changes"
                            text="Undo"
                        />
                    </div>
                }
                {!editingRound &&
                    <div className="cl-buttons-row">
                        <OF.PrimaryButton
                            data-testid="entity-extractor-score-actions-button"
                            disabled={!allExtractResponsesValid || this.state.pendingVariationChange}
                            onClick={this.onClickSubmitExtractions}
                            ariaDescription={'Score Actions'}
                            text={'Score Actions'}
                            componentRef={(ref: any) => { this.doneExtractingButton = ref }}
                        />
                    </div>
                }
                <div className="cl-dialog-admin__dialogs">
                    <EntityCreatorEditor
                        data-testid="entity-extractor-editor"
                        app={this.props.app}
                        editingPackageId={this.props.editingPackageId}
                        open={this.state.entityModalOpen}
                        entity={null}
                        handleClose={this.entityEditorHandleClose}
                        handleDelete={() => {}}
                        entityTypeFilter={this.state.entityTypeFilter as any}
                    />
                    <OF.Dialog
                        data-testid="entity-extractor-dialog"
                        hidden={!this.state.warningOpen}
                        dialogContentProps={{
                            type: OF.DialogType.normal,
                            title: 'Text variations must all have same tagged entities.'
                        }}
                        modalProps={{
                            isBlocking: false
                        }}
                    >
                        <OF.DialogFooter>
                            <OF.PrimaryButton onClick={() => this.handleCloseWarning()} text='Ok' />
                        </OF.DialogFooter>
                    </OF.Dialog>
                    <OF.Dialog
                        data-testid="entity-extractor-dialog-confirm"
                        hidden={this.state.savedExtractResponses.length === 0}
                        dialogContentProps={{
                            type: OF.DialogType.normal,
                            title: 'Do you want to save your Entity Detection changes?'
                        }}
                        modalProps={{
                            isBlocking: true
                        }}
                    >
                        <OF.DialogFooter>
                            <OF.PrimaryButton onClick={() => this.onClickSaveCheckYes()} text='Yes' />
                            <OF.DefaultButton onClick={() => this.onClickSaveCheckNo()} text='No' />
                        </OF.DialogFooter>
                    </OF.Dialog>
                    {this.props.extractConflict &&
                        <ExtractConflictModal
                            open={true}
                            entities={this.props.entities}
                            extractResponse={this.props.extractConflict}
                            onClose={this.onEntityConflictModalAbandon}
                            onAccept={this.onEntityConflictModalAccept}
                        />
                    }
                </div>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        updateExtractResponse : actions.teach.updateExtractResponse,
        removeExtractResponse : actions.teach.removeExtractResponse,
        runExtractorThunkAsync : actions.teach.runExtractorThunkAsync,
        clearExtractResponses : actions.teach.clearExtractResponses,
        clearExtractConflict: actions.teach.clearExtractConflict
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render TeachSessionAdmin but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        entities: state.entities
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    editingPackageId: string
    canEdit: boolean
    extractType: CLM.DialogType
    editType: EditDialogType
    // ID of running teach session
    teachId: string | null
    // ID of related trainDialog
    dialogId: string | null
    // Train Dialog that this originally came from
    originalTrainDialogId: string | null,
    roundIndex: number | null
    autoTeach: boolean
    dialogMode: CLM.DialogMode
    extractResponses: CLM.ExtractResponse[]
    extractConflict: CLM.ExtractResponse | null
    originalTextVariations: CLM.TextVariation[]
    onSubmitExtractions: (extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[], roundIndex: number | null) => void
    onPendingStatusChanged?: (hasChanged: boolean) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EntityExtractor) as any)
