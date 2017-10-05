import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { fetchApplicationsAsync, fetchBotInfoAsync, fetchAllActionsAsync, fetchAllEntitiesAsync, fetchAllTrainDialogsAsync, fetchAllLogDialogsAsync, fetchAllChatSessionsAsync } from '../../actions/fetchActions';
import { setCurrentBLISApp } from '../../actions/displayActions';
import { deleteBLISApplicationAsync } from '../../actions/deleteActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { DisplayMode } from '../../types/const'
import { BlisAppBase } from 'blis-models'
import '../../components/HomeApp.css'
import AppAdmin from './App/AppAdmin'
import '../../components/HomeIndex.css'
import BLISAppsList from './BLISAppsList'

interface ComponentState {
    displayedUserId: string
    selectedApp: BlisAppBase | null
}

class BLISAppsHomepage extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        displayedUserId: null,
        selectedApp: null
    }

    componentDidUpdate() {
        if (this.state.displayedUserId != this.props.userId) {
            this.setState({
                displayedUserId: this.props.userId
            })
            this.props.fetchApplicationsAsync(this.props.user.key, this.props.userId);
            this.props.fetchBotInfoAsync();
        }
    }

    onSelectedAppChanged(selectedApp: BlisAppBase) {
        this.setState({
            selectedApp
        })
        this.props.setCurrentBLISApp(this.props.user.key, selectedApp);
        this.props.fetchAllActionsAsync(this.props.user.key, selectedApp.appId);
        this.props.fetchAllEntitiesAsync(this.props.user.key, selectedApp.appId);
        this.props.fetchAllTrainDialogsAsync(this.props.user.key, selectedApp.appId);
        this.props.fetchAllLogDialogsAsync(this.props.user.key, selectedApp.appId);
        this.props.fetchAllChatSessionsAsync(this.props.user.key, selectedApp.appId);
        // this.props.fetchAllTeachSessions(this.props.user.key, appSelected.appId);
    }

    onClickDeleteApp(appToDelete: BlisAppBase) {
        this.props.deleteBLISApplicationAsync(this.props.user.key, appToDelete)
    }

    render() {
        return (
            this.props.display.displayMode === DisplayMode.AppAdmin && this.state.selectedApp !== null
                ? <AppAdmin
                    app={this.state.selectedApp}
                />
                : <BLISAppsList
                    onSelectedAppChanged={app => this.onSelectedAppChanged(app)}
                    onClickDeleteApp={app => this.onClickDeleteApp(app)}
                />
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchAllActionsAsync,
        fetchAllEntitiesAsync,
        fetchAllTrainDialogsAsync,
        fetchAllLogDialogsAsync,
        setCurrentBLISApp,
        deleteBLISApplicationAsync,
        fetchAllChatSessionsAsync,
        fetchApplicationsAsync,
        fetchBotInfoAsync
    }, dispatch);
}

const mapStateToProps = (state: State) => {
    return {
        display: state.display,
        user: state.user,
        userId: state.user.id,
        blisApps: state.apps
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(BLISAppsHomepage);