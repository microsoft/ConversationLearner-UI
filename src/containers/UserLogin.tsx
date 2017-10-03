import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton } from 'office-ui-fabric-react';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
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
    }
    handleClose() {
        this.props.setLoginDisplay(false);
        this.setState({
            userName: '',
            userPassword: ''
        })
    }
    checkForEnter(key: KeyboardEvent) {
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
                    <TextFieldPlaceholder onKeyDown={this.checkForEnter.bind(this)} onChanged={this.nameChanged.bind(this)} label="Name" placeholder="User Name..." value={this.state.userName} />
                    <TextFieldPlaceholder onKeyDown={this.checkForEnter.bind(this)} onChanged={this.passwordChanged.bind(this)} type="Password" label="Password" placeholder="Password..." value={this.state.userPassword} />
                </div>;
            button =
                <CommandButton
                    data-automation-id='randomID2'
                    disabled={false}
                    onClick={this.createUser.bind(this)}
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
                        data-automation-id='randomID2'
                        disabled={false}
                        onClick={this.logout.bind(this)}
                        className='blis-button--gold'
                        ariaDescription='Log Out'
                        text='Log Out'
                    />
                    <CommandButton
                        data-automation-id='randomID3'
                        className="blis-button--gray"
                        disabled={false}
                        onClick={this.handleClose.bind(this)}
                        ariaDescription='Cancel'
                        text='Cancel'
                    />
                </div>
        }
        return (
            <Modal
                isOpen={(this.props.displayLogin || !this.props.user.key) && !this.props.displayError}
                onDismiss={this.handleClose.bind(this)}
                isBlocking={isBlocking}
                containerClassName='createModal'
            >
                <div className='modalHeader'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>{title}</span>
                </div>
                {input}
                <div className='modalFooter'>
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