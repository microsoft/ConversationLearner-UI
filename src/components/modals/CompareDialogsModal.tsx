/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'
import * as BotChat from '@conversationlearner/webchat'
import * as Util from '../../Utils/util'
import * as BB from 'botbuilder'
import * as Test from '../../types/TestObjects'
import * as OBIUtils from '../../Utils/obiUtils'
import actions from '../../actions'
import IndexButtons from '../IndexButtons'
import Webchat, { renderActivity } from '../Webchat'
import { autobind } from 'core-decorators';
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { Activity } from 'botframework-directlinejs'
import { State } from '../../types'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { EditDialogType } from '../../types/const'
import { FM } from '../../react-intl-messages'
import './CompareDialogsModal.css'

interface ComponentState {
    conversationIndex: number
    webchatKey: number
    activityMap: Map<string, BB.Activity[]>
    rankMap: Map<string, number | undefined>
    sourceItemMap: Map<string, Test.ValidationItem[]> | undefined
    selectedActivityIndex: number | null
    scrollPosition: number | null
}

interface RenderData {
    activities: BB.Activity[] | undefined,
    ranking: number | undefined
    sourceName: string
}

const initialState: ComponentState = {
    webchatKey: 0,
    conversationIndex: 0,
    activityMap: new Map<string, BB.Activity[]>(),
    rankMap: new Map<string, number | undefined>(),
    sourceItemMap: undefined,
    selectedActivityIndex: null,
    scrollPosition: 0
}

class CompareDialogsModal extends React.Component<Props, ComponentState> {
    state = initialState

    async componentDidMount() {

        // Gather source items for for the requested conversations
        const sourceItemMap = new Map<string, Test.ValidationItem[]>()
        for (const sourceName of this.props.validationSet.sourceNames) {
            const sourceItems = this.props.validationSet.getItems(sourceName, this.props.conversationIds)
            sourceItemMap.set(sourceName, sourceItems)
        }

        await Util.setStateAsync(this, {sourceItemMap})
        await this.onChangedDialog()
    }

