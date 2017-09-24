import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import AppAdmin from './AppAdmin';
import { fetchApplicationsAsync, fetchBotInfoAsync } from '../actions/fetchActions'
import BLISAppsList from './BLISAppsList';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { DisplayMode } from '../types/const'

class BLISAppsHomepage extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            displayedUserId: null
        }
    }
    componentDidUpdate() {
        if (this.state.displayedUserId != this.props.userId) {
            this.setState({
                displayedUserId: this.props.userId
            })
            this.props.fetchApplications(this.props.userKey, this.props.userId);
            this.props.fetchBotInfo();
        }
    }
    render() {
        var display = null;
        switch (this.props.display.displayMode) {
            case DisplayMode.AppList:
                display = <BLISAppsList />
                break;
            case DisplayMode.AppAdmin:
                display = <AppAdmin />
                break;
        }
        return (
            <div className="fluidCont">
                {display}
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchApplications: fetchApplicationsAsync,
        fetchBotInfo: fetchBotInfoAsync
    }, dispatch);
}

const mapStateToProps = (state: State) => {
    return {
        display: state.display,
        userKey: state.user.key,
        userId: state.user.id,
        blisApps: state.apps
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(BLISAppsHomepage);