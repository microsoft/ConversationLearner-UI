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
import * as CLM from '@conversationlearner/models'
import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { Activity, Message } from 'botframework-directlinejs'
import { EditDialogType } from './modals/.'
import actions from '../actions'

export function renderActivity(
    activityProps: BotChat.WrappedActivityProps,
    children: React.ReactNode,
    setRef: (div: HTMLDivElement | null) => void,
    renderSelected: ((activity: Activity) => JSX.Element | null) | null,
    editType: EditDialogType,
    shouldRenderHighlight: boolean,
): JSX.Element {

    const timeLine = <span> {activityProps.fromMe ? "User" : "Bot"}</span>;

    const isLogDialog = editType === EditDialogType.LOG_ORIGINAL || editType === EditDialogType.LOG_EDITED
    const who = activityProps.fromMe ? 'me' : 'bot'

    let wrapperClassName =
        ['wc-message-wrapper',
            (activityProps.activity as Message).attachmentLayout || 'list',
            activityProps.onClickActivity && 'clickable'].filter(Boolean).join(' ')

    const clData: CLM.CLChannelData | null = activityProps.activity.channelData ? activityProps.activity.channelData.clData : null
    const userFillColor = editType === EditDialogType.IMPORT ? "import" : isLogDialog ? 'log' : 'train'
    let messageColor = `wc-message-color-${activityProps.fromMe ? userFillColor : 'bot'}`
    let messageFillColor = `wc-message-fillcolor-${activityProps.fromMe ? userFillColor : 'bot'}`
    let messageBorder = ''
    if (clData) {
        if (clData.replayError) {
            if (clData.replayError.errorLevel === CLM.ReplayErrorLevel.WARNING) {
                messageBorder = ` wc-border-warning-from-${who}`;
            }
            else { // ERROR or BLOCKING
                messageBorder = ` wc-border-error-from-${who}`;
            }
            if (clData.replayError.type === CLM.ReplayErrorType.Exception) {
                messageColor = `wc-message-color-exception`
                messageFillColor = `wc-message-fillcolor-exception`
            }
        }
    }

    if (activityProps.selected && shouldRenderHighlight) {
        wrapperClassName += ` wc-message-selected`
    }

    return (
        <div
            data-activity-id={activityProps.activity.id}
            className={wrapperClassName}
            onClick={activityProps.onClickActivity}
            role="button"
        >
            <div
                className={`wc-message wc-message-from-${who} ${messageColor} ${messageBorder}`}
                ref={div => setRef(div)}
                data-testid="web-chat-utterances"
            >
                <div className='wc-message-content'>
                    <svg className={`wc-message-callout ${messageFillColor}`}>
                        <path className="point-left" d="m0,6 l6 6 v-12 z" />
                        <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                    </svg>
                    {children}
                </div>
            </div>
            {activityProps.selected && renderSelected && renderSelected(activityProps.activity)}
            {clData && clData.validWaitAction !== undefined ?
                (
                    <svg className="wc-message-downarrow">
                        <polygon
                            className={clData.validWaitAction
                                ? "wc-message-downarrow-points"
                                : "wc-message-downarrow-points-red"}
                            points="0,0 50,0 25,15"
                        />
                    </svg>
                ) :
                (
                    <div className={`wc-message-from wc-message-from-${who}`}>{timeLine}</div>
                )
            }
        </div>
    )
}

class Webchat extends React.Component<Props> {

    static defaultProps: ReceivedProps = {
        isOpen: false,
        app: null,
        history: [],
        onSelectActivity: () => { },
        onPostActivity: () => { },
        hideInput: false,
        focusInput: false
    }

    private behaviorSubject: BehaviorSubject<any> | null = null
    private subscription: Subscription | null = null
    private chatProps: BotChat.ChatProps | null = null
    private dl: BotChat.DirectLine | null = null

    constructor(p: any) {
        super(p)
        this.selectedActivity$ = this.selectedActivity$.bind(this)
    }

    componentWillUnmount() {
        if (this.dl) {
            this.dl.end();
        }
        if (this.subscription) {
            this.subscription.unsubscribe()
            this.subscription = null
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.history !== nextProps.history) {
            if (this.props.history.length > 0 || nextProps.history.length > 0) {
                this.chatProps = null;
                if (this.subscription) {
                    this.subscription.unsubscribe()
                    this.subscription = null
                }
            }
        }
    }

    selectedActivity$(): BehaviorSubject<any> {
        if (!this.behaviorSubject) {
            this.behaviorSubject = new BehaviorSubject<any>({});
            this.subscription = this.behaviorSubject.subscribe((value) => {
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
                domain: `//localhost:${this.props.settings.botPort}/directline`,
                webSocket: false // defaults to true,
            })

            const botConnection = {
                ...dl,
                postActivity: (activity: any) => {
                    this.props.onPostActivity(activity)
                    if (this.props.disableDL && (activity.value && activity.value['submit'])) {
                        return Observable.empty()
                    }
                    return dl.postActivity(activity)
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
                bot: { name: CLM.CL_USER_NAME_ID, id: `BOT-${this.props.user.id}` },
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
        const chatProps = this.getChatProps();

        chatProps.hideInput = this.props.hideInput
        chatProps.focusInput = this.props.focusInput
        chatProps.onScrollChange = this.props.onScrollChange
        chatProps.initialScrollPosition = this.props.initialScrollPosition
        chatProps.renderActivity = this.props.renderActivity
        chatProps.renderInput = this.props.renderInput
        chatProps.selectedActivityIndex = this.props.selectedActivityIndex
        chatProps.replaceActivityText = this.props.replaceActivityText
        chatProps.replaceActivityIndex = this.props.replaceActivityIndex

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

    if (!state.settings.botPort) {
        throw new Error(`Bot port is not set. This should not be possible. Please open an issue.`)
    }

    return {
        settings: state.settings,
        user: state.user.user,
        initialScrollPosition: state.display.webchatScrollPosition
    }
}

export interface ReceivedProps {
    isOpen: boolean,
    app: CLM.AppBase | null,
    history: Activity[],
    hideInput: boolean,
    focusInput: boolean,
    // Disable message sent via direct line
    disableDL?: boolean,
    onSelectActivity: (a: Activity) => void,
    onPostActivity: (a: Activity) => void,
    onScrollChange?: (position: number) => void,
    renderActivity?: (props: BotChat.WrappedActivityProps, children: React.ReactNode, setRef: (div: HTMLDivElement | null) => void) => (JSX.Element | null)
    renderInput?: () => JSX.Element | null
    // Used to select activity from outside webchat
    selectedActivityIndex?: number | null
    replaceActivityText?: string | null
    replaceActivityIndex?: number | null

}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(Webchat);