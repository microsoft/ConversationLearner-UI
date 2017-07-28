import * as React from 'react';
import { createBLISApplication } from '../actions/createActions';
import { CommandButton } from 'office-ui-fabric-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { DisplayMode, TeachMode } from '../types/const';
import { setDisplayMode } from '../actions/updateActions'
import { deleteTeachSession } from '../actions/deleteActions'

class TeachSessionAdmin extends React.Component<any, any> {
    handleAbandon() {
        // TODO: Add confirmation modal
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSession(this.props.userKey, this.props.teachSession.current, currentAppId);
    }

    render() {
        let userWindow = null;
        switch (this.props.teachSession.mode) {
            case TeachMode.Extractor:
                userWindow = null;//<TeachSessionExtractor />  TODO
                break;
            case TeachMode.Scorer:
                userWindow = null;//<TeachSessionScorer />  TODO
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
                {userWindow}
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode,
        deleteTeachSession: deleteTeachSession
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        teachSession: state.teachSessions,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionAdmin);