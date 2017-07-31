import * as React from 'react';
import { createBLISApplication } from '../actions/createActions';
import { CommandButton } from 'office-ui-fabric-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { UserInput } from 'blis-models'
import { DisplayMode, TeachMode } from '../types/const';
import { setDisplayMode } from '../actions/updateActions'
import { deleteTeachSession } from '../actions/deleteActions';
import { runExtractor } from '../actions/teachActions';
import TeachSessionScorer from './TeachSessionScorer';
import TeachSessionExtractor from './TeachSessionExtractor';
import TeachSessionMemory from './TeachSessionMemory';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';

class TeachSessionAdmin extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            userInput: '',
        };
    }
    handleAbandon() {
        // TODO: Add confirmation modal
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSession(this.props.userKey, this.props.teachSession.current, currentAppId);
    }
    nameChanged(text: string) {
        this.setState({
            userInput: text
        })
    }
    userInputReceived() {
        let userInput = new UserInput({text: this.state.userInput});
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.runExtractor(this.props.user.key, appId, teachId, userInput);
    }
    render() {
        let userWindow = null;
        switch (this.props.teachSession.mode) {
            case TeachMode.Extractor:
                userWindow = <TeachSessionExtractor />
                break;
            case TeachMode.Scorer:
                userWindow = <TeachSessionScorer />
                break;
        }
        return (
            <div className="container">
                <span className="ms-font-su goldText">
                    <CommandButton
                        data-automation-id='randomID16'
                        disabled={false}
                        onClick={this.handleAbandon.bind(this)}
                        className='goldButton buttonWithTextField'
                        ariaDescription='Abandon Teach'
                        text='Abandon Teach'
                    />
                </span>
                <div>
                    <TextFieldPlaceholder
                            onChanged={this.nameChanged.bind(this)}
                            label="Fake User Input"
                            placeholder="Name..."
                            value={this.state.userInput} />
                    <CommandButton
                            data-automation-id='randomID13'
                            className="grayButton"
                            disabled={false}
                            onClick={() => this.userInputReceived()}
                            ariaDescription='Send Text'
                            text='Send Text'
                        />
                </div>
                <TeachSessionMemory />
                {userWindow}
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode,
        deleteTeachSession: deleteTeachSession,
        runExtractor: runExtractor
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        teachSession: state.teachSessions,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionAdmin);