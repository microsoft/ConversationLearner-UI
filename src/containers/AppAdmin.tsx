import * as React from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchAllTrainDialogs } from '../actions/fetchActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EntitiesList from './EntitiesList';
import TrainDialogsList from './TrainDialogsList';
import ActionResponsesList from './ActionResponsesList';
import BLISAppsHomepage from './BLISAppsHomepage';
import AppDashboard from './AppDashboard';
import AppSettings from './AppSettings';
import { Nav, INavLink, INavLinkGroup, Link } from 'office-ui-fabric-react';
import { setWebchatDisplay, setDisplayMode } from '../actions/updateActions';
import { State } from '../types';
import LogDialogsList from './LogDialogsList';
import { DisplayMode } from '../types/const';

class AppAdmin extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            display: 'Dash',
            selectedKey: 'Dash',
        }
        this.setArenaDisplay = this.setArenaDisplay.bind(this);
    }
    renderChosenNavLink() {
        switch (this.state.display) {
            case "Settings":
                return (
                    <AppSettings />
                )
            case "Dash":
                return (
                    <AppDashboard />
                )
            case "Entities":
                return (
                    <EntitiesList />
                )
            case "Actions":
                return (
                    <ActionResponsesList />
                )
            case "TrainDialogs":
                return (
                    <TrainDialogsList />
                )
            case "LogDialogs":
                return (
                    <LogDialogsList />
                )
            default:
                return (
                    <AppDashboard />
                )
        }
    }
    setArenaDisplay(page: string) {
        this.setState({
            display: page,
            selectedKey: page
        })
        this.props.setWebchatDisplay(false, false)
    }
    renderWithoutEmulator() {
        return (
            <div className="container">
                <div className="content">
                    <div className='trainingGroundNavigationArea'>
                        <span className="ms-font-xxl">{this.props.blisApps.current.appName}</span>
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
                                        { name: 'Dashboard', key: 'Dash', url: null,  onClick: () => this.setArenaDisplay('Dash') },
                                        { name: 'Entities', key: 'Entities', url: null,  onClick: () => this.setArenaDisplay('Entities') },
                                        { name: 'Actions', key: 'Actions',  url: null, onClick: () => this.setArenaDisplay('Actions') },
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
                        <span className="ms-font-xxl">{this.props.blisApps.current.appName}</span>
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
                                        { name: 'Dashboard', key: 'Dash',  url: null, onClick: () => this.setArenaDisplay('Dash') },
                                        { name: 'Entities', key: 'Entities', url: null,  onClick: () => this.setArenaDisplay('Entities') },
                                        { name: 'Actions', key: 'Actions',  url: null, onClick: () => this.setArenaDisplay('Actions') },
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
        fetchApplications: fetchApplications,
        setWebchatDisplay: setWebchatDisplay,
        setDisplayMode: setDisplayMode
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps,
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs,
        display: state.display
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(AppAdmin);
