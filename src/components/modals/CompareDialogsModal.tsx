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
import * as DialogUtils from '../../Utils/dialogUtils'
import actions from '../../actions'
import IndexButtons from '../IndexButtons'
import Webchat, { renderActivity } from '../Webchat'
import { ActivityHeight } from '../../types/models'
import { autobind } from 'core-decorators';
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
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
    activityMap: {[key: string]: BB.Activity[]}
    rankMap: {[key: string]: number | undefined}
    sourceItemMap: {[key: string]: Test.TestItem[]} | undefined
    selectedActivityIndex: number | null
    scrollPosition: number | null
    logDialogId: string | undefined
    haveActivityHeights: boolean
    activityHeights: ActivityHeight[]
}

interface RenderData {
    activities: BB.Activity[] | undefined,
    ranking: number | undefined
    sourceName: string
}

const initialState: ComponentState = {
    webchatKey: 0,
    conversationIndex: 0,
    activityMap: {},
    rankMap: {},
    sourceItemMap: undefined,
    selectedActivityIndex: null,
    scrollPosition: 0,
    logDialogId: undefined,
    haveActivityHeights: false,
    activityHeights: []
}

class CompareDialogsModal extends React.Component<Props, ComponentState> {
    state = initialState

    async componentDidMount() {

        // Gather source items for for the requested conversations
        const sourceItemMap = new Map<string, Test.TestItem[]>()
        for (const sourceName of this.props.testSet.sourceNames) {
            const sourceItems = this.props.testSet.getTestItems(sourceName, this.props.conversationIds)
            sourceItemMap[sourceName] = sourceItems
        }

        await Util.setStateAsync(this, {sourceItemMap})
        await this.onChangedDialog()
    }

    async componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (this.state.conversationIndex !== prevState.conversationIndex) {
            await this.onChangedDialog()
        }

