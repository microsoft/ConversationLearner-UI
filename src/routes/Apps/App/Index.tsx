import * as React from 'react';
import {
    NavLink,
    Route,
    Switch
} from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { BlisAppBase, ActionBase, ActionTypes, ApiAction, CardAction } from 'blis-models'
import { State } from '../../../types';
import { setErrorDisplay } from '../../../actions/displayActions';
import { Icon } from 'office-ui-fabric-react/lib/Icon'
import Entities from './Entities'
import TrainDialogs from './TrainDialogs'
import Actions from './Actions'
import Dashboard from './Dashboard'
import Settings from './Settings'
import LogDialogs from './LogDialogs'
import { FontClassNames } from 'office-ui-fabric-react'
import TrainingStatus from '../../../components/TrainingStatusContainer'
import actions from '../../../actions'
import './Index.css'

// TODO: i18n support would be much easier after proper routing is implemented
// this would eliminate the use of page title strings as navigation keys and instead use the url

interface ComponentState {
    validationErrors: string[];
    packageId: string;
}

class Index extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        validationErrors: [],
        packageId: null
    }

    loadApp(app: BlisAppBase, packageId: string): void {
        
        this.setState({ packageId: packageId})

        // Note: In future chagen fetch log dialogs to default to all package if no package set
        let allPackages =
             (packageId === app.devPackageId) ?
                app.packageVersions.map(pv => pv.packageId).join(",") + `,${packageId}`
                :
                packageId;
        
        this.props.setCurrentBLISApp(this.props.user.id, app)
        this.props.fetchAllLogDialogsAsync(this.props.user.id, app.appId, allPackages) // Note: a separate call as eventually we want to page
        this.props.fetchAppSource(app.appId, packageId)
        this.props.fetchBotInfoAsync()
        // this.props.fetchAllChatSessionsAsync(app.appId)
        // this.props.fetchAllTeachSessions(app.appId)
    }

    componentWillMount() {
        // If we're loading Index due to page refresh where app is not in router state
        // force back to /home route to mimic old behavior and allow user to login again
        const { location, history } = this.props
        const app: BlisAppBase | null = location.state && location.state.app
        if (!app) {
            console.log(`${this.constructor.name} componentWillMount. location.state.app is undefined: Redirect to /home`)
            history.push('/home')
            return
        }

        let editPackageId = this.props.activeApps[app.appId] || app.devPackageId;
        this.loadApp(app, editPackageId);
    }

    componentWillReceiveProps(newProps: Props) {
 
        const app: BlisAppBase | null = newProps.location.state && newProps.location.state.app
        let editPackageId = newProps.activeApps[app.appId] || app.devPackageId;
        if (this.state.packageId !== editPackageId) {
            this.loadApp(app, editPackageId);
        }

        if (newProps.actions !== this.props.actions) {
            let validationErrors = this.actionValidationErrors(newProps.actions);
            this.setState({ validationErrors: validationErrors });
        }
    }

    actionValidationErrors(actions: ActionBase[]): string[] {
        // Check for missing APIs
        const actionsMissingCallbacks = actions
            .filter(a => a.actionType === ActionTypes.API_LOCAL)
            .map(a => new ApiAction(a))
            .filter(a => !this.props.botInfo.callbacks || !this.props.botInfo.callbacks.some(cb => cb.name === a.name))

        // Make unique list of missing APIs
        const uniqueCallbackNames = actionsMissingCallbacks
            .map(a => a.name)
            .filter((item, i, ar) => ar.indexOf(item) === i)

        const apiActionErrors = uniqueCallbackNames.map(api => `Action references API "${api}" not contained by running Bot.`)

        // Check for bad templates
        const badTemplateErrors = this.props.botInfo.templates
            .filter(t => t.validationError !== null)
            .map(t => t.validationError)

        // Check for missing templates
        const actionsMissingTemplates = actions
            .filter(a => a.actionType === ActionTypes.CARD)
            .map(a => new CardAction(a))
            .filter(a => !this.props.botInfo.templates || !this.props.botInfo.templates.some(cb => cb.name === a.templateName))

        // Make unique list of missing templates
        const uniqueTemplateNames = actionsMissingTemplates
            .map(a => a.templateName)
            .filter((item, i, ar) => ar.indexOf(item) === i)

        const missingTemplateErrors = uniqueTemplateNames.map(template => `Action references Template "${template}" not contained by running Bot`)

        return [
            ...apiActionErrors,
            ...badTemplateErrors,
            ...missingTemplateErrors
        ]
    }

    render() {
        const { match, location } = this.props
        const app: BlisAppBase = location.state.app
        const editPackageId = this.state.packageId
        const tag = (editPackageId === app.devPackageId) ? 
            'Master' :
            app.packageVersions.find(pv => pv.packageId === editPackageId).packageVersion;
       
        return (
            <div className="blis-app-page">
                <div>
                    <div className="blis-app-title">
                        <div className={FontClassNames.xxLarge}>{app.appName}</div>
                        <div className={FontClassNames.smallPlus}>
                            Tag: {tag}
                            { editPackageId === app.livePackageId && 
                                <span className="blis-font--warning">LIVE</span>
                            }
                        </div>
                    </div>
                    <TrainingStatus
                        app={app}
                    />
                    <div className={`blis-nav ${FontClassNames.mediumPlus}`}>
                        <div className={`blis-nav_section`}>
                            <NavLink className="blis-nav-link" exact to={{ pathname: `${match.url}`, state: { app } }}>
                                <Icon iconName="BIDashboard" /><span>Dashboard</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/entities`, state: { app } }}>
                                <Icon iconName="List" /><span>Entities</span><span className="count">10</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/actions`, state: { app } }}>
                                <Icon iconName="List" /><span>Actions</span><span className="count">9</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/trainDialogs`, state: { app } }}>
                                <Icon iconName="List" /><span>Train Dialogs</span><span className="count">9</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/logDialogs`, state: { app } }}>
                                <Icon iconName="List" /><span>Log Dialogs</span><span className="count">9</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/settings`, state: { app } }}>
                                <Icon iconName="Settings" /><span>Settings</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" exact={true} to="/home">
                                <Icon iconName="Back" /><span>App List</span>
                            </NavLink>
                        </div>
                    </div>
                </div>
                <Switch>
                    <Route path={`${match.url}/settings`} render={props => <Settings {...props} app={app} editingPackageId={editPackageId} />} />
                    <Route path={`${match.url}/entities`} render={props => <Entities {...props} app={app} editingPackageId={editPackageId} />} />
                    <Route path={`${match.url}/actions`} render={props => <Actions {...props} app={app} editingPackageId={editPackageId}/>} />
                    <Route path={`${match.url}/trainDialogs`} render={props => <TrainDialogs {...props} app={app} editingPackageId={editPackageId} filteredAction={location.state.actionFilter} filteredEntity={location.state.entityFilter} />} />
                    <Route path={`${match.url}/logDialogs`} render={props => <LogDialogs {...props} app={app} editingPackageId={editPackageId} />} />
                    <Route
                        exact={true}
                        path={match.url}
                        render={props => <Dashboard {...props} app={app} validationErrors={this.state.validationErrors} />}
                    />
                </Switch>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setErrorDisplay,
        setCurrentBLISApp: actions.display.setCurrentBLISApp,
        fetchAppSource: actions.fetch.fetchAppSourceAsync,
        fetchAllLogDialogsAsync: actions.fetch.fetchAllLogDialogsAsync,
        fetchBotInfoAsync: actions.fetch.fetchBotInfoAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs,
        display: state.display,
        botInfo: state.bot.botInfo,
        user: state.user,
        activeApps: state.apps.activeApps
    }
}

export interface ReceivedProps {
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & RouteComponentProps<any> & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, RouteComponentProps<any> & ReceivedProps>(mapStateToProps, mapDispatchToProps)(Index);
