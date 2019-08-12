/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { fetchTutorialsThunkAsync } from '../../actions/appActions'
import { AppBase, AppDefinition } from '@conversationlearner/models'
import { CL_IMPORT_TUTORIALS_USER_ID, State, AppCreatorType } from '../../types'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { autobind } from 'core-decorators'
import AppsListComponent from './AppsListComponent'

interface ComponentState {
    isAppCreateModalOpen: boolean
    appCreatorType: AppCreatorType
    isImportTutorialsOpen: boolean
    appToDelete: AppBase | null
    tutorials: AppBase[] | null
    selectionCount: number
}

class AppsList extends React.Component<Props, ComponentState> {
    private selection: OF.ISelection = new OF.Selection({
        getKey: (app) => (app as AppBase).appId,
        onSelectionChanged: this.onSelectionChanged
    })

    state: Readonly<ComponentState> = {
        isAppCreateModalOpen: false,
        appCreatorType: AppCreatorType.NEW,
        isImportTutorialsOpen: false,
        appToDelete: null,
        tutorials: null,
        selectionCount: 0,
    }


    @autobind
    onClickCreateNewApp() {
        this.setState({
            isAppCreateModalOpen: true,
            appCreatorType: AppCreatorType.NEW
        })
    }

    @autobind
    onClickImportApp() {
        this.setState({
            isAppCreateModalOpen: true,
            appCreatorType: AppCreatorType.IMPORT
        })
    }

    @autobind
    async onClickImportDemoApps() {
        const tutorials = this.state.tutorials !== null
            ? this.state.tutorials
            : await ((this.props.fetchTutorialsThunkAsync(CL_IMPORT_TUTORIALS_USER_ID) as any) as Promise<AppBase[]>)

        this.setState({
            tutorials: tutorials,
            isImportTutorialsOpen: true
        })
    }

    @autobind
    onClickApp(app: AppBase) {
        const { match, history } = this.props
        history.push(`${match.url}/${app.appId}`, { app })
    }

    @autobind
    onCloseImportNotification() {
        this.setState({
            isImportTutorialsOpen: false
        })
    }

    @autobind
    onSubmitAppCreateModal(app: AppBase, source: AppDefinition | null = null) {
        this.setState({
            isAppCreateModalOpen: false
        }, () => {
            if (this.state.appCreatorType == AppCreatorType.DISPATCHER) {
                const selectedModels = this.selection.getSelection() as AppBase[]
                this.props.onCreateDispatchModel(app, selectedModels)
            }
            else {
                this.props.onCreateApp(app, source)
            }
        })
    }

    @autobind
    onCancelAppCreateModal() {
        this.setState({
            isAppCreateModalOpen: false
        })
    }

    @autobind
    onClickCreateNewDispatcherModel() {
        this.setState({
            isAppCreateModalOpen: true,
            appCreatorType: AppCreatorType.DISPATCHER
        })
    }

    @autobind
    onSelectionChanged() {
        const selectionCount = this.selection.getSelectedCount()
        this.setState({
            selectionCount
        })
    }

    render() {
        return <AppsListComponent
            intl={this.props.intl}

            user={this.props.user}
            apps={this.props.apps}
            activeApps={this.props.activeApps}
            onClickApp={this.onClickApp}
            selection={this.selection}
            featuresString={this.props.settings.features}
            selectionCount={this.state.selectionCount}

            isAppCreateModalOpen={this.state.isAppCreateModalOpen}
            onSubmitAppCreateModal={this.onSubmitAppCreateModal}
            onCancelAppCreateModal={this.onCancelAppCreateModal}
            appCreatorType={this.state.appCreatorType}

            onClickCreateNewApp={this.onClickCreateNewApp}
            onClickImportApp={this.onClickImportApp}
            onClickImportDemoApps={this.onClickImportDemoApps}
            onClickCreateNewDispatcherModel={this.onClickCreateNewDispatcherModel}

            isImportTutorialsOpen={this.state.isImportTutorialsOpen}
            tutorials={this.state.tutorials!}
            onCloseImportNotification={this.onCloseImportNotification}
            onImportTutorial={this.props.onImportTutorial}
        />
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchTutorialsThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render AppsList but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        activeApps: state.apps.activeApps,
        settings: state.settings,
    }
}

export interface ReceivedProps {
    apps: AppBase[]
    onCreateApp: (app: AppBase, source: AppDefinition | null) => void
    onClickDeleteApp: (app: AppBase) => void
    onImportTutorial: (tutorial: AppBase) => void
    onCreateDispatchModel: (model: AppBase, models: AppBase[]) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(AppsList)))