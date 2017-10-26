import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { fetchApplicationsAsync, fetchBotInfoAsync, fetchAllActionsAsync, fetchAllEntitiesAsync, fetchAllTrainDialogsAsync, fetchAllLogDialogsAsync, fetchAllChatSessionsAsync } from '../../actions/fetchActions';
import { createBLISApplicationAsync } from '../../actions/createActions'
import { setCurrentBLISApp } from '../../actions/displayActions';
import { deleteBLISApplicationAsync } from '../../actions/deleteActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { DisplayMode } from '../../types/const'
import { BlisAppBase } from 'blis-models'
import './AppPage.css'
import Index from './App/Index'
import AppsList from './AppsList'

interface ComponentState {
    displayedUserId: string
    selectedApp: BlisAppBase | null
}

class AppsIndex extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        displayedUserId: null,
        selectedApp: null
    }

    componentDidUpdate() {
        if (this.props.user.id && this.props.user.id !== this.state.displayedUserId) {
            this.setState({
                displayedUserId: this.props.user.id
            })
            this.props.fetchApplicationsAsync(this.props.user.key, this.props.user.id);
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

    onCreateApp = (appToCreate: BlisAppBase) => {
        this.props.createBLISApplicationAsync(this.props.user.key, this.props.user.id, appToCreate)
    }

    render() {
        return (
            this.props.display.displayMode === DisplayMode.AppAdmin && this.state.selectedApp !== null
                ? <Index
                    app={this.state.selectedApp}
                />
                : <AppsList
                    onCreateApp={this.onCreateApp}
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
        createBLISApplicationAsync,
        deleteBLISApplicationAsync,
        fetchAllChatSessionsAsync,
        fetchApplicationsAsync,
        fetchBotInfoAsync
    }, dispatch);
}

const mapStateToProps = (state: State) => {
    return {
        display: state.display,
        user: state.user
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(AppsIndex);