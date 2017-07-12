import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { State } from '../types'

class AppDashboard extends React.Component<any, any> {
    render() {
        return (
            <div>
                <TrainingGroundArenaHeader title="Overview" description="Facts & statistics about the app's data at any period of time..."/>
            </div>
        );
    }
}
const mapStateToProps = (state: State) => {
    return {
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, null)(AppDashboard);
