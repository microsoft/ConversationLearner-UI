/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { AppBase, ModelUtils, ExtractResponse, TrainDialog, TextVariation, DialogType, EntityType, UserInput, DialogMode } from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react';
import * as ExtractorResponseEditor from '../ExtractorResponseEditor'
import EntityCreatorEditor from './EntityCreatorEditor';
import { clearExtractResponses, updateExtractResponse, removeExtractResponse, runExtractorThunkAsync } from '../../actions/teachActions'
import * as ToolTips from '../ToolTips'
import HelpIcon from '../HelpIcon'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { autobind } from 'office-ui-fabric-react';
import { FM } from '../../react-intl-messages'
import './EntityExtractor.css'
import InconstentEntityLabellingModal from './InconstentEntityLabellingModal'

interface ExtractResponseForDisplay {
    extractResponse: ExtractResponse
    isValid: boolean
}

interface ComponentState {
    // Has the user made any changes
    extractionChanged: boolean
    pendingVariationChange: boolean
    entityModalOpen: boolean
    inconsistentEntityModalOpen: boolean
    warningOpen: boolean
    // Handle saves after round change
    savedExtractResponses: ExtractResponse[]
    savedRoundIndex: number
    textVariationValue: string
    newTextVariations: TextVariation[]
};

// TODO: Need to re-define TextVariation / ExtractResponse class defs so we don't need
// to do all the messy conversion back and forth
export class EntityExtractor extends React.Component<Props, ComponentState> {
    private doneExtractingButton: any = null;

    constructor(p: any) {
        super(p);
        this.state = {
            extractionChanged: false,
            pendingVariationChange: false,
            entityModalOpen: false,
            inconsistentEntityModalOpen: false,
            warningOpen: false,
            savedExtractResponses: [],
            savedRoundIndex: 0,
            textVariationValue: '',
            newTextVariations: []
        }
    }
    
    componentDidMount() {
        this.setState({ newTextVariations: this.props.originalTextVariations })
        setTimeout(this.focusPrimaryButton, 500);
    }

