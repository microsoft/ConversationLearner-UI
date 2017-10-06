import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { PredictedEntity, LabeledEntity, ExtractResponse, TextVariation, ExtractType } from 'blis-models'
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import TextVariationCreator from '../TextVariationCreator';
import ExtractorResponseEditor from '../ExtractorResponseEditor';
import EntityCreatorEditor from './EntityCreatorEditor';
import { TeachMode } from '../../types/const'
import PopUpMessage from '../PopUpMessage';
import { updateExtractResponse, removeExtractResponse } from '../../actions/teachActions'
import './EntityExtractor.css'

interface ComponentState {
    entityModalOpen: boolean,
    popUpOpen: boolean
};

class EntityExtractor extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p)
        this.state = {
            entityModalOpen: false,
            popUpOpen: false
        }
        this.onClickCreateEntity = this.onClickCreateEntity.bind(this);
        this.onClickDoneExtracting = this.onClickDoneExtracting.bind(this);
        this.entityEditorHandleClose = this.entityEditorHandleClose.bind(this);
    }
    componentDidMount() {
        findDOMNode<HTMLButtonElement>(this.refs.doneExtractingButton).focus();
    }
    componentDidUpdate() {
        // If not in interactive mode run scorer automatically
        if (this.props.autoTeach && this.props.teachMode == TeachMode.Extractor) {
            this.onClickDoneExtracting();
        }
    }
    entityEditorHandleClose() {
        this.setState({
            entityModalOpen: false
        })
    }
    onClickCreateEntity() {
        this.setState({
            entityModalOpen: true
        })
    }
    onClickConfirmPopUpModal() {
        this.setState({
            popUpOpen: false
        })
    }
    openPopUpModal() {
        this.setState({
            popUpOpen: true
        })
    }

    /** Returns true if predicted entities match */
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

    /**
     * Ensure each extract response has the same types of predicted entities
     * E.g. if Primary (response[0]) has name and color declared, all variations (1 through n) must also
     * have name and color declared
     */
    allValid(extractResponses: ExtractResponse[]): boolean {
        return extractResponses.every(extractResponse => (extractResponse === extractResponses[0]) ? true : this.isValid(extractResponses[0], extractResponse))
    }
    toLabeledEntities(predictedEntities: PredictedEntity[]): LabeledEntity[] {
        return predictedEntities.map<LabeledEntity>(predictedEntity => new LabeledEntity(predictedEntity))
    }
    toPredictedEntities(labeledEntities: LabeledEntity[]): PredictedEntity[] {
        return labeledEntities.map<PredictedEntity>(labeledEntity => new PredictedEntity(labeledEntity))
    }
    toExtractResponses(textVariations: TextVariation[]): ExtractResponse[] {
        return textVariations.map<ExtractResponse>(textVariation => new ExtractResponse({
            text: textVariation.text,
            predictedEntities: this.toPredictedEntities(textVariation.labelEntities)
        }))
    }

    // Return merge of extract responses and text variations
    allResponses(): ExtractResponse[] {
        let convertedVariations = this.toExtractResponses(this.props.textVariations);
        let allResponses = [...convertedVariations, ...this.props.extractResponses];
        return allResponses;
    }

    onClickDoneExtracting() {
        let allResponses = this.allResponses();

        if (!this.allValid(allResponses)) {
            this.openPopUpModal();
            return;
        }

        let textVariations = allResponses.map<TextVariation>(extractResponse => new TextVariation({
            text: extractResponse.text,
            labelEntities: this.toLabeledEntities(extractResponse.predictedEntities)
        }))

        this.props.onTextVariationsExtracted(allResponses[0], textVariations);
    }
    render() {
        let allResponses = this.allResponses();
        if (!allResponses[0]) {
            return null;
        }

        // Don't show edit components when in auto TEACH or on score step
        const canEdit = (!this.props.autoTeach && this.props.teachMode == TeachMode.Extractor);
        const extractResponsesToRender = canEdit ? allResponses : [allResponses[0]]

        return (
            <div>
                <div>
                    {extractResponsesToRender.map((extractResponse, key) => {
                        let isValid = true;
                        if (extractResponse !== allResponses[0]) {
                            isValid = this.isValid(allResponses[0], extractResponse);
                        }

                        return <ExtractorResponseEditor
                            canEdit={canEdit}
                            key={key}
                            isPrimary={key === 0}
                            isValid={isValid}
                            extractResponse={extractResponse}
                            updateExtractResponse={extractResponse => this.props.updateExtractResponse(extractResponse)}
                            removeExtractResponse={extractResponse => this.props.removeExtractResponse(extractResponse)}
                        />
                    })}
                    {canEdit &&
                        <TextVariationCreator
                            appId={this.props.appId}
                            sessionId={this.props.sessionId}
                            extractType={this.props.extractType}
                            turnIndex={this.props.turnIndex}
                        />
                    }
                </div>
                {canEdit &&
                    <div className="blis-entity-extractor-buttons">
                        <PrimaryButton
                            onClick={this.onClickDoneExtracting}
                            className='blis-button--gold'
                            ariaDescription={this.props.extractButtonName}
                            text={this.props.extractButtonName}
                            ref="doneExtractingButton"
                        />

                        <DefaultButton
                            className="blis-button--gold"
                            onClick={this.onClickCreateEntity}
                            ariaDescription='Cancel'
                            text='Entity'
                            iconProps={{ iconName: 'CirclePlus' }}
                        />

                    </div>
                }

                {/* Modals */}
                <EntityCreatorEditor
                    open={this.state.entityModalOpen}
                    entity={null}
                    handleClose={this.entityEditorHandleClose}
                />
                <PopUpMessage
                    open={this.state.popUpOpen}
                    onConfirm={() => this.onClickConfirmPopUpModal()}
                    title="Text variations must all have same tagged entities."
                />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        updateExtractResponse,
        removeExtractResponse
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        entities: state.entities,
        extractResponses: state.teachSessions.extractResponses
    }
}

export interface ReceivedProps {
    appId: string,
    extractType: ExtractType,
    sessionId: string,
    turnIndex: number,
    autoTeach: boolean
    teachMode: TeachMode
    textVariations: TextVariation[],
    extractButtonName: string,
    onTextVariationsExtracted: (extractResponse: ExtractResponse, textVariations: TextVariation[]) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(EntityExtractor);
