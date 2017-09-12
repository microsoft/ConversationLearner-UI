import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { toggleTrainDialog, addMessageToTeachConversationStack, addMessageToChatConversationStack } from '../actions/displayActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState } from '../types';
import { generateGUID } from '../util';
import * as BotChat from 'blis-webchat'
import { Chat } from 'blis-webchat'
import { UserInput } from 'blis-models'
import { runExtractorAsync } from '../actions/teachActions';
import { Activity } from 'botframework-directlinejs';

class Webchat extends React.Component<Props, any> {
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
                        this.props.addMessageToTeachConversationStack(activity.text)

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
            history: this.props.history
        }
        return (
            <div id="botchat" className="webchatwindow wc-app">
                <Chat {...props} />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        toggleTrainDialog: toggleTrainDialog,
        addMessageToTeachConversationStack: addMessageToTeachConversationStack,
        addMessageToChatConversationStack: addMessageToChatConversationStack,
        runExtractor: runExtractorAsync
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

interface ReceivedProps {
    sessionType: string,
    history: Activity[]
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect(mapStateToProps, mapDispatchToProps)(Webchat as React.ComponentClass<any>);