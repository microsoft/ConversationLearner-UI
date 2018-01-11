import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types';
import * as BotChat from 'blis-webchat'
import { Chat } from 'blis-webchat'
import { BlisAppBase } from 'blis-models'
import { BehaviorSubject } from 'rxjs';
import { Activity } from 'botframework-directlinejs';

class Webchat extends React.Component<Props, {}> {
    private behaviorSubject: BehaviorSubject<any> = null;
    private chatProps: BotChat.ChatProps = null;

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

    GetChatProps(): BotChat.ChatProps {
        if (!this.chatProps) {
            const dl = new BotChat.DirectLine({
                secret: 'secret', //params['s'],
                token: 'token', //params['t'],
                domain: "http://localhost:3000/directline", //params['domain'],
                webSocket: false // defaults to true,
            });

            const _dl = {
                ...dl,
                postActivity: (activity: any) => {
                    if (this.props.onPostActivity) { 
                        this.props.onPostActivity(activity)
                    }
                    return dl.postActivity(activity)
                },
            } as BotChat.DirectLine;

            this.chatProps = {
                botConnection: _dl,
                formatOptions: {
                    showHeader: false
                },
                user: { name: this.props.user.name, id: this.props.user.id },
                bot: { name: "BlisTrainer", id: "BlisTrainer" },
                resize: 'detect',
                hideInput: this.props.hideInput,
                focusInput: this.props.focusInput
            }
            // If viewing history, add history and listener
            if (this.props.history) {
                this.chatProps = { ...this.chatProps, history: this.props.history, selectedActivity: this.selectedActivity$() as any };
            }
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
                <Chat {...chatProps} />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
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
    app: BlisAppBase,
    history: Activity[] | null,
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