/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../types'
import * as BotChat from '@conversationlearner/webchat'
import { AppBase, CL_USER_NAME_ID } from '@conversationlearner/models'
import { BehaviorSubject, Observable } from 'rxjs'
import { Activity } from 'botframework-directlinejs'
import actions from '../actions'

class Webchat extends React.Component<Props, {}> {

    static defaultProps: ReceivedProps = {
        isOpen: false,
        app: null,
        history: [],
        onSelectActivity: () => { },
        onPostActivity: () => { },
        hideInput: false,
        focusInput: false
    }

    private behaviorSubject: BehaviorSubject<any> | null = null;
    private chatProps: BotChat.ChatProps | null = null;
    private dl: BotChat.DirectLine | null = null;

    constructor(p: any) {
        super(p);
        this.selectedActivity$ = this.selectedActivity$.bind(this)
    }

    componentWillUnmount() {
        if (this.dl) {
            this.dl.end();
        }
        if (this.behaviorSubject) {
            this.behaviorSubject.unsubscribe()
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.history !== nextProps.history) {
            this.chatProps = null;
            if (this.behaviorSubject) {
                this.behaviorSubject.unsubscribe()
            }
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
    getConversationId(status: number) {
        if (status === 2) {  // wait for connection is 'OnLine' to send data to bot
            const conversationId = (this.dl as any).conversationId
            const user = this.props.user
            if (!user.name || !user.id) {
                console.warn(`You attempted to set the conversation with out a valid user. name: ${user.name} id: ${user.id}`)
                return
            }
            
            this.props.setConversationIdThunkAsync(user.name, user.id, conversationId)
        }
    }
    getChatProps(): BotChat.ChatProps {
        if (!this.chatProps) {
            const dl = new BotChat.DirectLine({
                secret: 'secret',
                token: 'token',
                domain: `http://localhost:${this.props.settings.botPort}/directline`,
                webSocket: false // defaults to true,
            })

            const botConnection = {         
                ...dl,
                postActivity: (activity: any) => {
                    this.props.onPostActivity(activity)
                    return this.props.disableDL ? null : dl.postActivity(activity)
                }
            }

            if (this.props.history.length > 0) {
                botConnection.activity$ = Observable.from(this.props.history).concat(dl.activity$)
            }

            dl.connectionStatus$.subscribe((status) => this.getConversationId(status));

            this.dl = dl
            this.chatProps = {
                disableUpload: true,
                botConnection: botConnection,
                selectedActivity: this.selectedActivity$(),
                formatOptions: {
                    showHeader: false
                },
                user: { name: this.props.user.name, id: this.props.user.id },
                bot: { name: CL_USER_NAME_ID, id: `BOT-${this.props.user.id}` },
                resize: 'detect',
            } as any
        }

        if (this.chatProps) {
            // Currently we don't support upload so disable button
            this.chatProps.disableUpload = true;
        }

        return this.chatProps!;
    }
    render() {
        // Prevent creation of DL client if not needed
        if (!this.props.isOpen) {
            return null;
        }

        // TODO: This call has side-affects and should be moved to componentDidMount
        let chatProps = this.getChatProps();

        chatProps.hideInput = this.props.hideInput
        chatProps.focusInput = this.props.focusInput
        chatProps.onScrollChange = this.props.onScrollChange
        chatProps.initialScrollPosition = this.props.initialScrollPosition
        chatProps.renderSelectedActivity = this.props.renderSelectedActivity
        chatProps.selectedActivityIndex = this.props.selectedActivityIndex
        chatProps.highlightClassName = this.props.highlightClassName

        return (
            <div id="botchat" className="webchatwindow wc-app">
                <BotChat.Chat {...chatProps} />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setConversationIdThunkAsync: actions.display.setConversationIdThunkAsync,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render WebChat but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        settings: state.settings,
        user: state.user.user,
        initialScrollPosition: state.display.webchatScrollPosition
    }
}

export interface ReceivedProps {
    isOpen: boolean,
    app: AppBase | null,
    history: Activity[],
    hideInput: boolean,
    focusInput: boolean,
    // Disable message sent via direct line
    disableDL?: boolean,
    onSelectActivity: (a: Activity) => void,
    onPostActivity: (a: Activity) => void,
    onScrollChange?: (position: number) => void,
    renderSelectedActivity?: (a: Activity) => (JSX.Element | null)
    highlightClassName?: string
    // Used to select activity from outside webchat
    selectedActivityIndex?: number | null

}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(Webchat);