    @autobind
    focusPrimaryButton(): void {
        if (this.doneExtractingButton) {
            this.doneExtractingButton.focus();
        }
    }
    componentWillReceiveProps(newProps: Props) {
        // If I'm switching my round or have added/removed text variations
        if (this.props.sessionId !== newProps.sessionId ||
            this.props.roundIndex !== newProps.roundIndex ||
            this.props.originalTextVariations.length !== newProps.originalTextVariations.length) {

            let nextState: Pick<ComponentState, any> = {
                newTextVariations: [...newProps.originalTextVariations],
                extractionChanged: false,
            }
            // If I made an unsaved change, show save prompt before switching
            if (this.state.extractionChanged) {
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

    @autobind
    entityEditorHandleClose() {
        this.setState({
            entityModalOpen: false
        })
    }

    @autobind
    onNewEntity() {
        this.setState({
            entityModalOpen: true
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
    /** Returns true is predicted entities match */
    isValid(primaryResponse: ExtractResponse, extractResponse: ExtractResponse): boolean {
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
    allValid(primaryExtractResponse: ExtractResponse, extractResponses: ExtractResponse[]): boolean {
        return extractResponses.every(extractResponse => (extractResponse === primaryExtractResponse) ? true : this.isValid(primaryExtractResponse, extractResponse))
    }

    // Return merge of extract responses and text variations
    allResponses(): ExtractResponse[] {
        return [...ModelUtils.ToExtractResponses(this.state.newTextVariations), ...this.props.extractResponses]
            .map(e => ({
                ...e,
                definitions: {
                    ...e.definitions,
                    entities: this.props.entities
                }
            }))
    }

    @autobind
    onClickUndoChanges() {
        this.props.clearExtractResponses();
        this.setState({
            newTextVariations: [...this.props.originalTextVariations],
            extractionChanged: false,
        });
        if (this.props.onExtractionsChanged) {
            this.props.onExtractionsChanged(false);
        }
    }

    @autobind
    onClickSubmitExtractions(extractResponses: ExtractResponse[], inconsistenceResponses: ExtractResponse[]) {
        this.setState({
            extractionChanged: false,
        });
        if (this.props.onExtractionsChanged) {
            this.props.onExtractionsChanged(false);
        }
        this.submitExtractions(extractResponses, inconsistenceResponses, this.props.roundIndex);
    }
    submitExtractions(allResponses: ExtractResponse[], inconsistenceResponses: ExtractResponse[], roundIndex: number) {
        const primaryExtractResponse = allResponses[0]
        
        if (!this.allValid(primaryExtractResponse, allResponses)) {
            this.handleOpenWarning();
            return;
        }

        if (inconsistenceResponses.length > 0) {
            this.openInconsistentEntityReviewModal()
            return;
        }

        const textVariations = allResponses.map<TextVariation>(extractResponse => ({
            text: extractResponse.text,
            // When converting predicted entities to labeled entities the metadata field was lost and causing problems
            // so here we simply re-use predicted entities.
            labelEntities: extractResponse.predictedEntities
        }))

        this.props.onTextVariationsExtracted(primaryExtractResponse, textVariations, roundIndex);
    }

    openInconsistentEntityReviewModal = () => {
        this.setState({
            inconsistentEntityModalOpen: true
        })
    }

    onAddExtractResponse(): void {
        this.setState({
            extractionChanged: true,
            pendingVariationChange: false
        });

        if (this.props.onExtractionsChanged) {
            this.props.onExtractionsChanged(true);
        }
    }

    onChangeTextVariation = (value: string): void => {
        this.setState({
            textVariationValue: value,
            pendingVariationChange: (value.trim().length > 0)
        })
    }

    @autobind
    onRemoveExtractResponse(extractResponse: ExtractResponse): void {

        // First look for match in extract responses
        let foundResponse = this.props.extractResponses.find(e => e.text === extractResponse.text);
        if (foundResponse) {
            this.props.removeExtractResponse(foundResponse);
            this.setState({ extractionChanged: true });
        } else {
            // Otherwise change is in text variation
            let newVariations = this.state.newTextVariations
                .filter(v => v.text !== extractResponse.text);
            this.setState({
                newTextVariations: newVariations,
                extractionChanged: true
            });
        }

        if (this.props.onExtractionsChanged) {
            this.props.onExtractionsChanged(true);
        }
    }

    @autobind
    onUpdateExtractResponse(extractResponse: ExtractResponse): void {
        // First for match in extract responses
        let foundResponse = this.props.extractResponses.find(e => e.text === extractResponse.text);
        if (foundResponse) {
            this.props.updateExtractResponse(extractResponse);
            this.setState({
                extractionChanged: true
            });
        } else {
            // Replace existing text variation (if any) with new one and maintain ordering
            let index = this.state.newTextVariations.findIndex((v: TextVariation) => v.text === extractResponse.text);
            if (index < 0) {
                // Should never happen, but protect just in case
                return;
            }
            let newVariation = ModelUtils.ToTextVariation(extractResponse);
            let newVariations = [...this.state.newTextVariations];
            newVariations[index] = newVariation;
            this.setState({
                newTextVariations: newVariations,
                extractionChanged: true
            });
        }
        if (this.props.onExtractionsChanged) {
            this.props.onExtractionsChanged(true);
        }
    }
    onClickSaveCheckYes() {
        // Submit saved extractions and clear saved responses
        this.submitExtractions(this.state.savedExtractResponses, [], this.state.savedRoundIndex);
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

    @autobind
    onSubmitTextVariation() {
        let text = this.state.textVariationValue.trim();
        if (text.length === 0) {
            return;
        }
        const userInput: UserInput = { text: text }
        this.props.runExtractorThunkAsync(
            this.props.user.id,
            this.props.app.appId,
            this.props.extractType,
            this.props.sessionId,
            this.props.roundIndex,
            userInput
        )

        this.setState({
            extractionChanged: true,
            pendingVariationChange: false,
            textVariationValue: ''
        })

        if (this.props.onExtractionsChanged) {
            this.props.onExtractionsChanged(true);
        }
    }

    static getUnique <T>(xs: T[], getKey: (x: T) => any): T[] {
        const map = new Map<any, T>()

        xs.forEach(x => {
            const key = getKey(x)

            if (!map.has(key)) {
                map.set(key, x)
            }
        })

        return Array.from(map.values())
    }

    /**
     * Get all text variations that have same text but different entities
     */
    static getInconsistentResponses(trainDialogs: TrainDialog[], pendingExtractResponses: ExtractResponse[]): ExtractResponse[] {
        // We assume all text variations within existing valid train dialogs are consistent
        const textVarations = trainDialogs
            .filter(td => !td.invalid)
            .map(td => td.rounds.map(r => r.extractorStep.textVariations))
            .reduce((a, b) => [...a, ...b], []).reduce((a, b) => [...a, ...b], [])

        const uniqueTextVarations = EntityExtractor.getUnique(textVarations, tv => tv.text.toLocaleLowerCase())

        const inconsistentTextVariations = uniqueTextVarations.reduce<ExtractResponse[]>((inconsistentVariations, textVariation) => {
            // If text variation is inconsistent with new extract responses and it's not already in the list of inconsistent
            // TODO: Use more than text to check for uniquness
            if (pendingExtractResponses.some(e => EntityExtractor.isInconsistentExtraction(e, textVariation)))
            {
                inconsistentVariations.push(ModelUtils.ToExtractResponses([textVariation])[0])
            }
            return inconsistentVariations
        }, [])

        return inconsistentTextVariations
    }

    /**
     * Return true if textVariation contains same text but different entities
     */
    static isInconsistentExtraction(newExtractResponse: ExtractResponse, textVariation: TextVariation): boolean {
        // If responses have different text they are not comparable, cannot conclude inconsistency
        if (newExtractResponse.text !== textVariation.text) {
            return false
        }

        // If responses have different number of entities
        if (newExtractResponse.predictedEntities.length !== textVariation.labelEntities.length) {
            return true
        }

        // If response contains different entities (id or position)
        const inconsistentEntities = newExtractResponse.predictedEntities.reduce((entityConsistency, predictedEntity) => {
            const matchingLabelledEntity = textVariation.labelEntities
                .find(le => le.entityId === predictedEntity.entityId
                    && le.startCharIndex === predictedEntity.startCharIndex
                    && le.endCharIndex == predictedEntity.endCharIndex)

            /**
             * If there is no matching labelled entity for the given predicted entity
             * then there must be an inconsistency
             */
            if (!matchingLabelledEntity) {
                entityConsistency.push(predictedEntity)
            }
            return entityConsistency
        }, [])

        return inconsistentEntities.length > 0
    }

    onClickAcceptInconsistentEntityModal = (extractResponses: ExtractResponse[]) => {
        extractResponses.forEach(extractResponse => this.props.updateExtractResponse(extractResponse))
        this.setState({
            inconsistentEntityModalOpen: false
        })
    }

    onClickCloseInconsistentEntityModal = () => {
        this.setState({
            inconsistentEntityModalOpen: false
        })
    }

    render() {
        const allResponses = this.allResponses();
        const inconsistentResponses = EntityExtractor.getInconsistentResponses(this.props.trainDialogs, allResponses)
        const hasInconsistentResponses = inconsistentResponses.length > 0
        console.log(`trainDialogs: `, this.props.trainDialogs)
        const primaryExtractResponse = allResponses[0]
        if (!primaryExtractResponse) {
            return null;
        }

        // Don't show edit components when in auto TEACH or on score step
        const canEdit = (!this.props.autoTeach && this.props.dialogMode === DialogMode.Extractor && this.props.canEdit) 
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
                            {!isValid && ToolTips.Wrap(
                                <OF.Icon iconName="IncidentTriangle" className="editor-button-invalid" />,
                                ToolTips.TipType.ENTITY_EXTRACTOR_WARNING)}
                        </div>}
                        {!isValid && <div className="ms-TextField-errorMessage css-84 errorMessage_20d9206e">
                            <FormattedMessage id={FM.TOOLTIP_ENTITY_EXTRACTOR_WARNING} defaultMessage="Text Variations must contain the same detected Entities as the primary input text." />
                        </div>}
                    </div>
                })}
                {canEdit && this.props.extractType !== DialogType.LOGDIALOG && 
                    <div className='cl-textfield--withButton editor-alt-offset'>
                        <OF.TextField
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
                            className='cl-button--inline'
                            disabled={this.state.textVariationValue.trim().length === 0}
                            onClick={this.onSubmitTextVariation}
                            ariaDescription={'Add'}
                            text={'Add'}
                            componentRef={(ref: any) => { this.doneExtractingButton = ref }}
                        />
                </div>}
                {canEdit && this.props.extractType !== DialogType.TEACH &&
                    <div className="cl-buttons-row">
                        <OF.PrimaryButton
                            disabled={!this.state.extractionChanged || !allExtractResponsesValid || this.state.pendingVariationChange}
                            onClick={() => this.onClickSubmitExtractions(allResponses, inconsistentResponses)}
                            ariaDescription={'Submit Changes'}
                            text={'Submit Changes'}
                            componentRef={(ref: any) => { this.doneExtractingButton = ref }}
                        />
                        <OF.PrimaryButton
                            disabled={!this.state.extractionChanged}
                            onClick={this.onClickUndoChanges}
                            ariaDescription="Undo Changes"
                            text="Undo"
                        />
                    </div>
                }
                {canEdit && this.props.extractType === DialogType.TEACH &&
                    <div>
                        {hasInconsistentResponses
                        && <div>
                            <div className="ms-TextField-errorMessage css-84 errorMessage_20d9206e">
                                <OF.Icon iconName="IncidentTriangle" className="editor-button-invalid" />&nbsp;<FormattedMessage id={FM.TOOLTIP_ENTITY_EXTRACTOR_INCONSISTENT_LABEL} defaultMessage="Entities labelled differently in other phrase." />
                            </div>
                        </div>}
                        <div className="cl-buttons-row">
                            <OF.PrimaryButton
                                data-testid="button-proceedto-scoreactions"
                                disabled={!allExtractResponsesValid || this.state.pendingVariationChange}
                                onClick={() => this.onClickSubmitExtractions(allResponses, inconsistentResponses)}
                                ariaDescription={'Score Actions'}
                                text={'Score Actions'}
                                componentRef={(ref: any) => { this.doneExtractingButton = ref }}
                            />
                        </div>
                    </div>
                }
                <div className="cl-dialog-admin__dialogs">
                    <EntityCreatorEditor
                        data-testid="entityextractor-editor"
                        app={this.props.app}
                        editingPackageId={this.props.editingPackageId}
                        open={this.state.entityModalOpen}
                        entity={null}
                        handleClose={this.entityEditorHandleClose}
                        handleDelete={() => {}}
                        entityTypeFilter={EntityType.LUIS}
                    />
                    <InconstentEntityLabellingModal
                        isOpen={this.state.inconsistentEntityModalOpen}
                        inconsistentExtractResponses={inconsistentResponses}
                        onClickAccept={this.onClickAcceptInconsistentEntityModal}
                        onClickClose={this.onClickCloseInconsistentEntityModal}
                    />
                    <OF.Dialog
                        data-testid="entityextractor-dialog"
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
                        data-testid="entityextractor-dialog-confirm"
                        hidden={this.state.savedExtractResponses.length === 0}
                        isBlocking={true}
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
                </div>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        updateExtractResponse,
        removeExtractResponse,
        runExtractorThunkAsync,
        clearExtractResponses
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        entities: state.entities,
        trainDialogs: state.trainDialogs
    }
}

export interface ReceivedProps {
    app: AppBase
    editingPackageId: string
    canEdit: boolean
    extractType: DialogType
    sessionId: string
    roundIndex: number
    autoTeach: boolean
    dialogMode: DialogMode
    extractResponses: ExtractResponse[]
    originalTextVariations: TextVariation[]
    onTextVariationsExtracted: (extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number) => void
    onExtractionsChanged?: (hasChanged: boolean) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EntityExtractor))
