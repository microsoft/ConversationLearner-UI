import * as React from 'react';
import { editTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState, AppState } from '../types';
import Webchat from './Webchat'
import WebchatMetadata from './WebchatMetadata'

class WebchatController extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            displayMetadata: true
        }
        this.renderWithMeta = this.renderWithMeta.bind(this)
    }
    toggleMeta() {
        this.setState({
            displayMetadata: !this.state.displayMetadata
        })
    }
    renderWithMeta() {
        return (
            <div className='container'>
                <div className="webchatShrink">
                    <Webchat toggleMeta={this.toggleMeta.bind(this)} buttonText="HIDE METADATA"/>
                </div>
                <div className="webchatMetaShrink">
                    <WebchatMetadata/>
                </div>
            </div>
        )
    }
    render() {
        return (
            <div className='container'>
                { this.state.displayMetadata == true ? this.renderWithMeta() : <Webchat toggleMeta={this.toggleMeta.bind(this)} buttonText="SHOW METADATA" /> }
            </div>
        )

    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        editTrainDialog: editTrainDialog,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(WebchatController as React.ComponentClass<any>);