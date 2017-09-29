import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { UIScoreInput, ExtractResponse, TrainExtractorStep, TextVariation } from 'blis-models'
import { runScorerAsync } from '../actions/teachActions';
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
        this.scoreButtonOnClick = this.scoreButtonOnClick.bind(this);
        this.entityEditorHandleClose = this.entityEditorHandleClose.bind(this);
    }
    componentDidMount() {
        findDOMNode<HTMLButtonElement>(this.refs.scoreActions).focus();
    }
    componentDidUpdate() {
        // If not in interactive mode run scorer automatically
        if (this.props.teachSession.autoTeach && this.props.teachSession.mode == TeachMode.Extractor) {
            this.scoreButtonOnClick();
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
        let primaryResponse = this.props.teachSession.extractResponses[0] as ExtractResponse;
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
        for (let extractResponse of this.props.teachSession.extractResponses) {
            if (extractResponse != this.props.teachSession.extractResponses[0]) {
                if (!this.isValid(extractResponse)) {
                    return false;
                }
            }
        }
        return true;
    }
    scoreButtonOnClick() {
        if (!this.allValid()) {
            this.handleOpenPopUpModal();
            return;
        }

        let textVariations: TextVariation[] = [];
        for (let extractResponse of this.props.teachSession.extractResponses) {
            textVariations.push(new TextVariation({ text: extractResponse.text, labelEntities: extractResponse.predictedEntities }));
        }
        let trainExtractorStep = new TrainExtractorStep({
            textVariations: textVariations
        });

        let uiScoreInput = new UIScoreInput({ trainExtractorStep: trainExtractorStep, extractResponse: this.props.teachSession.extractResponses[0] });

        let appId = this.props.apps.current.appId;
        let teachId = this.props.teachSession.current.teachId;
        this.props.runScorerAsync(this.props.user.key, appId, teachId, uiScoreInput);
    }
    render() {
        if (!this.props.teachSession.extractResponses[0]) {
            return null;
        }

        // Don't show edit components when in auto TACH or on score step
        let canEdit = (!this.props.teachSession.autoTeach && this.props.teachSession.mode == TeachMode.Extractor);

        let variationCreator = null;
        let addEntity = null;
        let editComponents = null;
        let extractDisplay = null;
        if (canEdit) {
            variationCreator = <ExtractorTextVariationCreator />
            addEntity =
                <CommandButton
                    data-automation-id='randomID8'
                    className="blis-button--gold teachCreateButton"
                    disabled={false}
                    onClick={this.entityButtonOnClick}
                    ariaDescription='Cancel'
                    text='Entity'
                    iconProps={{ iconName: 'CirclePlus' }}
                />
            editComponents =
                <div>
                    <CommandButton
                        data-automation-id='randomID16'
                        disabled={false}
                        onClick={this.scoreButtonOnClick}
                        className='ms-font-su blis-button--gold'
                        ariaDescription='Score Actions'
                        text='Score Actions'
                        ref="scoreActions"
                    />

                    <EntityCreatorEditor
                        open={this.state.entityModalOpen}
                        entity={null}
                        handleClose={this.entityEditorHandleClose} />
                </div>

            let key = 0;
            extractDisplay = [];
            for (let extractResponse of this.props.teachSession.extractResponses) {
                let isValid = true;
                if (extractResponse != this.props.teachSession.extractResponses[0]) {
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
            const extractResponse = this.props.teachSession.extractResponses[0]
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
        removeExtractResponse,
        runScorerAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        teachSession: state.teachSessions,
        apps: state.apps,
        entities: state.entities
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(TeachSessionExtractor as React.ComponentClass<any>);