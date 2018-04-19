import * as React from 'react'
import {
    Route,
    Switch
} from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript';
import { createApplicationAsync, copyApplicationsThunkAsync } from '../../actions/createActions'
import { deleteApplicationAsync } from '../../actions/deleteActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { AppBase } from 'conversationlearner-models'
import actions from '../../actions'
import AppIndex from './App/Index'
import AppsList from './AppsList'
import { CL_SAMPLE_ID } from '../../types/const'

interface ComponentState {
    selectedApp: AppBase | null
}

class AppsIndex extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        selectedApp: null
    }

    componentWillMount() {
        const { history } = this.props
        if (history.location.pathname !== '/home') {
            // TODO: There seems to be bug where the router state is not cleared sychronously here
            // Thus when refreshing on non home page such as entities list for an app, this will force redirect to home
            // howver, the other component at the entities page still runs component will mount with old router state.
            // Perhaps we need to use componentDidMount to inspect router state in children?
            history.replace('/home', null)
            return
        }
    }

    componentDidMount() {
        if (this.props.user.id !== null) {
            this.props.fetchApplicationsAsync(this.props.user.id)
            this.props.fetchBotInfoAsync()
        }
    }

    componentDidUpdate(prevProps: Props, _prevState: ComponentState) {
        // TODO: See if this code can be removed. It seems like componentWillMount is called every time the user navigates to /home route
        if (typeof (this.props.user.id) === 'string' && this.props.user.id !== prevProps.user.id) {
            this.props.fetchApplicationsAsync(this.props.user.id)
            this.props.fetchBotInfoAsync();
        }

        const { history, location } = this.props
        const appFromLocationState: AppBase | null = location.state && location.state.app
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

    onClickDeleteApp = (appToDelete: AppBase) => {
        this.props.deleteApplicationAsync(appToDelete)
    }

    onCreateApp = (appToCreate: AppBase) => {
        this.props.createApplicationAsync(this.props.user.id, appToCreate)
    }

    onImportDemoApps = () => {
        let srcUserId = CL_SAMPLE_ID;  
        let destUserId = this.props.user.id;

        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        this.props.copyApplicationsThunkAsync(srcUserId, destUserId)
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
                            onImportDemoApps={this.onImportDemoApps}
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
        createApplicationAsync,
        deleteApplicationAsync,
        copyApplicationsThunkAsync
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