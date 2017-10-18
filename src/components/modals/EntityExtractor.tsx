import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { ModelUtils, ExtractResponse, TextVariation, DialogType } from 'blis-models'
import * as OF from 'office-ui-fabric-react';
import TextVariationCreator from '../TextVariationCreator';
import ExtractorResponseEditor from '../ExtractorResponseEditor';
import EntityCreatorEditor from './EntityCreatorEditor';
import { TeachMode } from '../../types/const'
import PopUpMessage from '../PopUpMessage';
import { clearExtractResponses, updateExtractResponse, removeExtractResponse } from '../../actions/teachActions'
import './EntityExtractor.css'

interface ComponentState {
    // Has the user made any changes
    extractionChanged: boolean,
    entityModalOpen: boolean,
    warningOpen: boolean, 
    // Handle saves after round change
    savedExtractResponses: ExtractResponse[],
    savedRoundIndex: number
    newTextVariations: TextVariation[]
};

// TODO: Need to re-define TextVariaion / ExtractResponse class defs so we don't need
// to do all the messy conversion back and forth
class EntityExtractor extends React.Component<Props, ComponentState> {
    private doneExtractingButton: any = null;

    constructor(p: any) {
        super(p);
        this.state = {
            extractionChanged: false,
            entityModalOpen: false,
            warningOpen: false,
            savedExtractResponses: null,
            savedRoundIndex: 0,
            newTextVariations: []
        }
        this.entityButtonOnClick = this.entityButtonOnClick.bind(this);
        this.onClickSubmitExtractions = this.onClickSubmitExtractions.bind(this);
        this.onClickUndoChanges = this.onClickUndoChanges.bind(this);
        this.entityEditorHandleClose = this.entityEditorHandleClose.bind(this);
        this.onRemoveExtractResponse = this.onRemoveExtractResponse.bind(this)
        this.onUpdateExtractResponse = this.onUpdateExtractResponse.bind(this)
        this.focusPrimaryButton = this.focusPrimaryButton.bind(this);
    }
    componentWillMount() {
        this.setState({newTextVariations : this.props.originalTextVariations})
    }

    componentDidMount() {
        setTimeout(this.focusPrimaryButton, 500);
    }
    focusPrimaryButton(): void {
        if (this.doneExtractingButton) {
            this.doneExtractingButton.focus();
        }
    }
    componentWillReceiveProps(newProps: Props) {
        // If I'm swiching my round or have added/removed text variations
        if (this.props.sessionId != newProps.sessionId || 
            this.props.roundIndex != newProps.roundIndex ||
            this.props.originalTextVariations.length != newProps.originalTextVariations.length) {
            // If I made an unsaved change, show save prompt before switching
            if (this.state.extractionChanged) {
                this.setState({
                    newTextVariations: [...newProps.originalTextVariations],
                    extractionChanged: false,
                    savedExtractResponses: this.allResponses(),
                    savedRoundIndex: this.props.roundIndex
                });
            } else {
                this.setState({
                    newTextVariations: [...newProps.originalTextVariations],
                    extractionChanged: false
                })
            }
           this.props.clearExtractResponses();
        }
    }
    entityEditorHandleClose() {
        this.setState({
            entityModalOpen: false
        })
    }
    entityButtonOnClick() {
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
            !extractResponse.predictedEntities.find(er => item.entityId == er.entityId));

