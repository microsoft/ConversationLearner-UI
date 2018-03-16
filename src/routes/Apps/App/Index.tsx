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
import { BlisAppBase, ActionBase, ActionTypes } from 'blis-models'
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

        // LARS temp
        let allPackages =
             (packageId === app.devPackageId) ?
                app.packageVersions.map(pv => pv.packageId).join(",") + `,${packageId}`
                :
                packageId;
        
        this.props.setCurrentBLISApp(this.props.user.id, app)
        this.props.fetchAllLogDialogsAsync(this.props.user.id, app.appId, allPackages) // Note: a separate call as eventurlaly we want to page
        this.props.fetchAppSource(this.props.user.id, app.appId, packageId)
        this.props.fetchBotInfoAsync()
        // this.props.fetchAllChatSessionsAsync(this.props.user.id, app.appId)
        // this.props.fetchAllTeachSessions(this.props.user.id, app.appId)
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
            this.setState({validationErrors: validationErrors});
        }
    }

    actionValidationErrors(actions: ActionBase[]): string[] {
        let errors: string[] = [];

        // Check for missing APIs
        let apiActions = actions.filter(a => a.actionType === ActionTypes.API_LOCAL);
        let actionsMissingApis = apiActions.filter(a => !this.props.botInfo.callbacks || !this.props.botInfo.callbacks.find(cb => cb.name === ActionBase.GetPayload(a)));
        // Make unique list of missing APIs
        let missingAPIs = actionsMissingApis.map(a => `${ActionBase.GetPayload(a)}`)
                                            .filter((item, i, ar) => ar.indexOf(item) === i);
        errors = missingAPIs.map(api => `Action references API "${api}" not contained by running Bot`);

        // Check for bad templates
        let badTemplates = this.props.botInfo.templates.filter(t => t.validationError != null);
        errors = errors.concat(badTemplates.map(a => a.validationError));

        // Check for missing templates
        let cardActions = actions.filter(a => a.actionType === ActionTypes.CARD);
        let actionsMissingTemplates = cardActions.filter(a => !this.props.botInfo.templates || !this.props.botInfo.templates.find(cb => cb.name === ActionBase.GetPayload(a)));
        // Make unique list of missing templates
        let missingTemplates = actionsMissingTemplates.map(a => `${ActionBase.GetPayload(a)}`)
                                                    .filter((item, i, ar) => ar.indexOf(item) === i);
        errors = errors.concat(missingTemplates.map(template => `Action references Template "${template}" not contained by running Bot`));
 
        return errors;
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
                        <div className="blis-nav_section">
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/settings`, state: { app } }}>
                                <Icon iconName="Settings" />&nbsp;&nbsp;Settings
                            </NavLink>
                        </div>
                        <div className={`blis-nav_section blis-nav_section--links ${FontClassNames.medium}`}>
                            <NavLink className="blis-nav-link" exact to={{ pathname: `${match.url}`, state: { app } }}>Dashboard</NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/entities`, state: { app } }}>Entities</NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/actions`, state: { app } }}>Actions</NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/trainDialogs`, state: { app } }}>Train Dialogs</NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/logDialogs`, state: { app } }}>Log Dialogs</NavLink>
                        </div>
                        <div className="blis-nav_section">
                            <NavLink className="blis-nav-link" exact={true} to="/home"><Icon iconName="Back" />&nbsp;&nbsp;App List</NavLink>
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
