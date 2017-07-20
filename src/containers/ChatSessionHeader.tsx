import * as React from 'react';
import { setWebchatDisplay } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState, AppState } from '../types';
import { CommandButton, IIconProps, IIconStyles } from 'office-ui-fabric-react';

class TeachSessionHeader extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
    }
    render() {
        return (
            <div>
				Teach session header
            </div>
        )

    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setWebchatDisplay: setWebchatDisplay,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionHeader as React.ComponentClass<any>);