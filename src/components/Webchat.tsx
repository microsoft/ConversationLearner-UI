/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types';
import * as BotChat from '@conversationlearner/webchat'
import { AppBase, CL_USER_NAME_ID } from '@conversationlearner/models'
import { BehaviorSubject, Observable } from 'rxjs';
import { Activity } from 'botframework-directlinejs';
import actions from '../actions'

class Webchat extends React.Component<Props, {}> {
    private behaviorSubject: BehaviorSubject<any> = null;
    private chatProps: BotChat.ChatProps = null;
    private dl: BotChat.DirectLine = null;

    static defaultProps: ReceivedProps = {
        app: null,
        history: null,
        onSelectActivity: () => { },
        onPostActivity: () => { },
        hideInput: false,
        focusInput: false
    }

    constructor(p: any) {
        super(p);
        this.behaviorSubject = null;
        this.selectedActivity$ = this.selectedActivity$.bind(this)
    }

    componentWillUnmount() {
        this.dl.end();
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.history !== nextProps.history) {
            this.chatProps = null;
        }
    }

    selectedActivity$(): BehaviorSubject<any> {
        if (!this.behaviorSubject) {
            this.behaviorSubject = new BehaviorSubject<any>({});
            this.behaviorSubject.subscribe((value) => {
                if (value.activity) {
                    this.props.onSelectActivity(value.activity as Activity)
                }
            })
        }
        return this.behaviorSubject;
    }

    // Get conversation Id for pro-active message during a 
    GetConversationId(status: number) {
        if (status === 2) {  // wait for connection is 'OnLine' to send data to bot
            let conversationId = (this.dl as any).conversationId;
            this.props.setConversationId(this.props.user.name, this.props.user.id, conversationId);
        }
    }
    GetChatProps(): BotChat.ChatProps {
        if (!this.chatProps) {
            this.dl = new BotChat.DirectLine({
                secret: 'secret', 
                token: 'token', 
                domain: 'http://localhost:3000/directline', 
                webSocket: false // defaults to true,
            });

            let botConnection = null;
            if (this.props.history) {
                botConnection = {
                    ...this.dl,
                    activity$: Observable.from(this.props.history).concat(this.dl.activity$),
                    postActivity: (activity: any) => {
                        if (this.props.onPostActivity) { 
                            this.props.onPostActivity(activity)
                        }
                        return this.dl.postActivity(activity)
                    }
                };
            }
            else {
                botConnection = {
                    ...this.dl,
                    postActivity: (activity: any) => {
                        if (this.props.onPostActivity) { 
                            this.props.onPostActivity(activity)
                        }
                        return this.dl.postActivity(activity)
                    }
                };
            }

            this.dl.connectionStatus$.subscribe((status) => this.GetConversationId(status));

            this.chatProps = {
                botConnection: botConnection,
                selectedActivity: this.props.hideInput ? this.selectedActivity$() as any : null,
                formatOptions: {
                    showHeader: false
                },
                user: { name: this.props.user.name, id: this.props.user.id },
                bot: { name: CL_USER_NAME_ID, id: `BOT-${this.props.user.id}` },
                resize: 'detect',
                hideInput: this.props.hideInput,
                focusInput: this.props.focusInput
            } as any
        }
        else {
            this.chatProps.hideInput = this.props.hideInput;
            this.chatProps.focusInput = this.props.focusInput;
        }
        return this.chatProps;
    }
    render() {
        let chatProps = this.GetChatProps();

        return (
            <div id="botchat" className="webchatwindow wc-app">
                <BotChat.Chat {...chatProps} />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setConversationId: actions.display.setConversationId,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        teachSessions: state.teachSessions,
        chatSessions: state.chatSessions,
        user: state.user
    }
}

export interface ReceivedProps {
    app: AppBase,
    history: Activity[],
    hideInput: boolean,
    focusInput: boolean,
    onSelectActivity: (a: Activity) => void,
    onPostActivity: (a: Activity) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(Webchat);