import * as React from 'react';
import { setWebchatDisplay, toggleTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState, AppState } from '../types';
import { CommandButton, IIconProps, IIconStyles, CommandBar } from 'office-ui-fabric-react';

interface Props {
	toggleSessionType: Function
}

class TeachSessionHeader extends React.Component<any, any> {
    constructor(p: Props) {
        super(p);
    }
    render() {
        return (
            <div className="webchatHeader">
				<CommandBar items={[]} />
            </div>
        )

    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setWebchatDisplay: setWebchatDisplay,
        toggleTrainDialog: toggleTrainDialog
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionHeader as React.ComponentClass<any>);