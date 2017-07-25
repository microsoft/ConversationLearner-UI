import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Nav, INavLink, INavLinkGroup, Link } from 'office-ui-fabric-react';
import { State } from '../types';
import { DisplayMode } from '../types/const';
import Webchat from './Webchat'
import TeachSessionWindow from './TeachSessionWindow'
import { Teach } from 'blis-models'
import { createTrainDialog, createTeachSession } from '../actions/createActions'
import { deleteTeachSession } from '../actions/deleteActions'
import { setCurrentTrainDialog, setCurrentTeachSession } from '../actions/updateActions'


class TeachWindow extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
        }
        let testTeachSession = new Teach({
            
        });
        let currentAppId: string = this.props.apps.current.appId;
        this.props.createTeachSession(this.props.userKey, testTeachSession, currentAppId)
        // this.props.deleteTeachSession(this.props.userKey, testTeachSession, currentAppId)
        // this.props.setCurrentTeachSession(this.props.teachSessions.all.find((t: Teach) => t.teachId == ""))
        //need to create a new teach session
    }
    render() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg2">
                        <Webchat />
                    </div>
                    <div className="ms-Grid-col ms-sm6 ms-md8 ms-lg10">
                        <TeachSessionWindow/>
                    </div>
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setCurrentTrainDialog: setCurrentTrainDialog,
        setCurrentTeachSession: setCurrentTeachSession,
        createTrainDialog: createTrainDialog,
        createTeachSession: createTeachSession,
        deleteTeachSession: deleteTeachSession
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        userKey: state.user.key,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachWindow);