    async componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (this.state.conversationIndex !== prevState.conversationIndex) {
            await this.onChangedDialog()
        }
    }

    renderActivity(activityProps: BotChat.WrappedActivityProps, children: React.ReactNode, setRef: (div: HTMLDivElement | null) => void): JSX.Element {
        return renderActivity(activityProps, children, setRef, null, EditDialogType.IMPORT, this.state.selectedActivityIndex != null)
    }

    @autobind
    onNext() {
        let resultIndex = this.state.conversationIndex + 1
        if (resultIndex === this.props.conversationIds.length) {
            resultIndex = 0
        }
        this.setState({conversationIndex: resultIndex})       
    }

    @autobind
    onPrevious() {
        let resultIndex = this.state.conversationIndex - 1
        if (resultIndex < 0) {
            resultIndex = this.props.conversationIds.length - 1
        }
        this.setState({conversationIndex: resultIndex})
    }

    // Set from and recipient data from proper rendering
    cleanTranscript(activities: BB.Activity[]): void {
        const userAccount: BB.ChannelAccount = { id: this.props.user.id, name: this.props.user.name, role: "user", aadObjectId: '' }
        const botAccount: BB.ChannelAccount = { id: `BOT-${this.props.user.id}`, name: CLM.CL_USER_NAME_ID, role: "bot", aadObjectId: '' }

        for (let activity of activities) {
            if (!activity.recipient) {
                if (activity.from.role === "bot") {
                    activity.recipient = userAccount
                    activity.from = botAccount
                }
                else if (activity.from.role === 'user') {
                    activity.recipient = botAccount
                    activity.from = userAccount
                }
            }
            if (!activity.id) {
                activity.id = CLM.ModelUtils.generateGUID()
            }
        }
    }

    // User had changed dialog.  Generate appropriate activityMaps
    async onChangedDialog() {

        if (!this.state.sourceItemMap) {
            return
        }
        if (this.state.conversationIndex >= this.props.conversationIds.length) {
            console.log("INVALID INDEX: CompareDialogModal")
            return
        }

        const activityMap = new Map<string, BB.Activity[]>()
        const rankMap = new Map<string, number | undefined>()
        const conversationId = this.props.conversationIds[this.state.conversationIndex]

        // Baseline rank is determined by pivot item (if provided)
        let baseRank = 0
        if (this.props.conversationPivot) {
            const pivotItem = this.props.validationSet.getItem(this.props.conversationPivot, conversationId)
            if (pivotItem && pivotItem.ranking) {
                baseRank = pivotItem.ranking
            }
        }

        for (let sourceName of this.props.validationSet.sourceNames) {

            const validationItems = this.state.sourceItemMap.get(sourceName)

            if (validationItems) {
                const curItem = validationItems.find(i => i.conversationId === conversationId)
                if (curItem) {
                    const curTranscript = curItem.transcript
                    // If I have a transcript for the given conversationId, generate actitityMap
                    if (curTranscript) {
                        let trainDialog = await OBIUtils.trainDialogFromTranscriptImport(curTranscript, null, this.props.entities, this.props.actions, this.props.app)
                        trainDialog.definitions = {
                            actions: this.props.actions,
                            entities: this.props.entities,
                            trainDialogs: []
                        }
                        const teachWithActivities = await ((this.props.fetchActivitiesThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithActivities>)
                        activityMap.set(sourceName, teachWithActivities.activities)
                    }
                    // Computer rank with pivot offset
                    rankMap.set(sourceName, curItem.ranking !== undefined ? curItem.ranking - baseRank : undefined)
                }
            }
        }

        this.setState({
            activityMap,
            rankMap,
            webchatKey: this.state.webchatKey + 1,
            scrollPosition: 0
        })
    }

    @autobind
    onEdit() {
        /* LARS 
        const validationResult = this.props.validationSet.comparisons[this.state.resultIndex]
        
        const { history } = this.props
        let url = `/home/${this.props.app.appId}/logDialogs?${DialogUtils.DialogQueryParams.id}=${validationResult.logDialogId}`
        history.push(url, { app: this.props.app })
        */
    }

    // Keep scroll position of two webchats in lockstep
    @autobind
    onScrollChange(scrollPosition: number) {
        this.setState({scrollPosition})
    }

    @autobind
    onSelectActivity(activities: BotChat.Activity[] | undefined, activity: Activity) {
        if (!activities || activities.length === 0) {
            return
        }

        // Look up index
        const selectedActivityIndex = activities.findIndex(a => a.id === activity.id)
        if (selectedActivityIndex > -1) {
            this.setState({
                selectedActivityIndex
            })
        }
    }

    getRenderData(): RenderData[] {

        const renderData: RenderData[] = []
        this.props.validationSet.sourceNames.map(sourceName => {
            const activities = this.state.activityMap.get(sourceName)
            const ranking = this.state.rankMap.get(sourceName)
            renderData.push({
                activities,
                ranking,
                sourceName
            })
        })
        return renderData
    }

    render() {
        const renderData = this.getRenderData()
        const size = renderData.length === 1
            ? "cl-compare-dialogs-small"
            : renderData.length === 2
            ? "cl-compare-dialogs-med"
            : "cl-compare-dialogs-large"

        return (
            <div>
                <OF.Modal
                    isOpen={true}
                    isBlocking={true}
                    containerClassName={`cl-modal cl-modal--compare-dialogs ${size}`}
                >
                    <div className="cl-modal_body">
                        <div className="cl-compare-dialogs-modal">
                            {renderData.map(rd => {
                                return (
                                    <div 
                                        className="cl-compare-dialogs-channel"
                                        key={rd.sourceName}
                                    >
                                        <div 
                                            className="cl-compare-dialogs-title"
                                            style={{backgroundColor: `${Util.scaledColor(rd.ranking)}`}}
                                            key={rd.sourceName}
                                        >
                                            {rd.sourceName}
                                            <div className="cl-compare-dialogs-filename">
                                                {5/*LARS this.props.transcriptValidationResults[this.state.resultIndex].fileName*/}
                                            </div>
                                        </div>
                                        <div className="cl-compare-dialogs-webchat">
                                            <Webchat 
                                                isOpen={rd.activities !== undefined}
                                                key={`${rd.sourceName}-${this.state.webchatKey}`}
                                                app={this.props.app}
                                                history={rd.activities as any || []}
                                                onPostActivity={() => {}}
                                                onSelectActivity={(activity) => this.onSelectActivity(rd.activities as any, activity)}
                                                onScrollChange={this.onScrollChange}
                                                hideInput={true}
                                                focusInput={false}
                                                renderActivity={(props, children, setRef) => this.renderActivity(props, children, setRef)}
                                                renderInput={() => null}
                                                selectedActivityIndex={this.state.selectedActivityIndex}
                                                forceScrollPosition={this.state.scrollPosition}
                                                instantScroll={true}
                                                disableCardActions={true}
                                            />
                                        </div>
                                    </div>
                                )
                                })
                            }
                        </div>
                    </div>
                    <div className="cl-modal_footer cl-modal_footer--border">
                        <div className="cl-modal-buttons">
                            <div className="cl-modal-buttons_primary">
                                <IndexButtons
                                    onPrevious={this.onPrevious}
                                    onNext={this.onNext}
                                    curIndex={this.state.conversationIndex}
                                    total={this.props.conversationIds.length}
                                />
                            </div>
                            <div className="cl-modal-buttons_secondary">
                                <OF.DefaultButton
                                    onClick={this.onEdit}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.COMPAREDIALOGS_EDIT)}
                                    text={Util.formatMessageId(this.props.intl, FM.COMPAREDIALOGS_EDIT)}
                                    iconProps={{ iconName: 'ColumnRightTwoThirdsEdit' }}
                                />
                                <OF.DefaultButton
                                    onClick={this.props.onClose}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                    iconProps={{ iconName: 'Cancel' }}
                                />

                            </div>
                        </div>
                    </div>
                </OF.Modal>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchLogDialogAsync: actions.log.fetchLogDialogThunkAsync,
        fetchActivitiesThunkAsync: actions.train.fetchActivitiesThunkAsync,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render CompareDialogModels but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }
    return {
        user: state.user.user,
        entities: state.entities,
        actions: state.actions
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    validationSet: Test.ValidationSet
    conversationIds: string[]
    conversationPivot?: string
    onClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(CompareDialogsModal)))
