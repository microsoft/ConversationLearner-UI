import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EntitiesList from './EntitiesList';
import TrainDialogsList from './TrainDialogsList';
import ActionResponsesList from './ActionResponsesList';
import AppDashboard from './AppDashboard';
import AppSettings from './AppSettings';
import { Nav, Link } from 'office-ui-fabric-react';
import { setDisplayMode } from '../actions/displayActions';
import { State } from '../types';
import LogDialogsList from './LogDialogsList';
import { DisplayMode } from '../types/const';
import { BlisAppBase } from 'blis-models'

interface ComponentState {
    display: string
    selectedKey: string
}

class AppAdmin extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        display: 'Dash',
        selectedKey: 'Dash'
    }
    
    renderChosenNavLink() {
        switch (this.state.display) {
            case "Settings":
                return (
                    <AppSettings app={this.props.app} />
                )
            case "Dash":
                return (
                    <AppDashboard app={this.props.app} />
                )
            case "Entities":
                return (
                    <EntitiesList app={this.props.app} />
                )
            case "Actions":
                return (
                    <ActionResponsesList app={this.props.app} />
                )
            case "TrainDialogs":
                return (
                    <TrainDialogsList app={this.props.app} />
                )
            case "LogDialogs":
                return (
                    <LogDialogsList app={this.props.app} />
                )
            default:
                return (
                    <AppDashboard app={this.props.app} />
                )
        }
    }
    setArenaDisplay(page: string) {
        this.setState({
            display: page,
            selectedKey: page
        })
    }
    renderWithoutEmulator() {
        return (
            <div className="container">
                <div className="content">
                    <div className='trainingGroundNavigationArea'>
                        <span className="ms-font-xxl">{this.props.app.appName}</span>
                        <div className="tgSettingsDiv">
                            <a onClick={() => this.setArenaDisplay('Settings')}><span className="ms-Icon ms-Icon--Settings" aria-hidden="true"></span>&nbsp;&nbsp;</a>
                            <span className="ms-font-m-plus"><a onClick={() => this.setArenaDisplay('Settings')}>Settings</a></span>
                        </div>
                        <div className="tgNavDiv">
                            <Nav
                                className="ms-font-m-plus trainingGroundNav"
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
                        <div className="tgbackToAppsDiv">
                            <Link className="backToApps" onClick={() => this.props.setDisplayMode(DisplayMode.AppList)}><span className="ms-Icon ms-Icon--Back backToApps backToAppsIcon" aria-hidden="true"></span>&nbsp;&nbsp;App List</Link>
                        </div>
                    </div>

                    <div className='trainingGroundArena'>
                        {this.renderChosenNavLink()}
                    </div>
                </div>
            </div>
        )

    }
    renderWithEmulator() {
        return (
            <div className="container">
                <div className="emulatorContent">
                    <div className='trainingGroundNavigationArea'>
                        <span className="ms-font-xxl">{this.props.app.appName}</span>
                        <div className="tgSettingsDiv">
                            <a onClick={() => this.setArenaDisplay('Settings')}><span className="ms-Icon ms-Icon--Settings" aria-hidden="true"></span>&nbsp;&nbsp;</a>
                            <span className="ms-font-m-plus"><a onClick={() => this.setArenaDisplay('Settings')}>Settings</a></span>
                        </div>
                        <div className="tgNavDiv">
                            <Nav
                                className="ms-font-m-plus trainingGroundNav"
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
                        <div className="tgbackToAppsDiv">
                            <Link className="backToApps" onClick={() => this.props.setDisplayMode(DisplayMode.AppList)}><span className="ms-Icon ms-Icon--Back backToApps backToAppsIcon" aria-hidden="true"></span>&nbsp;&nbsp;App List</Link>
                        </div>
                    </div>
                </div>
            </div>
        )

    }
    render() {
        return (
            <div className="container">
                {this.props.display.displayWebchat == true ?
                    this.renderWithEmulator()
                    : this.renderWithoutEmulator()
                }
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs,
        display: state.display
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(AppAdmin);
