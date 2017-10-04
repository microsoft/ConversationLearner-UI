import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { PredictedEntity, LabeledEntity, ExtractResponse, TextVariation } from 'blis-models'
import { CommandButton } from 'office-ui-fabric-react';
import ExtractorTextVariationCreator from './ExtractorTextVariationCreator';
import ExtractorResponseEditor from './ExtractorResponseEditor';
import EntityCreatorEditor from './EntityCreatorEditor';
import { TeachMode } from '../types/const'
import PopUpMessage from '../components/PopUpMessage';
import { updateExtractResponse, removeExtractResponse } from '../actions/teachActions'

interface ComponentState {
    entityModalOpen: boolean,
    popUpOpen: boolean
};

class TeachSessionExtractor extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p)
        this.state = {
            entityModalOpen: false,
            popUpOpen: false
        }
        this.entityButtonOnClick = this.entityButtonOnClick.bind(this);
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
    entityButtonOnClick() {
        this.setState({
            entityModalOpen: true
        })
    }
    handleClosePopUpModal() {
        this.setState({
            popUpOpen: false
        })
    }
    handleOpenPopUpModal() {
        this.setState({
            popUpOpen: true
        })
    }
    /** Returns true is predicted entities match */
    isValid(extractResponse: ExtractResponse): boolean {
        let primaryResponse = this.props.extractResponses[0] as ExtractResponse;
        let missing = primaryResponse.predictedEntities.filter(item =>
            !extractResponse.predictedEntities.find(er => item.entityName == er.entityName));

        if (missing.length > 0) {
            return false;
        }
        missing = extractResponse.predictedEntities.filter(item =>
            !primaryResponse.predictedEntities.find(er => item.entityName == er.entityName));
        if (missing.length > 0) {
            return false;
        }
        return true;
    }
    allValid(): boolean {
        for (let extractResponse of this.props.extractResponses) {
            if (extractResponse != this.props.extractResponses[0]) {
                if (!this.isValid(extractResponse)) {
                    return false;
                }
            }
        }
        return true;
    }
    toLabeledEntities(predictedEntities : PredictedEntity[]) : LabeledEntity[] {
        let labeledEntities : LabeledEntity[] = [];
        for (let predictedEntity of predictedEntities)
        {
            let labelEntity = new LabeledEntity({
                startCharIndex: predictedEntity.startCharIndex,
                endCharIndex: predictedEntity.endCharIndex,
                entityId: predictedEntity.entityId,
                entityName: predictedEntity.entityName,
                entityText: predictedEntity.entityText
            });
            labeledEntities.push(labelEntity);
        }
        return labeledEntities;
    }
    onClickDoneExtracting() {
        if (!this.allValid()) {
            this.handleOpenPopUpModal();
            return;
        }

        let textVariations: TextVariation[] = [];
        for (let extractResponse of this.props.extractResponses) {
            let labeledEntities = this.toLabeledEntities(extractResponse.predictedEntities);
            textVariations.push(new TextVariation({ text: extractResponse.text, labelEntities: labeledEntities }));
        }     
        this.props.onTextVariationsExtracted(this.props.extractResponses[0], textVariations);
    }
    render() {
        if (!this.props.extractResponses[0]) {
            return null;
        }

        // Don't show edit components when in auto TACH or on score step
        let canEdit = (!this.props.autoTeach && this.props.teachMode == TeachMode.Extractor);

        let variationCreator = null;
        let addEntity = null;
        let editComponents = null;
        let extractDisplay = null;
        if (canEdit) {
            variationCreator = <ExtractorTextVariationCreator />
            addEntity =
                <CommandButton
                    className="blis-button--gold teachCreateButton"
                    onClick={this.entityButtonOnClick}
                    ariaDescription='Cancel'
                    text='Entity'
                    iconProps={{ iconName: 'CirclePlus' }}
                />
            editComponents =
                <div>
                    <CommandButton
                        onClick={this.onClickDoneExtracting}
                        className='ms-font-su blis-button--gold'
                        ariaDescription='Score Actions'
                        text='Score Actions'
                        ref="doneExtractingButton"
                    />

                    <EntityCreatorEditor
                        open={this.state.entityModalOpen}
                        entity={null}
                        handleClose={this.entityEditorHandleClose} />
                </div>

            let key = 0;
            extractDisplay = [];
            for (let extractResponse of this.props.extractResponses) {
                let isValid = true;
                if (extractResponse != this.props.extractResponses[0]) {
                    isValid = this.isValid(extractResponse);
                }

                extractDisplay.push(<ExtractorResponseEditor
                    canEdit={canEdit}
                    key={key++}
                    isPrimary={key == 1}
                    isValid={isValid}
                    extractResponse={extractResponse}
                    updateExtractResponse={extractResponse => this.props.updateExtractResponse(extractResponse)}
                    removeExtractResponse={extractResponse => this.props.removeExtractResponse(extractResponse)}
                />);
            }
        }
        else {
            // Only display primary response if not in edit mode
            const extractResponse = this.props.extractResponses[0]
            extractDisplay = <ExtractorResponseEditor
                canEdit={canEdit}
                key={0}
                isPrimary={true}
                isValid={true}
                extractResponse={extractResponse}
                updateExtractResponse={extractResponse => this.props.updateExtractResponse(extractResponse)}
                removeExtractResponse={extractResponse => this.props.removeExtractResponse(extractResponse)}
            />
        }

        return (
            <div>
                <div>
                    <div className='teachTitleBox'>
                        <div className='ms-font-l teachTitle'>Entity Detection</div>
                        {addEntity}
                    </div>
                    {extractDisplay}
                    {variationCreator}
                </div>
                {editComponents}
                <PopUpMessage open={this.state.popUpOpen} onConfirm={() => this.handleClosePopUpModal()} title="Text variations must all have same tagged entities." />
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
        apps: state.apps,
        entities: state.entities
    }
}

export interface ReceivedProps {
    teachSessionId: string,
    autoTeach: boolean
    teachMode: TeachMode
    extractResponses: ExtractResponse[],
    onTextVariationsExtracted: (extractResponse: ExtractResponse, textVariations: TextVariation[]) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TeachSessionExtractor);
