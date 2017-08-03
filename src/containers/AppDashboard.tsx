import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { State } from '../types'

class AppDashboard extends React.Component<Props, any> {
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
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps;

export default connect(mapStateToProps, null)(AppDashboard);
