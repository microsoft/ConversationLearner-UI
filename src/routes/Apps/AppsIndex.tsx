/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import {
    Route,
    Switch
} from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { AppBase, AppDefinition } from '@conversationlearner/models'
import actions from '../../actions'
import AppIndex from './App/Index'
import AppsList from './AppsList'
import { CL_IMPORT_ID } from '../../types/const'

interface ComponentState {
}

class AppsIndex extends React.Component<Props, ComponentState> {
    updateAppsAndBot() {
        if (this.props.user.id !== null && this.props.user.id.length > 0) {
            this.props.fetchApplicationsAsync(this.props.user.id)
        }
    }
    componentDidMount() {
        this.updateAppsAndBot();
    }

    componentDidUpdate(prevProps: Props, _prevState: ComponentState) {
        // TODO: See if this code can be removed. It seems like componentWillMount is called every time the user navigates to /home route
        if (typeof (this.props.user.id) === 'string' && this.props.user.id !== prevProps.user.id) {
            this.updateAppsAndBot();
        }

        const { history, location } = this.props
        const appFromLocationState: AppBase | null = location.state && location.state.app
        if (appFromLocationState) {
            const app = this.props.apps.find(a => a.appId === appFromLocationState.appId)
            if (!app) {
                console.warn(`Attempted to find selected model in list of models: ${appFromLocationState.appId} but it could not be found. This should not be possible. Contact Support.`)
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

    onCreateApp = async (appToCreate: AppBase, source: AppDefinition | null = null) => {
        const app: AppBase = await this.props.createApplicationThunkAsync(this.props.user.id, appToCreate, source) as any
        const { match, history } = this.props
        history.push(`${match.url}/${app.appId}`, { app })
    }

    onImportTutorial = (tutorial: AppBase) => {
        let srcUserId = CL_IMPORT_ID;  
        let destUserId = this.props.user.id;

        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        this.props.copyApplicationThunkAsync(srcUserId, destUserId, tutorial.appId)
    }

    render() {
        const { match } = this.props
        return (
            <Switch>
                <Route path={`${match.url}/:appId`} component={AppIndex} />
                <Route
                    exact={true}
                    path={match.url}
                    render={() =>
                        <AppsList
                            apps={this.props.apps}
                            onCreateApp={this.onCreateApp}
                            onClickDeleteApp={this.onClickDeleteApp}
                            onImportTutorial={(tutorial) => this.onImportTutorial(tutorial)}
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
        fetchBotInfoThunkAsync: actions.fetch.fetchBotInfoThunkAsync,
        createApplicationThunkAsync: actions.create.createApplicationThunkAsync,
        deleteApplicationAsync: actions.delete.deleteApplicationAsync,
        copyApplicationThunkAsync: actions.create.copyApplicationThunkAsync
    }, dispatch)
}

const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render AppsIndex but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        apps: state.apps.all,
        display: state.display,
        user: state.user.user, 
        browserId: state.bot.browserId
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, RouteComponentProps<any>>(mapStateToProps, mapDispatchToProps)(AppsIndex)