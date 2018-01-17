import * as React from 'react'
import {
    Route,
    Switch
} from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript';
import { createBLISApplicationAsync } from '../../actions/createActions'
import { deleteBLISApplicationAsync } from '../../actions/deleteActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { BlisAppBase } from 'blis-models'
import actions from '../../actions'
import AppIndex from './App/Index'
import AppsList from './AppsList'

interface ComponentState {
    selectedApp: BlisAppBase | null
}

class AppsIndex extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        selectedApp: null
    }

    componentWillMount() {
        const { history } = this.props
        if (history.location.pathname !== '/home') {
            history.replace('/home', null)
        }
    }

    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (typeof (this.props.user.id) === 'string' && this.props.user.id !== prevProps.user.id) {
            this.props.fetchApplicationsAsync(this.props.user.id, this.props.user.id);
            this.props.fetchBotInfoAsync();
        }

        const { history, location } = this.props
        const appFromLocationState: BlisAppBase | null = location.state && location.state.app
        if (appFromLocationState) {
            const app = this.props.apps.find(a => a.appId === appFromLocationState.appId)
            if (!app) {
                console.warn(`Attempted to find selected app in list of apps: ${this.state.selectedApp.appId} but it could not be found.`)
                return
            }

            if (appFromLocationState !== app) {
                history.replace(location.pathname, { app })
            }
        }
    }

    onClickDeleteApp = (appToDelete: BlisAppBase) => {
        this.props.deleteBLISApplicationAsync(this.props.user.id, appToDelete)
    }

    onCreateApp = (appToCreate: BlisAppBase) => {
        this.props.createBLISApplicationAsync(this.props.user.id, this.props.user.id, appToCreate)
    }

    render() {
        const { match } = this.props
        return (
            <Switch>
                <Route path={`${match.url}/:appid`} component={AppIndex} />
                <Route
                    exact={true}
                    path={match.url}
                    render={() =>
                        <AppsList
                            apps={this.props.apps}
                            onCreateApp={this.onCreateApp}
                            onClickDeleteApp={this.onClickDeleteApp}
                        />
                    }
                />
            </Switch>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchApplicationsAsync: actions.fetch.fetchApplicationsAsync,
        fetchBotInfoAsync: actions.fetch.fetchBotInfoAsync,
        createBLISApplicationAsync,
        deleteBLISApplicationAsync,
    }, dispatch)
}

const mapStateToProps = (state: State) => {
    return {
        apps: state.apps.all,
        display: state.display,
        user: state.user
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, RouteComponentProps<any>>(mapStateToProps, mapDispatchToProps)(AppsIndex)