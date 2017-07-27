import * as React from 'react';
import { toggleTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState } from '../types';
import { generateGUID } from '../util';
import * as BotChat from 'botframework-webchat'

class Webchat extends React.Component<any, any> {
    render() {
        const props: BotChat.ChatProps = {
                directLine: {
                    secret: 'secret', //params['s'],
                    token: 'token', //params['t'],
                    domain: "http://localhost:3000/directline", //params['domain'],
                    webSocket: false // defaults to true 
                },
                formatOptions: {
                    showHeader: false
                },
                user: { name: this.props.user.name, id: this.props.user.id },
                bot: { name: "BlisTrainer", id: "BlisTrainer" },
                resize: 'detect',
            }
        return (
            <div className="container webchatwindow wc-app">
                <BotChat.Chat directLine={{ secret: 'secret' }} {...props}/>'
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        toggleTrainDialog: toggleTrainDialog
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        trainDialogs: state.trainDialogs,
        user: state.user
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Webchat as React.ComponentClass<any>);