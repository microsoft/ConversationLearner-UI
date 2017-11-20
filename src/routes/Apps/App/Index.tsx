import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Nav, Link } from 'office-ui-fabric-react';
import { BlisAppBase, ActionBase, ActionTypes, ModelUtils } from 'blis-models'
import { State } from '../../../types';
import { ErrorType, DisplayMode } from '../../../types/const';
import { setDisplayMode, setErrorDisplay } from '../../../actions/displayActions';
import Entities from './Entities'
import TrainDialogs from './TrainDialogs'
import Actions from './Actions'
import Dashboard from './Dashboard'
import Settings from './Settings'
import LogDialogs from './LogDialogs'
import TrainingStatus from '../../../components/TrainingStatusContainer'

// TODO: i18n support would be much easier after proper routing is implemented
// this would eliminate the use of page title strings as navigation keys and instead use the url

interface ComponentState {
    display: string;
    selectedKey: string;
    validationErrors: string[];
}

class Index extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        display: 'Dash',
        selectedKey: 'Dash',
        validationErrors: []
    }

    componentWillReceiveProps(newProps: Props) {
        let validationErrors: string[] = [];

        if (newProps.actions !== this.props.actions) {
            validationErrors.push.apply(validationErrors, this.actionValidationErrors(newProps.actions));
        }

        if (validationErrors.length > 0) {
            this.props.setErrorDisplay(ErrorType.Warning, 'Validation Error:', validationErrors.join('<br/)'), null);
        }
    }

    actionValidationErrors(actions: ActionBase[]): string[] {
        let errors: string[] = [];

        // Check for missing APIs
        let apiActions = actions.filter(a => a.metadata && a.metadata.actionType === ActionTypes.API_LOCAL);
        let missingApis = apiActions.filter(a => !this.props.botInfo.callbacks.find(cb => cb === ModelUtils.GetPrimaryPayload(a)));
        errors = missingApis.map(a => `Action references API "${ModelUtils.GetPrimaryPayload(a)}" not contained by running Bot`);
        return errors;
    }
    // If one is found and subst
    renderChosenNavLink() {
        switch (this.state.display) {
            case 'Settings':
                return <Settings app={this.props.app} />
            case 'Dash':
                return <Dashboard app={this.props.app} />
            case 'Entities':
                return <Entities app={this.props.app} />
            case 'Actions':
                return <Actions app={this.props.app} />
            case 'TrainDialogs':
                return <TrainDialogs app={this.props.app} />
            case 'LogDialogs':
                return <LogDialogs app={this.props.app} />
            default:
                return <Dashboard app={this.props.app} />
        }
    }
    setArenaDisplay(page: string) {
        this.setState({
            display: page,
            selectedKey: page
        })
    }

    render() {
        return (
            <div className="blis-app-page">
                <div>
                    <div className="blis-app-title ms-font-xxl">{this.props.app.appName}</div>
                    <TrainingStatus
                        app={this.props.app}
                    />
                    <div className="blis-nav ms-font-m-plus">
                        <div className="blis-nav_section">
                            <a onClick={() => this.setArenaDisplay('Settings')}><span className="ms-Icon ms-Icon--Settings" aria-hidden="true"/>&nbsp;&nbsp;</a>
                            <span className="ms-font-m-plus"><a onClick={() => this.setArenaDisplay('Settings')}>Settings</a></span>
                        </div>
                        <div className="blis-nav_section">
                            <Nav
                                className="ms-font-m-plus blis-nav-links"
                                initialSelectedKey="Dash"
                                selectedKey={this.state.selectedKey}
                                groups={[{
                                    links: [
                                        { name: 'Dashboard', key: 'Dash', url: null, onClick: () => this.setArenaDisplay('Dash') },
                                        { name: 'Entities', key: 'Entities', url: null, onClick: () => this.setArenaDisplay('Entities') },
                                        { name: 'Actions', key: 'Actions', url: null, onClick: () => this.setArenaDisplay('Actions') },
                                        { name: 'Train Dialogs', key: 'TrainDialogs', url: null, onClick: () => this.setArenaDisplay('TrainDialogs') },
                                        { name: 'Log Dialogs', key: 'LogDialogs', url: null, onClick: () => this.setArenaDisplay('LogDialogs') }
                                    ]
                                }]}
                            />
                        </div>
                        <div className="blis-nav_section backToApps">
                            <Link onClick={() => this.props.setDisplayMode(DisplayMode.AppList)}><span className="ms-Icon ms-Icon--Back" aria-hidden="true"></span>&nbsp;&nbsp;App List</Link>
                        </div>
                    </div>
                </div>
                {this.renderChosenNavLink()}
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode,
        setErrorDisplay,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs,
        display: state.display,
        botInfo: state.bot.botInfo
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(Index);
