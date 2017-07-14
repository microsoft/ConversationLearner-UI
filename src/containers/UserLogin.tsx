import * as React from 'react';
import axios from 'axios';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { setUser } from '../actions/updateActions'
import { fetchAllActions, fetchAllEntities, fetchAllTrainDialogs } from '../actions/fetchActions';
import { BlisAppBase, BlisAppMetaData } from 'blis-models'
import { developmentSubKeyLUIS } from '../secrets'
import { State } from '../types'
type CultureObject = {
    CultureCode: string;
    CultureName: string;
}
class UserLogin extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            open: this.props.user.id == null,
            userName: '',
            userPassword: ''
        }
    }
    handleOpen() {
        this.setState({
            open: true
        })
    }
    handleClose() {
        this.setState({
            open: false,
            userName: '',
            userPassword: ''
        })
    }
    nameChanged(text: string) {
        this.setState({
            userName: text
        })
    }
    passwordChanged(text: string) {
        this.setState({
            userPassword: text
        })
    }
    generateUserId(name : string, password : string) {
        if (!name || !password) {
            return;
        }
        return name + "_" + password
    }
    createUser() {
        let userId = this.generateUserId(this.state.userName, this.state.userPassword);
        this.props.setUser(this.state.userName, this.state.userPassword, userId);
        this.handleClose();
    }
    render() {
        return (
            <div>
                <Modal
                    isOpen={this.state.open}
                    onDismiss={this.handleClose.bind(this)}
                    isBlocking={true}
                    containerClassName='createModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Log In</span>
                    </div>
                    <div>
                        <TextField onChanged={this.nameChanged.bind(this)} label="Name" placeholder="User Name..." value={this.state.userName} />
                        <TextField onChanged={this.passwordChanged.bind(this)} label="Password" placeholder="Password..." value={this.state.userPassword} />
                    </div>
                    <div className='modalFooter'>
                        <CommandButton
                            data-automation-id='randomID2'
                            disabled={false}
                            onClick={this.createUser.bind(this)}  // TODO
                            className='goldButton'
                            ariaDescription='Log In'
                            text='Log In'
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setUser: setUser,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(UserLogin);