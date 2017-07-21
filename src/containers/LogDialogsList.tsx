import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setWebchatDisplay } from '../actions/updateActions'
import { State } from '../types'

class LogDialogsList extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
    }
    render() {
        return (
            <div>
                Log Dialog
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setWebchatDisplay: setWebchatDisplay,
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps,
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(LogDialogsList);