import * as React from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchAllTrainDialogs } from '../actions/fetch';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EntitiesList from './EntitiesList';
import TrainDialogsList from './TrainDialogsList';
import ActionResponsesList from './ActionResponsesList';
import BLISAppsHomepage from './BLISAppsHomepage';
import AppDashboard from './AppDashboard';
import AppSettings from './AppSettings';
import Emulator from '../components/Emulator';
import { Nav, INavLink, INavLinkGroup } from 'office-ui-fabric-react';
import { Link } from 'react-router-dom';
import { setWebchatDisplay } from '../actions/update'
import { State } from '../types'

class TrainingGround extends React.Component<any, any> {
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
        this.props.setWebchatDisplay(false)
    }
    renderWithoutEmulator() {
        return (
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
                                    { name: 'Dashboard', key: 'Dash', onClick: () => this.setArenaDisplay('Dash') },
                                    { name: 'Entities', key: 'Entities', onClick: () => this.setArenaDisplay('Entities') },
                                    { name: 'Actions', key: 'Actions', onClick: () => this.setArenaDisplay('Actions') },
                                    { name: 'Train Dialogs', key: 'TrainDialogs', onClick: () => this.setArenaDisplay('TrainDialogs') }
                                ]
                            }]}
                        />
                    </div>
                    <div className="tgbackToAppsDiv">
                        <Link className="backToApps" onClick={() => this.props.setDisplay("Home")} to="/myApps"><span className="ms-Icon ms-Icon--Back backToApps backToAppsIcon" aria-hidden="true"></span>&nbsp;&nbsp;</Link>
                        <span className="ms-font-m-plus backToApps"><Link className="backToApps" onClick={() => this.props.setDisplay("Home")} to="/myApps">Back to App List</Link></span>
                    </div>
                </div>

                <div className='trainingGroundArena'>
                    {this.renderChosenNavLink()}
                </div>
            </div>
        )

    }
    renderWithEmulator() {
        return (
            <div className="container">
                <div className="emulatorDisplay">
                    <Emulator />
                </div>
                <div className="trainingGroundDisplayWithEmulator">
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
                                        { name: 'Dashboard', key: 'Dash', onClick: () => this.setArenaDisplay('Dash') },
                                        { name: 'Entities', key: 'Entities', onClick: () => this.setArenaDisplay('Entities') },
                                        { name: 'Actions', key: 'Actions', onClick: () => this.setArenaDisplay('Actions') },
                                        { name: 'Train Dialogs', key: 'TrainDialogs', onClick: () => this.setArenaDisplay('TrainDialogs') }
                                    ]
                                }]}
                            />
                        </div>
                        <div className="tgbackToAppsDiv">
                            <Link className="backToApps" onClick={() => this.props.setDisplay("Home")} to="/myApps"><span className="ms-Icon ms-Icon--Back backToApps backToAppsIcon" aria-hidden="true"></span>&nbsp;&nbsp;</Link>
                            <span className="ms-font-m-plus backToApps"><Link className="backToApps" onClick={() => this.props.setDisplay("Home")} to="/myApps">Back to App List</Link></span>
                        </div>
                    </div>

                    <div className='trainingGroundArena'>
                        {this.renderChosenNavLink()}
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
        setWebchatDisplay: setWebchatDisplay
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
export default connect(mapStateToProps, mapDispatchToProps)(TrainingGround);