        if (missing.length > 0) {
            return false;
        }
        missing = extractResponse.predictedEntities.filter(item =>
            !primaryResponse.predictedEntities.find(er => item.entityId == er.entityId));
        if (missing.length > 0) {
            return false;
        }
        return true;
    } 
    allValid(extractResponses : ExtractResponse[]): boolean {
        for (let extractResponse of extractResponses) {
            if (extractResponse != extractResponses[0]) {
                if (!this.isValid(extractResponses[0], extractResponse)) {
                    return false;
                }
            }
        }
        return true;
    }
    // Return merge of extract responses and text variations
    allResponses(): ExtractResponse[] {
        let convertedVariations = ModelUtils.ToExtractResponses(this.state.newTextVariations as TextVariation[]);
        let allResponses = [...convertedVariations, ...this.props.extractResponses];
        return allResponses;
    }
    onClickUndoChanges()
    {
        this.props.clearExtractResponses();
        this.setState({
            newTextVariations: [...this.props.originalTextVariations],
            extractionChanged: false,
        });
    }
    onClickSubmitExtractions()
    {
        this.submitExtractions(this.allResponses(), this.props.roundIndex);
    }
    submitExtractions(allResponses : ExtractResponse[], roundIndex: number) {
        // Clear saved responses
        this.setState({
            savedExtractResponses: null,
            savedRoundIndex: 0,
            extractionChanged: false}
        );

        if (!this.allValid(allResponses)) {
            this.handleOpenWarning();
            return;
        }

        let textVariations: TextVariation[] = [];
        for (let extractResponse of allResponses) {
            let labeledEntities = ModelUtils.ToLabeledEntities(extractResponse.predictedEntities);
            textVariations.push(new TextVariation({ text: extractResponse.text, labelEntities: labeledEntities }));
        }     
        this.props.onTextVariationsExtracted(allResponses[0], textVariations, roundIndex);

    }
    onAddExtractResponse() : void {
        this.setState({extractionChanged: true});
    }
    onRemoveExtractResponse(extractResponse: ExtractResponse) : void {

        // First look for match in extract reponses
        let foundResponse = this.props.extractResponses.find(e => e.text == extractResponse.text);
        if (foundResponse) {
            this.props.removeExtractResponse(foundResponse);
            this.setState({extractionChanged: true});
        }
        // Otherwise change is in text variation
        else {
            // Remove from text variations
            let newVariations = this.state.newTextVariations.filter((v : TextVariation) => v.text != extractResponse.text);
            this.setState({
                newTextVariations: newVariations,
                extractionChanged: true
            });
        }
    }
    onUpdateExtractResponse(extractResponse: ExtractResponse) : void {

        // First for match in extract reponses
        let foundResponse = this.props.extractResponses.find(e => e.text == extractResponse.text);
        if (foundResponse) {
            this.props.updateExtractResponse(extractResponse);
            this.setState({
                extractionChanged: true
            });
        }
        else {
            // Replace existing text variation (if any) with new one and maintain ordering
            let index = this.state.newTextVariations.findIndex((v : TextVariation) => v.text == extractResponse.text);
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
    }
    onClickSaveCheckYes() {
        // Submit saved extractions and clear saved responses
        this.submitExtractions(this.state.savedExtractResponses, this.state.savedRoundIndex);
        this.setState({
            savedExtractResponses: null,
            savedRoundIndex: 0
        });
    }
    onClickSaveCheckNo() {
        // Clear saved responses
        this.setState({
            savedExtractResponses: null,
            savedRoundIndex: 0
        });
    }
    render() {
        let allResponses = this.allResponses();
        if (!allResponses[0]) {
            return null;
        }

        // Don't show edit components when in auto TEACH or on score step
        let canEdit = (!this.props.autoTeach && this.props.teachMode == TeachMode.Extractor);
        let variationCreator = null;
        let addEntity = null;
        let editComponents = null;
        let extractDisplay = null;
        if (canEdit) {

            variationCreator = <TextVariationCreator
                appId={this.props.appId}
                sessionId={this.props.sessionId}
                extractType={this.props.extractType}
                roundIndex={this.props.roundIndex}
                onAddVariation={() => this.onAddExtractResponse()} />

            addEntity =
                <OF.PrimaryButton
                    onClick={this.entityButtonOnClick}
                    ariaDescription='Cancel'
                    text='Entity'
                    iconProps={{ iconName: 'CirclePlus' }}
                />

            extractDisplay = [];
            let allValid = true;
            let key = 0;
            for (let extractResponse of allResponses) {
                let isValid = true;
                if (extractResponse != allResponses[0]) {
                    isValid = this.isValid(allResponses[0], extractResponse);
                    if (!isValid) {
                        allValid = false;
                    }
                }

                extractDisplay.push(<ExtractorResponseEditor
                    canEdit={canEdit}
                    key={key++}
                    isPrimary={key == 1}
                    isValid={isValid}
                    extractResponse={extractResponse}
                    updateExtractResponse={extractResponse => this.onUpdateExtractResponse(extractResponse)}
                    removeExtractResponse={extractResponse => this.onRemoveExtractResponse(extractResponse)}
                />);
            }

            editComponents = (this.props.extractType != DialogType.TEACH) ?  
                (
                    <div className="blis-buttons-row">
                        <OF.PrimaryButton 
                            disabled={!this.state.extractionChanged || !allValid}
                            onClick={this.onClickSubmitExtractions}
                            ariaDescription={"Sumbit Changes"}
                            text={"Submit Changes"}
                            componentRef={(ref: any) => { this.doneExtractingButton = ref }}
                        />
                        <OF.PrimaryButton 
                            disabled={!this.state.extractionChanged}
                            onClick={this.onClickUndoChanges}
                            ariaDescription="Undo Changes"
                            text="Undo"
                        />
                    </div>
                ) :(
                    <div className="blis-buttons-row">
                        <OF.PrimaryButton 
                            disabled={!allValid}
                            onClick={this.onClickSubmitExtractions}
                            ariaDescription={"Score Actions"}
                            text={"Score Actions"}
                            componentRef={(ref: any) => { this.doneExtractingButton = ref }}
                        />
                    </div>
                )

        }
        else {
            // Only display primary response if not in edit mode
            const extractResponse = allResponses[0]
            extractDisplay = <ExtractorResponseEditor
                canEdit={canEdit}
                key={0}
                isPrimary={true}
                isValid={true}
                extractResponse={extractResponse}
                updateExtractResponse={extractResponse => this.onUpdateExtractResponse(extractResponse)}
                removeExtractResponse={extractResponse => this.onRemoveExtractResponse(extractResponse)}
            />
        }

        return (
            <div>
                <div>
                    <div className="blis-dialog-creation-buttons">
                        {addEntity}
                        <EntityCreatorEditor
                            open={this.state.entityModalOpen}
                            entity={null}
                            handleClose={this.entityEditorHandleClose} />
                    </div>
                    {extractDisplay}
                    {variationCreator}
                </div>
                {editComponents}
                <PopUpMessage open={this.state.warningOpen} onConfirm={() => this.handleCloseWarning()} title="Text variations must all have same tagged entities." />
                <div className="blis-dialog-admin__dialogs">
                    <OF.Dialog
                        hidden={this.state.savedExtractResponses === null}
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
        clearExtractResponses
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        entities: state.entities
    }
}

export interface ReceivedProps {
    appId: string,
    extractType: DialogType,
    sessionId: string,
    roundIndex: number,
    autoTeach: boolean
    teachMode: TeachMode,
    extractResponses: ExtractResponse[],
    originalTextVariations: TextVariation[],
    onTextVariationsExtracted: (extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number) => void,
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(EntityExtractor);
