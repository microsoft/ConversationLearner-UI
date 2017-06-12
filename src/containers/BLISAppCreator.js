import React, { Component } from 'react';
import { createBLISApplication } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CommandButton } from 'office-ui-fabric-react';
class BLISAppCreator extends Component {
    constructor(p) {
        super(p);
        this.state = {
            open: false
        }
    }
    handleOpen(){
        this.setState({
            open: true
        })
    }
    render() {
        return (
            <div>
                <CommandButton
                    data-automation-id='randomID'
                    disabled={false}
                    onClick={this.handleOpen.bind(this)}
                    className='goldButton'
                    ariaDescription='Create a New Application'
                    text='New App'
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        createBLISApplication: createBLISApplication,
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppCreator);