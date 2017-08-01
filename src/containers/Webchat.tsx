import * as React from 'react';
import { toggleTrainDialog, addMessageToTeachConversationStack, addMessageToChatConversationStack } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState } from '../types';
import { generateGUID } from '../util';
import * as BotChat from 'botframework-webchat'
import { Chat } from 'botframework-webchat'
import { UserInput } from 'blis-models'
import { runExtractor } from '../actions/teachActions';

class Webchat extends React.Component<any, any> {
    render() {
        const dl = new BotChat.DirectLine({
            secret: 'secret', //params['s'],
            token: 'token', //params['t'],
            domain: "http://localhost:3000/directline", //params['domain'],
            webSocket: false // defaults to true,
        });

        const _dl = {
            ...dl,
            postActivity: (activity: any) => {
                if (activity.type = "message")
                {
                    if (this.props.sessionType === 'teach') {
                        this.props.addMessageToTeachConversationStack(activity)

                        let userInput = new UserInput({ text: activity.text});
                        let appId: string = this.props.apps.current.appId;
                        let teachId: string = this.props.teachSessions.current.teachId;
                        this.props.runExtractor(this.props.user.key, appId, teachId, userInput);

                    } else {
                        this.props.addMessageToChatConversationStack(activity)
                    }
                }
                return dl.postActivity(activity)
            },
        } as BotChat.DirectLine;

        const props: BotChat.ChatProps = {
            botConnection: _dl,
            formatOptions: {
                showHeader: false
            },
            user: { name: this.props.user.name, id: this.props.user.id },
            bot: { name: "BlisTrainer", id: "BlisTrainer" },
            resize: 'detect',
        }
        return (
            <div id="botchat" className="container webchatwindow wc-app">
                <Chat {...props} />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        toggleTrainDialog: toggleTrainDialog,
        addMessageToTeachConversationStack: addMessageToTeachConversationStack,
        runExtractor: runExtractor
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        teachSessions: state.teachSessions,
        chatSessions: state.chatSessions,
        user: state.user,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Webchat as React.ComponentClass<any>);