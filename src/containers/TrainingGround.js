import React, { Component } from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchAllTrainDialogs } from '../actions/fetch';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EntitiesHomepage from './EntitiesHomepage';
import TrainDialogsHomepage from './TrainDialogsHomepage';
import ActionResponsesHomepage from './ActionResponsesHomepage';
import BLISAppsHomepage from './BLISAppsHomepage';
import AppDashboard from './AppDashboard';
import AppSettings from './AppSettings';
import { Nav } from 'office-ui-fabric-react';
import { Link } from 'react-router-dom';
class TrainingGround extends Component {
    constructor(p){
        super(p);
        this.state = {
            display: 'Dash',
            selectedKey: 'Dash'
        }
        this.setArenaDisplay = this.setArenaDisplay.bind(this);
    }
    renderChosenNavLink(){
        switch(this.state.display){
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
                    <EntitiesHomepage />
                )
            case "Actions":
                return (
                    <ActionResponsesHomepage />
                )   
            case "TrainDialogs":
                return (
                    <TrainDialogsHomepage />
                )
        }
    }
    setArenaDisplay(page){
        this.setState({
            display: page,
            selectedKey: page
        })
    }
    render() {
        return (
            <div className="content">
                <div className='trainingGroundNavigationArea'>
                <span className="ms-font-xxl">{this.props.blisApps.current.appName}</span>
                    <Nav
                        className="ms-font-m-plus trainingGroundNav"
                        initialSelectedKey="Dash"
                        selectedKey={this.state.selectedKey}
                        groups={[{
                            links: [
                                { name: 'Settings', key: 'Settings', onClick:() => this.setArenaDisplay('Settings') },
                                { name: 'Dashboard', key: 'Dash',  onClick:() => this.setArenaDisplay('Dash') },
                                { name: 'Entities', key: 'Entities',  onClick:() => this.setArenaDisplay('Entities') },
                                { name: 'Actions', key: 'Actions',  onClick:() => this.setArenaDisplay('Actions')},
                                { name: 'Train Dialogs', key: 'TrainDialogs',  onClick:() => this.setArenaDisplay('TrainDialogs') }
                            ]
                        }]}
                    />
                    <Link className="backToApps" onClick={() => this.props.setDisplay("Home")} to="/"><span className="ms-Icon ms-Icon--Back backToApps backToAppsIcon" aria-hidden="true"></span>&nbsp;&nbsp;</Link>
                    <span className="ms-font-m-plus backToApps"><Link className="backToApps" onClick={() => this.props.setDisplay("Home")} to="/">Back to App List</Link></span>
                </div>
                
                <div className='trainingGroundArena'>
                    {this.renderChosenNavLink()}
                </div>

            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        fetchApplications: fetchApplications,
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps,
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TrainingGround);
