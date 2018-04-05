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
import { BlisAppBase, ActionBase, ActionTypes, ApiAction, CardAction, BotInfo } from 'blis-models'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../../react-intl-messages'
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
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
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

        // Note: In future change fetch log dialogs to default to all package if no package set
        let allPackages = (packageId === app.devPackageId)
                ? app.packageVersions.map(pv => pv.packageId).concat(packageId).join(',')
                : packageId
        
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

        if (newProps.actions !== this.props.actions || newProps.botInfo !== this.props.botInfo) {
            let validationErrors = this.actionValidationErrors(newProps.botInfo, newProps.actions);
            this.setState({ validationErrors: validationErrors });
        }
    }

    actionValidationErrors(botInfo: BotInfo, actions: ActionBase[]): string[] {
        // Check for missing APIs
        const actionsMissingCallbacks = actions
            .filter(a => a.actionType === ActionTypes.API_LOCAL)
            .map(a => new ApiAction(a))
            .filter(a => !botInfo.callbacks || !botInfo.callbacks.some(cb => cb.name === a.name))

        // Make unique list of missing APIs
        const uniqueCallbackNames = actionsMissingCallbacks
            .map(a => a.name)
            .filter((item, i, ar) => ar.indexOf(item) === i)

        const apiActionErrors = uniqueCallbackNames.map(api => `Action references API "${api}" not contained by running Bot.`)

        // Check for bad templates
        const badTemplateErrors = botInfo.templates
            .filter(t => t.validationError !== null)
            .map(t => t.validationError)

        // Check for missing templates
        const actionsMissingTemplates = actions
            .filter(a => a.actionType === ActionTypes.CARD)
            .map(a => new CardAction(a))
            .filter(a => !botInfo.templates || !botInfo.templates.some(cb => cb.name === a.templateName))

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

    hasInvalidTrainDialogs(): boolean {
        return this.props.trainDialogs.filter(td => td.invalid === true).length > 0;
    }
    render() {
        const { match, location, intl } = this.props
        const app: BlisAppBase = location.state.app
        const editPackageId = this.state.packageId
        const tag = (editPackageId === app.devPackageId) ? 
            'Master' :
            app.packageVersions.find(pv => pv.packageId === editPackageId).packageVersion;
        const invalidTrainDialogs = this.hasInvalidTrainDialogs();
        const invalidBot = this.state.validationErrors && this.state.validationErrors.length > 0;
       
        return (
            <div className="blis-app-page">
                <div>
                    <div className="blis-app-title">
                        <div className={FontClassNames.xxLarge}>{app.appName}</div>
                    </div>
                    <div className={`blis-app-tag-status ${FontClassNames.mediumPlus}`}>
                        Tag: {tag}
                        {editPackageId === app.livePackageId && 
                            <span className="blis-font--warning">LIVE</span>
                        }
                    </div>
                    <TrainingStatus
                        app={app}
                    />
                    <div className={`blis-nav ${FontClassNames.mediumPlus}`}>
                        <div className="blis-nav_section">
                            <NavLink className="blis-nav-link" exact to={{ pathname: `${match.url}`, state: { app } }}>
                                <Icon iconName="Home" />
                                    <span className={invalidBot ? 'blis-font--highlight' : ''}>Home
                                        {invalidBot &&
                                            <TooltipHost 
                                                content={intl.formatMessage({
                                                    id: FM.TOOLTIP_BOTINFO_INVALID,
                                                    defaultMessage: 'Bot not compatible'
                                                })} 
                                                calloutProps={{ gapSpace: 0 }}
                                            >
                                                <Icon className="blis-icon" iconName="IncidentTriangle" />
                                            </TooltipHost>
                                        }</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/entities`, state: { app } }}>
                                <Icon iconName="List" /><span>Entities</span><span className="count">{this.props.entities.filter(e => typeof e.positiveId === 'undefined').length}</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/actions`, state: { app } }}>
                                <Icon iconName="List" /><span>Actions</span><span className="count">{this.props.actions.length}</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/trainDialogs`, state: { app } }}>
                                <Icon iconName="List" />
                                    <span className={invalidTrainDialogs ? 'blis-font--highlight' : ''}>Train Dialogs
                                        {invalidTrainDialogs && 
                                            <TooltipHost 
                                                content={intl.formatMessage({
                                                    id: FM.TOOLTIP_TRAINDIALOG_INVALID,
                                                    defaultMessage: 'Contains Invalid Train Dialogs'
                                                })} 
                                                calloutProps={{ gapSpace: 0 }}
                                            >
                                                <Icon className="blis-icon" iconName="IncidentTriangle" />
                                            </TooltipHost>
                                        }</span>
                                    <span className="count">{this.props.trainDialogs.length}</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/logDialogs`, state: { app } }}>
                                <Icon iconName="List" /><span>Log Dialogs</span>
                            </NavLink>
                            <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/settings`, state: { app } }}>
                                <Icon iconName="Settings" /><span>Settings</span>
                            </NavLink>
                        </div>
                        <div className="blis-nav_section">
                            <NavLink className="blis-nav-link" exact={true} to="/home">
                                <Icon iconName="Back" /><span>App List</span>
                            </NavLink>
                        </div>
                    </div>
                </div>
                <Switch>
                    <Route 
                        path={`${match.url}/settings`} 
                        render={props => <Settings {...props} app={app} editingPackageId={editPackageId} />} />
                    <Route 
                        path={`${match.url}/entities`} 
                        render={props => <Entities {...props} app={app} editingPackageId={editPackageId} />} />
                    <Route 
                        path={`${match.url}/actions`} 
                        render={props => <Actions {...props} app={app} editingPackageId={editPackageId}/>} />
                    <Route 
                        path={`${match.url}/trainDialogs`} 
                        render={props => <TrainDialogs {...props} app={app} editingPackageId={editPackageId} invalidBot={invalidBot} filteredAction={location.state.actionFilter} filteredEntity={location.state.entityFilter} />} />
                    <Route 
                        path={`${match.url}/logDialogs`} 
                        render={props => <LogDialogs {...props} app={app} editingPackageId={editPackageId} invalidBot={invalidBot} />} />
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
type Props = typeof stateProps & typeof dispatchProps & RouteComponentProps<any> & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, RouteComponentProps<any> & ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(Index));
