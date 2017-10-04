import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, TextField } from 'office-ui-fabric-react';
import { setUser, logout, setLoginDisplay } from '../actions/displayActions'
import { State } from '../types';

// type CultureObject = {
//     CultureCode: string;
//     CultureName: string;
// }

interface ComponentState {
    userName: string
    userPassword: string
    loadedUser: boolean
}

class UserLogin extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p);
        this.state = {
            userName: '',
            userPassword: '',
            loadedUser: false
        }

        this.checkForEnter = this.checkForEnter.bind(this)
        this.nameChanged = this.nameChanged.bind(this)
        this.passwordChanged = this.passwordChanged.bind(this)
        this.createUser = this.createUser.bind(this)
        this.logout = this.logout.bind(this)
        this.handleClose = this.handleClose.bind(this)
    }
    handleClose() {
        this.props.setLoginDisplay(false);
        this.setState({
            userName: '',
            userPassword: ''
        })
    }
    checkForEnter(key: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
        let code = key.keyCode;
        if (code == 13) {
            let userId = this.generateUserId(this.state.userName, this.state.userPassword);
            this.props.setUser(this.state.userName, this.state.userPassword, userId);
            this.setState({
                loadedUser: true
            })
            this.handleClose();
        }
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
    generateUserId(name: string, password: string): string | undefined {
        return (!name || !password) ? undefined : name + "_" + password
    }
    createUser() {
        let userId = this.generateUserId(this.state.userName, this.state.userPassword);
        this.props.setUser(this.state.userName, this.state.userPassword, userId);
        this.setState({
            loadedUser: true
        })
        this.handleClose();
    }
    logout() {
        this.props.logout();
    }
    render() {
        let isBlocking, title, input, button = null;
        if (this.props.user.id == null) {
            isBlocking = true;
            title = "Log In";
            input =
                <div>
                    <TextField
                        onKeyDown={this.checkForEnter}
                        onChanged={this.nameChanged}
                        label="Name"
                        placeholder="User Name..."
                        value={this.state.userName}
                    />
                    <TextField
                        onKeyDown={this.checkForEnter}
                        onChanged={this.passwordChanged}
                        type="Password"
                        label="Password"
                        placeholder="Password..."
                        value={this.state.userPassword}
                    />
                </div>;
            button =
                <CommandButton
                    onClick={this.createUser}
                    className='blis-button--gold'
                    ariaDescription='Log In'
                    text='Log In'
                />
        }
        else {
            isBlocking = false;
            title = "Log Out";
            button =
                <div>
                    <CommandButton
                        onClick={this.logout}
                        className='blis-button--gold'
                        ariaDescription='Log Out'
                        text='Log Out'
                    />
                    <CommandButton
                        className="blis-button--gray"
                        onClick={this.handleClose}
                        ariaDescription='Cancel'
                        text='Cancel'
                    />
                </div>
        }
        return (
            <Modal
                isOpen={(this.props.displayLogin || !this.props.user.key) && !this.props.displayError}
                onDismiss={this.handleClose}
                isBlocking={isBlocking}
                containerClassName='blis-modal blis-modal--small blis-modal--border'
            >
                <div className='blis-modal_header'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>{title}</span>
                </div>
                {input}
                <div className='blis-modal_footer'>
                    {button}
                </div>
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setUser,
        logout,
        setLoginDisplay
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        displayLogin: state.display.displayLogin,
        displayError: state.error.error
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(UserLogin);