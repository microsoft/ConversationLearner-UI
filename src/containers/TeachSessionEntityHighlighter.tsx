import { toggleTrainDialog } from '../actions/updateActions';
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types';

class TeachSessionEntityHighlighter extends React.Component<any, any> {
    render() {
        return (
            <div >
                 TeachSessionEntityHighlighter
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        toggleTrainDialog: toggleTrainDialog,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionEntityHighlighter as React.ComponentClass<any>);