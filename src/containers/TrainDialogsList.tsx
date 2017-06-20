import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
class TrainDialogsList extends React.Component<any, any> {
    render() {
        return (
            <div>
                <TrainingGroundArenaHeader title="Train Dialogs" description="Use this tool to test the current and published versions of your application, to check if you are progressing on the right track ..."/>
            </div>
        );
    }
}
const mapStateToProps = (state: any) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, null)(TrainDialogsList);