        if (!this.state.haveActivityHeights) {
            // Check to see if all activity heights have been gathered
            const haveHeights = this.state.activityHeights.length > 0 && this.state.activityHeights.filter(ah => ah.height === undefined).length === 0
            
            if (haveHeights) {
                // If I have them calcluate padding to align acitivity horizontally
                const activityHeights = [...this.state.activityHeights]
                const numActivities = Math.max(...Object.values(this.state.activityMap).map(ah => ah.length))
                for (let index = 0; index < numActivities; index = index + 1) {
                    // Get max height for this index
                    const maxHeight = Math.max(...this.state.activityHeights
                        .filter(ah => ah.index === index) 
                        .map(ah => ah.height || 0))
                    
                    const itemHeights = activityHeights.filter(ah => ah.index === index)
                    for (const activityHeight of itemHeights) {
                        if (activityHeight.height) {
                            // Calcluate padding to make this activity the same height
                            activityHeight.padding = (maxHeight > activityHeight.height) 
                                ? maxHeight - activityHeight.height
                                : 0
                        }
                    }
                }
                this.setState({
                    activityHeights, 
                    scrollPosition: 0,
                    haveActivityHeights: true})  
            }
        }
    }

    renderActivity(activityProps: BotChat.WrappedActivityProps, children: React.ReactNode, setRef: (div: HTMLDivElement | null) => void): JSX.Element {

        // Pad activity to align the activities in chat window
        let padding = 0
        if (this.state.haveActivityHeights && activityProps.activity.id) {
            // Find height lookup
            const activityHeight = this.state.activityHeights.find(ah => ah.id === activityProps.activity.id)
            
            if (activityHeight && activityHeight.padding) {
                padding = activityHeight.padding
            }
        }
        return renderActivity(activityProps, children, setRef, null, EditDialogType.IMPORT, this.state.selectedActivityIndex != null, padding, !this.state.haveActivityHeights)
    }

    @autobind
    onNext() {
        let conversationIndex = this.state.conversationIndex + 1
        if (conversationIndex === this.props.conversationIds.length) {
            conversationIndex = 0
        }
        this.setState({conversationIndex})       
    }

    @autobind
    onPrevious() {
        let conversationIndex = this.state.conversationIndex - 1
        if (conversationIndex < 0) {
            conversationIndex = this.props.conversationIds.length - 1
        }
        this.setState({conversationIndex})
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

        let logDialogId: string | undefined
        const activityMap = {}
        const rankMap = {}
        const conversationId = this.props.conversationIds[this.state.conversationIndex]

        // Baseline rank is determined by pivot item (if provided)
        let baseRank = 0
        if (this.props.conversationPivot) {
            const pivotItem = this.props.testSet.getTestItem(this.props.conversationPivot, conversationId)
            if (pivotItem && pivotItem.ranking) {
                baseRank = pivotItem.ranking
            }
        }

        let minActivities: number = 0
        for (let sourceName of this.props.testSet.sourceNames) {

            const unratedConversationIds = this.props.testSet.unratedConversationIds(sourceName, this.props.conversationPivot)
            const testItems = this.state.sourceItemMap[sourceName]

            if (testItems) {
                const curItem = testItems.find(i => i.conversationId === conversationId)
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
                        activityMap[sourceName] = teachWithActivities.activities

                        // Keep track of the shortest number of activities
                        if (!minActivities || teachWithActivities.activities.length < minActivities) {
                            minActivities = teachWithActivities.activities.length
                        }
                    }

                    // Rank is undefined if it still needs to be rated
                    if (unratedConversationIds.includes(curItem.conversationId)) {
                        rankMap[sourceName] = undefined
                    }
                    // Compute rank with pivot offset (doesn't apply when only one source)
                    else if (this.props.testSet.sourceNames.length > 1) {
                        // Will set rank of base source to 0 and offset other from the base
                        rankMap[sourceName] = curItem.ranking !== undefined ? curItem.ranking - baseRank : undefined
                    }

                    // Note: assumes only one source has a log attached to it
                    // TODO: In future may want to support multiple sources with logs
                    if (curItem.logDialogId) {
                        // Does log dialog still exist?
                        if (this.props.logDialogs.find(ld => ld.logDialogId === curItem.logDialogId)) {
                            logDialogId = curItem.logDialogId
                        }
                    }
                }
            }
        }

        // Trim any extra activities
        for (const key of Object.keys(activityMap)) {
            activityMap[key].splice(minActivities)
        }
                
        // Initialize activity heights for lookup
        const activityHeights: ActivityHeight[] = []
        for (const [sourceName, activities] of Object.entries(activityMap)) {
            for (const [index, activity] of Object.entries(activities as BB.Activity[])) {
                if (activity.id) {
                    const activityHeight: ActivityHeight = {
                        sourceName,
                        index: +index,  // Convert to number
                        id: activity.id,
                        height: undefined,
                        padding: undefined
                    }
                    activityHeights.push(activityHeight)
                }
            }
        }

        this.setState({
            activityMap,
            rankMap,
            webchatKey: this.state.webchatKey + 1,
            logDialogId,
            haveActivityHeights: false,
            activityHeights
        })
    }

    @autobind
    onEdit() {
        if (this.state.logDialogId) {
            const { history } = this.props
            let url = `/home/${this.props.app.appId}/logDialogs?${DialogUtils.DialogQueryParams.id}=${this.state.logDialogId}`
            history.push(url, { app: this.props.app })
        }
    }

    // Keep scroll position of webchats in lockstep
    @autobind
    onScrollChange(scrollPosition: number) {
        this.setState({scrollPosition})
    }

    @autobind
    onSelectActivity(activities: BB.Activity[] | undefined, activity: BB.Activity) {
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

    // Keep track of render height for each activity.  This allows us to
    // align acitivities across multiple webchat windows by adding padding
    @autobind
    onActivityHeight(sourceName: string, index: number, height: number): void {
    
        // Find height for this item
        let activityHeight = this.state.activityHeights.find(ac =>
            ac.sourceName === sourceName && ac.index === index)

        if (activityHeight) {
            // If height hasn't been set
            if (!activityHeight.height) {
                // Set state via function so events don't clobber each other
                this.setState(prevState => {
                     // Update height
                    activityHeight = prevState.activityHeights.find(ac =>
                        ac.sourceName === sourceName && ac.index === index)!
                    activityHeight.height = height
                    return {activityHeights: prevState.activityHeights}
                })
            } 
        }
    }

    getRenderData(): RenderData[] {

        const renderData: RenderData[] = []
        this.props.testSet.sourceNames.map(sourceName => {
            const activities = this.state.activityMap[sourceName]
            const ranking = this.state.rankMap[sourceName]
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
            : renderData.length === 3
            ? "cl-compare-dialogs-large"
            : "cl-compare-dialogs-overhang"

        const body = renderData.length === 1 ? 'cl-compare-dialogs--bodysmall' : ""

        return (
            <div>
                <OF.Modal
                    isOpen={true}
                    isBlocking={true}
                    containerClassName={`cl-modal cl-modal--compare-dialogs ${size}`}
                >
                    <div className={`cl-modal_body ${body}`}>
                        <div className="cl-compare-dialogs-modal">
                            <div className="cl-compare-dialogs-filename">
                                    {this.props.conversationIds[this.state.conversationIndex]}
                            </div>
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
                                                onActivityHeight={(index, height) => this.onActivityHeight(rd.sourceName, index, height)}
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
                                    disabled={!this.state.logDialogId}
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
        actions: state.actions,
        logDialogs: state.logDialogs
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    testSet: Test.TestSet
    conversationIds: string[]
    conversationPivot?: string
    onClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(CompareDialogsModal)))
