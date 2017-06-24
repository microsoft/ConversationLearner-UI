import * as React from 'react';
import { createBLISApplication } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { State } from '../types'
class AppSettings extends React.Component<any, any> {
    render() {
        return (
            <div>
                <TrainingGroundArenaHeader title="Settings" description="Control your application versions, who has access to it and whether it is public or private...."/>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createBLISApplication: createBLISApplication,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(AppSettings);