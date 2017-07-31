import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Nav, INavLink, INavLinkGroup, Link } from 'office-ui-fabric-react';
import { State } from '../types';
import { DisplayMode } from '../types/const';
import Webchat from './Webchat'
import TeachSessionAdmin from './TeachSessionAdmin'
import { Teach } from 'blis-models'
import { createTrainDialog, createTeachSession } from '../actions/createActions'
import { setCurrentTrainDialog, setCurrentTeachSession } from '../actions/updateActions'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';


class TeachWindow extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            teachSession : new Teach({})
        }
        let currentAppId: string = this.props.apps.current.appId;
        this.props.createTeachSession(this.props.userKey, this.state.teachSession, currentAppId)
        // this.props.deleteTeachSession(this.props.userKey, testTeachSession, currentAppId)
        // this.props.setCurrentTeachSession(this.props.teachSessions.all.find((t: Teach) => t.teachId == ""))
        //need to create a new teach session
    }
    handleAbandon() {
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSession(this.props.userKey, this.state.teachSession, currentAppId)
    }
    render() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col webchat">
                        <Webchat sessionType={"teach"}/>
                    </div>
                    <div className="ms-Grid-col sessionAdmin">
                        <TeachSessionAdmin/>
                    </div>
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createTeachSession: createTeachSession
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        teachSession: state.teachSessions.current,
        userKey: state.user.key,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachWindow);
