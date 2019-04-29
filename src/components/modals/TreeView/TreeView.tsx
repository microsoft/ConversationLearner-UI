/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'
import { State } from '../../../types'
import { FM } from '../../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import * as Util from '../../../Utils/util'
import Tree from 'react-d3-tree';
import { TreeNodeLabel, TreeNode, TreeScorerStep } from './TreeNodeLabel'
import { TreeNodeExpanded } from './TreeNodeExpanded'
import './TreeView.css';
import { EditDialogType, EditState } from '..'

const userShape = {
    shape: 'circle',
    shapeProps: {
        r: 4,
        fill: '#5c005c'
    }
}

const NODE_WIDTH = 250
const NODE_HEIGHT = 200

interface ComponentState {
    tree: TreeNode | null 
    selectedNode: TreeNode | null
    expandedNode: TreeNode | null
    translateX: number | null,
    treeContainer: any,
    treeElement: any,
    fullScreen: boolean,
    showBanner: boolean,
}

class TreeView extends React.Component<Props, ComponentState> {

    state: ComponentState = {
        tree: null,
        selectedNode: null,
        expandedNode: null,
        translateX: null,
        treeContainer: null,
        treeElement: null,
        fullScreen: false,
        showBanner: true
    }

    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (this.props.open && !prevProps.open) {
            this.updateTree()
        }
        if (this.props.trainDialogs !== prevProps.trainDialogs) {
            this.updateTree()
        }
        if (this.state.treeContainer) {
            if (!this.state.translateX || (this.state.selectedNode !== prevState.selectedNode)) {
                if (this.state.selectedNode) {
                    this.setState({translateX: NODE_WIDTH})
                }
                else {
                        const dimensions = this.state.treeContainer.getBoundingClientRect();
                        this.setState({
                            translateX: dimensions.width / 2.5,
                        })
                }
            }
        }
    }

    @OF.autobind 
    onNodeDetail(nodeId: string): void {
        const matches: TreeNode[] = this.state.treeElement.findNodesById(nodeId, this.state.treeElement.state.data, []);
        const expandedNode = matches[0];
        this.setState({expandedNode: expandedNode || null})
    }

    @OF.autobind 
    onCloseExpando(): void {
        this.setState({expandedNode: null})
    }

    @OF.autobind
    onClickExpando(nodeId: string): void {
        const matches = this.state.treeElement.findNodesById(nodeId, this.state.treeElement.state.data, []);
        const targetNode = matches[0];
        targetNode._collapsed ? this.state.treeElement.expandNode(targetNode) : this.state.treeElement.collapseNode(targetNode);

        this.state.treeElement.setState({ data: this.state.treeElement.state.data, isTransitioning: false });

        setTimeout(
            () => this.state.treeElement.setState({ isTransitioning: false }),
            this.state.treeElement.props.transitionDuration + 10,
        );
        this.state.treeElement.internalState.targetNode = targetNode;
    }

    @OF.autobind
    dismissBanner() {
        this.setState({showBanner: false})
    }

    makeRoot(): TreeNode {
        return { name: "start", attributes: undefined, children: [], trainDialogIds: []}
    }

    // Is selected node still valid (user may have deleted the train dialog)
    isSelectedNodeValid(): boolean {
        if (!this.state.selectedNode) {
            return false
        }
        for (let trainDialogId of this.state.selectedNode.trainDialogIds) {
            if (this.props.trainDialogs.find(td => td.trainDialogId === trainDialogId)) {
                return true
            }
        }
        return false
    }

    updateTree() {
        let tree = this.makeRoot()
        if (this.props.trainDialogs.length > 0) {
            if (this.state.selectedNode && this.isSelectedNodeValid()) {
                let filter = this.state.selectedNode
                let selected = this.props.trainDialogs.filter(td => filter.trainDialogIds.includes(td.trainDialogId))
                selected.forEach(td => this.addTrainDialog(tree, td))

                let excluded = this.props.trainDialogs.filter(td => !filter.trainDialogIds.includes(td.trainDialogId))
                excluded.forEach(td => this.addTrainDialog(tree, td, filter.roundIndex))
            }
            else {
                this.props.trainDialogs.forEach(td => this.addTrainDialog(tree, td))
            }
        }
        this.setState({tree})
    }

    simpleActionRenderer(action: CLM.ActionBase): string {

        if (action.actionType === CLM.ActionTypes.TEXT) {
            const textAction = new CLM.TextAction(action)
            const defaultEntityMap = Util.getDefaultEntityMap(this.props.entities)
            return textAction.renderValue(defaultEntityMap, { preserveOptionalNodeWrappingCharacters: true })
        }
        else if (action.actionType === CLM.ActionTypes.API_LOCAL) {
            const apiAction = new CLM.ApiAction(action) 
            return `API: ${apiAction.name}`
        }
        else if (action.actionType === CLM.ActionTypes.CARD) {
            const cardAction = new CLM.CardAction(action)
            return `CARD: ${cardAction.templateName}`
        }
        else if (action.actionType === CLM.ActionTypes.END_SESSION) {
            //const sessionAction = new CLM.SessionAction(action)
            return "API: End Session"
        }
        else if (action.actionType === CLM.ActionTypes.SET_ENTITY) {
            const [name, value] = Util.setEntityActionDisplay(action, this.props.entities)
            return `Set Entity - ${name}: ${value}`
        }
        else {
            return "UNKNOWN ACTION TYPE"
        }

    }
    addExtractorStep(parentNode: TreeNode, extractorStep: CLM.TrainExtractorStep, roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        const child: TreeNode = {
            name: "User",
            userInput: extractorStep.textVariations.map(tv => { return {content: tv.text, trainDialogId: trainDialog.trainDialogId}}),
            attributes: undefined,
            children: [],
            nodeSvgShape: Util.deepCopy(userShape),
            trainDialogIds: [trainDialog.trainDialogId],
            roundIndex 
        }
        parentNode.children.push(child)
        return child
    }

    toTreeScorerStep(scorerStep: CLM.TrainScorerStep): TreeScorerStep {
        const entities: string[] = []
        if (scorerStep.input.filledEntities && scorerStep.input.filledEntities.length > 0) {
            scorerStep.input.filledEntities.forEach(fe => {
                let entity = this.props.entities.find(e => e.entityId === fe.entityId)
                if (entity) {
                    entities.push(entity.entityName)
                }
                else {
                    entities.push("UNKNOWN ENTITY")
                }
            })
        }
        return {
            actionId: scorerStep.labelAction || "UNKNOWN ACTION",
            memory: entities
        }
    }
    
    memoryAttributes(scorerStep: CLM.TrainScorerStep): { [key: string]: string; } | undefined {
        if (!scorerStep.input.filledEntities || scorerStep.input.filledEntities.length === 0) {
            return undefined
        }
        const attributes = {}
        scorerStep.input.filledEntities.forEach(fe => {
            let entity = this.props.entities.find(e => e.entityId === fe.entityId)
            if (entity) {
                // TODO: handle missing entity with warning?
                attributes[entity.entityName] = ""
            }
        })
        return attributes
    }

    @OF.autobind
    generateActionDescriptions(treeScorerStep: TreeScorerStep[]): void {
        treeScorerStep.forEach(tss => {
            let action = this.props.actions.find(a => a.actionId === tss.actionId)
            return action ? tss.description = this.simpleActionRenderer(action) : "- MISSING ACTION -"
        })
    }

    addScorerStep(parentNode: TreeNode, scorerStep: CLM.TrainScorerStep, roundIndex: number, scoreIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        if (!scorerStep.labelAction) {
            return parentNode
        }

        if (!parentNode.scorerSteps) {
            parentNode.scorerSteps = []
        }
        parentNode.scorerSteps.push(this.toTreeScorerStep(scorerStep))
        return parentNode
    }

    addScorerSteps(parentNode: TreeNode, scorerSteps: CLM.TrainScorerStep[], roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        let parent = parentNode
        scorerSteps.forEach((scorerStep, scoreIndex) => {
            parent = this.addScorerStep(parent, scorerStep, roundIndex, scoreIndex, trainDialog)
        })
        return parent
    }

    doesRoundMatch(round1: TreeNode, round2: TreeNode): boolean {

        // Check scorer steps array
        if (round1.scorerSteps && !round2.scorerSteps ||
            !round1.scorerSteps && round2.scorerSteps) {
                return false
            }
        else if (!round1.scorerSteps && !round2.scorerSteps) {
            return true
        }
        else {
            return JSON.stringify(round1.scorerSteps) === JSON.stringify(round2.scorerSteps)
        }
    }

    findMatchingRound(parent: TreeNode, round: CLM.TrainRound, roundIndex: number, trainDialog: CLM.TrainDialog, filter: boolean): TreeNode | null {

        // Create new round
        const tempParent: TreeNode = this.makeRoot()
        const child = this.addRound(tempParent, round, roundIndex, trainDialog)
        const newRound = tempParent.children[0]

        // Check for existing matching round
        const match = parent.children.find(r => {
            // Maching round
            return this.doesRoundMatch(r, newRound)
        })

        // If a match, return last scorer step as parent
        if (match) { 
            match.userInput = [...match.userInput, ...newRound.userInput]
            match.trainDialogIds = [...match.trainDialogIds, ...newRound.trainDialogIds]
            match.allowForeignObjects = true
            return match
        }

        if (filter) {
            return null
        }

        // Otherwise add as new child
        parent.children.push(tempParent.children[0])
        return child
    }

    addRound(parentNode: TreeNode, round: CLM.TrainRound, roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        let parent = parentNode
        parent = this.addExtractorStep(parent, round.extractorStep, roundIndex, trainDialog)
        parent = this.addScorerSteps(parent, round.scorerSteps, roundIndex, trainDialog)
        return parent
    }

    addTrainDialog(tree: TreeNode, trainDialog: CLM.TrainDialog, filterRound?: number): void {
        let parent: TreeNode | null = tree
        for (let [roundIndex, round] of trainDialog.rounds.entries()) {
            if (filterRound !== undefined && roundIndex <= filterRound) {
                parent = this.findMatchingRound(parent, round, roundIndex, trainDialog, true)    
            }
            else {
                parent = this.findMatchingRound(parent, round, roundIndex, trainDialog, false)    
            }
            if (!parent) {
                return
            }
        }
    }

    @OF.autobind
    async openTrainDialog(selectedNode: TreeNode, trainDialogId: string): Promise<void> {
        if (trainDialogId) {    
            this.setState({expandedNode: null})
            const trainDialog = this.props.trainDialogs.find(t => t.trainDialogId === trainDialogId)
            if (trainDialog) {
                const roundIndex = selectedNode.roundIndex === undefined ? null : selectedNode.roundIndex
                const scoreIndex = selectedNode.scoreIndex === undefined ? null : selectedNode.scoreIndex
                this.props.openTrainDialog(trainDialog, roundIndex, scoreIndex)   
            }
        }
    }

    @OF.autobind
    async pinToNode(selectedNode: TreeNode, isSelected: boolean): Promise<void> {
        if (this.state.selectedNode && isSelected) {
            await Util.setStateAsync(this, {selectedNode: null})
        }
        else {
            await Util.setStateAsync(this, {selectedNode})
        }
        this.updateTree()
    }

    @OF.autobind
    setTreeRef(treeElement: any): void {
        this.setState({treeElement})
    }

    @OF.autobind
    setContainerRef(treeContainer: any): void {
        this.setState({treeContainer})
    }

    @OF.autobind
    toggleFullScreen(): void {
        this.setState({fullScreen: !this.state.fullScreen})
    }

    render() {
        const { intl } = this.props

        if (!this.props.open) {
            return null
        }

        return (
            <div className={this.state.fullScreen ? "cl-treeview-fullscreen" : ""}>
                <OF.DefaultButton
                    className="cl-treeview-expandButton"
                    iconProps={this.state.fullScreen ? {iconName: "MiniContract"} : {iconName: "MiniExpand"}}
                    onClick={this.toggleFullScreen}
                    ariaDescription={Util.formatMessageId(intl, FM.TREEVIEW_TOGGLE_FULLSCREEN)}
                />
                {this.state.showBanner &&
                    <OF.MessageBar
                        className="cl-treeview-messageBar"
                        isMultiline={true}
                        onDismiss={() => this.dismissBanner()}
                        dismissButtonAriaLabel='Close'
                        messageBarType={OF.MessageBarType.success}
                    >
                        [Experimental Feature] We're experimenting with a tree view to help visualize your train dialogs. 
                        <a href={`mailto: conversation-learner@microsoft.com?subject=[Feedback] Tree View`} role='button'>
                            Send us
                        </a>
                        <span> your suggestions on how this view can better help you!</span>
                    </OF.MessageBar>
                }
                <div className="cl-treeview-parentContainer">
                    <div className="cl-treeview-columnRight">
                        <div 
                            className="cl-treeview-container"
                            ref={this.setContainerRef}
                        >
                            {this.state.tree && this.state.treeContainer &&
                                <Tree 
                                    data={this.state.tree!}
                                    ref={this.setTreeRef}
                                    orientation='vertical'
                                    allowForeignObjects={true}
                                    collapsible={false}
                                    nodeSize={{x: NODE_WIDTH, y: NODE_HEIGHT + 2}}
                                    nodeLabelComponent={
                                        {
                                            render: <TreeNodeLabel
                                                selectedNode={this.state.selectedNode}
                                                generateActionDescriptions={this.generateActionDescriptions}
                                                onExpandoClick={this.onClickExpando}
                                                onDetailClick={this.onNodeDetail}
                                                onPinClick={this.pinToNode}
                                                onOpenTrainDialog={this.openTrainDialog}
                                            />,
                                            foreignObjectWrapper: {
                                            y: 4,
                                            x: -(NODE_WIDTH * 0.5),
                                            width: NODE_WIDTH, 
                                            height: NODE_HEIGHT
                                        }
                                    }}
                                    separation={{siblings: 1.2, nonSiblings: 1.2}}
                                    translate={{x: this.state.translateX || 50, y: 20}}
                                    transitionDuration={0}
                                /> 
                            }
                        </div>
                    </div>
                    {this.state.expandedNode &&
                        <Modal
                            isOpen={true}
                            containerClassName='cl-modal'
                        >
                            <div className="cl-treeview-expandedNode">
                                <TreeNodeExpanded
                                    nodeData={this.state.expandedNode}
                                    canEdit={false}
                                    selectedNode={this.state.selectedNode}
                                    generateActionDescriptions={this.generateActionDescriptions}
                                    onExpandoClick={() => {}}
                                    onOpenTrainDialog={this.openTrainDialog}
                                />
                                <div className='cl-modal_footer cl-modal-buttons'>
                                    <div className="cl-modal-buttons_primary">
                                        <OF.DefaultButton
                                            onClick={this.onCloseExpando}
                                            ariaDescription={Util.formatMessageId(intl, FM.BUTTON_CLOSE)}
                                            text={Util.formatMessageId(intl, FM.BUTTON_CLOSE)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    }
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        trainDialogs: state.trainDialogs,
        actions: state.actions,
        entities: state.entities,
        teachSession: state.teachSession
    }
}

export interface ReceivedProps {
    open: boolean
    app: CLM.AppBase,
    editingPackageId: string,
    editState: EditState,
     // Is it new, from a TrainDialog or LogDialog
    editType: EditDialogType,
     // When editing and existing log or train dialog
    sourceTrainDialog: CLM.TrainDialog | null
    // Train Dialog that this edit originally came from (not same as sourceTrainDialog)
    originalTrainDialogId: string | null,
                    
    onCancel: () => void
    openTrainDialog: (trainDialog: CLM.TrainDialog, roundIndex: number | null, scoreIndex: number | null) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TreeView))