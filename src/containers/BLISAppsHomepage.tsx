import React, { Component } from 'react';
import TrainingGround from './TrainingGround';
import BLISAppsList from './BLISAppsList';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class BLISAppsHomepage extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
    }
    render() {
        return (
            <div>
                {this.props.blisApps.pageToDisplay == 'Home' ?
                    <BLISAppsList  />
                    : <TrainingGround />
                }
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, null)(BLISAppsHomepage);