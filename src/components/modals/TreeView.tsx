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
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import * as Util from '../../Utils/util'
import Tree from 'react-d3-tree';
import { TreeNodeLabel, TreeNode, TreeScorerStep } from './TreeNodeLabel'
import './TreeView.css';
import { EditDialogType, EditState } from '.'

const userShape = {
    shape: 'circle',
    shapeProps: {
        r: 4,
        fill: '#5c005c'
    }
}

const botShape = {
    shape: 'circle',
    shapeProps: {
        r: 4,
        fill: '#dbdee1'
    }
}

const NODE_WIDTH = 250
const NODE_HEIGHT = 155

interface ComponentState {
    tree: TreeNode | null
    trainDialog: CLM.TrainDialog | null 
    selectedNode: TreeNode | null
    expandedNode: TreeNode | null
    extended: boolean,
    translateX: number | null,
    treeContainer: any,
    treeElement: any
}

class TreeView extends React.Component<Props, ComponentState> {

    state: ComponentState = {
        tree: null,
        trainDialog: null,
        selectedNode: null,
        expandedNode: null,
        extended: false,
        translateX: null,
        treeContainer: null,
        treeElement: null
    }

    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (this.props.open && !prevProps.open) {
            this.updateTree()
        }
        if (this.state.treeContainer) {
        if (!this.state.translateX || (this.state.treeContainer !== prevState.treeContainer)) {
                const dimensions = this.state.treeContainer.getBoundingClientRect();
                this.setState({
                    translateX: dimensions.width / 2.5,
                })
            }
        }
    }

    @OF.autobind 
    onNodeDetail(nodeId: string): void {
        const matches = this.state.treeElement.findNodesById(nodeId, this.state.treeElement.state.data, []);
        const expandedNode = matches[0];
        this.setState({expandedNode})
    }

    @OF.autobind 
    onCloseExpando(): void {
        this.setState({expandedNode: null})
    }

    @OF.autobind
    onClickExpando(nodeId: string): void {
        const myRef = this.refs.myRef as any;

        const matches = myRef.findNodesById(nodeId, myRef.state.data, []);
        const targetNode = matches[0];
        targetNode._collapsed ? myRef.expandNode(targetNode) : myRef.collapseNode(targetNode);

        myRef.setState({ data: myRef.state.data, isTransitioning: false });

        setTimeout(
            () => myRef.setState({ isTransitioning: false }),
            myRef.props.transitionDuration + 10,
        );
        myRef.internalState.targetNode = targetNode;
    }

    @OF.autobind
    onClickCancel() {
        this.props.onCancel()
    }

    makeRoot(): TreeNode {
        return { name: "start", attributes: undefined, children: [], trainDialogIds: []}
    }

    updateTree() {
        let tree = this.makeRoot()
        if (this.props.trainDialogs.length > 0) {
            if (this.state.selectedNode) {
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
            nodeSvgShape: JSON.parse(JSON.stringify(userShape)),
            trainDialogIds: [trainDialog.trainDialogId],
            roundIndex 
        }
        parentNode.children.push(child)
        return child
    }

    toTreeScorerStep(scorerStep: CLM.TrainScorerStep): TreeScorerStep {
        let entities: string[] = []
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
    
    // LARS goes away
    memoryAttributes(scorerStep: CLM.TrainScorerStep): { [key: string]: string; } | undefined {
        if (!scorerStep.input.filledEntities || scorerStep.input.filledEntities.length === 0) {
            return undefined
        }
        let attributes = {}
        scorerStep.input.filledEntities.forEach(fe => {
            let entity = this.props.entities.find(e => e.entityId === fe.entityId)
            if (entity) {
                // LARS handle missing entity with warning?
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

        // If in extended mode, add scorer steps as children
        if (this.state.extended) {
            let action = this.props.actions.find(a => a.actionId === scorerStep.labelAction)
            let name = action ? this.simpleActionRenderer(action) : "- MISSING ACTION -"
            const child: TreeNode = {
                name: name,
                attributes: this.memoryAttributes(scorerStep),
                children: [],
                nodeSvgShape: botShape,
                actionId: action ? action.actionId : "MISSING ACTION",
                trainDialogIds: [trainDialog.trainDialogId],
                roundIndex,
                scoreIndex
            }
            parentNode.children.push(child)
            return child
        }
        // Otherwise just annotate the extractor step
        else {
            if (!parentNode.scorerSteps) {
                parentNode.scorerSteps = []
            }
            parentNode.scorerSteps.push(this.toTreeScorerStep(scorerStep))
            return parentNode
        }
    }

    addScorerSteps(parentNode: TreeNode, scorerSteps: CLM.TrainScorerStep[], roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        let parent = parentNode
        scorerSteps.forEach((scorerStep, scoreIndex) => {
            parent = this.addScorerStep(parent, scorerStep, roundIndex, scoreIndex, trainDialog)
        })
        return parent
    }

    // Get next child that it the parent for a round
    getNextRoundParent(parent: TreeNode): TreeNode {
        if (this.state.extended) {
            // Get first scorer step
            let node = parent.children[0]
            // Loop until next extractor step
            while (node && node.actionId) {
                if (!node.children[0] || !node.children[0].actionId) {
                    return node
                }
                // Scorer steps always have one chile
                node = node.children[0]
            }
            return node
        }
        return parent
    }

    doesMemoryMatch(node1: TreeNode, node2: TreeNode): boolean {
        return (JSON.stringify(node1.attributes) === JSON.stringify(node2.attributes))
    }

    doesRoundMatch(round1: TreeNode, round2: TreeNode): boolean {
        if (!this.doesMemoryMatch(round1, round2)) {
            return false
        }
        // Must both be extractor steps
        if (round1.actionId || round2.actionId) {
            return false
        }

        // If extended view, check scorer steps in children
        if (this.state.extended) {
            let node1 = round1.children[0]
            let node2 = round2.children[0]

            if (!node1 || !node2) {
                return false
            }
            // Loop until next extractor step
            while (node1 && node1.actionId) {
                if (node1.actionId !== node2.actionId) {
                    return false
                }
                if (!this.doesMemoryMatch(node1, node2)) {
                    return false
                }
                // Scorer steps always have one child 
                node1 = node1.children[0]
                node2 = node2.children[0]
            }
            return true
        }
        // Otherwise check scorer steps array
        else {
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
    }

    findMatchingRound(parent: TreeNode, round: CLM.TrainRound, roundIndex: number, trainDialog: CLM.TrainDialog, filter: boolean): TreeNode | null {

        // Create new round
        let tempParent: TreeNode = this.makeRoot()
        let child = this.addRound(tempParent, round, roundIndex, trainDialog)
        let newRound = tempParent.children[0]

        // Check for existing matching round
        let match = parent.children.find(r => {
            // Maching round
            return this.doesRoundMatch(r, newRound)
        })

        // If a match, return last scorer step as parent
        if (match) { 
            match.userInput = [...match.userInput, ...newRound.userInput]
            match.trainDialogIds = [...match.trainDialogIds, ...newRound.trainDialogIds]
            match.allowForeignObjects = true
            return this.getNextRoundParent(match)
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
                let roundIndex = selectedNode.roundIndex === undefined ? null : selectedNode.roundIndex
                let scoreIndex = selectedNode.scoreIndex === undefined ? null : selectedNode.scoreIndex
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

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName='cl-modal fullscreen'
            >
                <div className="demoContainer">
                    <div className="columnRight">
                        <div 
                            className="treeContainer"
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
                                                canEdit={false}
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
                                    separation={{siblings: 2, nonSiblings: 2}}
                                    translate={{x: this.state.translateX || 50, y: 20}}
                                /> 
                            }
                        </div>
                    </div>
                    {this.state.expandedNode &&
                        <Modal
                            isOpen={true}
                            containerClassName='cl-modal'
                        >
                            <div className="expandedContainer">
                                <TreeNodeLabel
                                    nodeData={this.state.expandedNode}
                                    expanded={true}
                                    canEdit={false}
                                    selectedNode={this.state.selectedNode}
                                    generateActionDescriptions={this.generateActionDescriptions}
                                    onExpandoClick={()=>{}}
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
                    {
                    /*
                    TODO: Display editing dialog in view
                    this.state.trainDialog &&
                        <EditDialogAdmin
                            data-testid="chatmodal-editdialogadmin"
                            app={this.props.app}
                            editingPackageId={this.props.editingPackageId}
                            editingLogDialogId={null}//this.props.editingLogDialogId}
                            originalTrainDialogId={this.props.originalTrainDialogId}
                            editType={this.props.editType}
                            editState={this.props.editState}
                            trainDialog={this.state.trainDialog}//this.props.trainDialog}
                            selectedActivity={null}//this.state.selectedActivity}
                            isLastActivitySelected={false}//isLastActivitySelected}
                            onChangeAction={()=>{}}//(trainScorerStep: CLM.TrainScorerStep) => this.onChangeAction(trainScorerStep)}
                            onSubmitExtraction={()=>{}}//(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => this.onChangeExtraction(extractResponse, textVariations)}
                            onPendingStatusChanged={()=>{}}//(changed: boolean) => this.onPendingStatusChanged(changed)}

                            allUniqueTags={[]}//this.props.allUniqueTags}
                            tags={[]}//this.state.tags}
                            onAddTag={()=>{}}//this.onAddTag}
                            onRemoveTag={()=>{}}//this.onRemoveTag}

                            description={""}//this.state.description}
                            onChangeDescription={()=>{}}//this.onChangeDescription}
                    />*/    
                    }  
                </div>
                <div className='closeButton'>
                    <OF.DefaultButton
                        onClick={this.onClickCancel}
                        ariaDescription={Util.formatMessageId(intl, FM.BUTTON_CLOSE)}
                        text={Util.formatMessageId(intl, FM.BUTTON_CLOSE)}
                    />
                </div>
            </Modal>
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