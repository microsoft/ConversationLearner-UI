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
import { TreeNodeLabel, TreeNode } from './TreeNodeLabel'
import './TreeView.css';
import { EditDialogType, EditState } from '.'
import EditDialogAdmin from './EditDialogAdmin';

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

interface ComponentState {
    tree: TreeNode | null
    trainDialog: CLM.TrainDialog | null
}

class TreeView extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        tree: null,
        trainDialog: null
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

    componentDidMount() {
        this.updateTree()
    }

    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (prevProps.trainDialogs !== this.props.trainDialogs) {
            this.updateTree()
        }
    }

    makeRoot(): TreeNode {
        return { name: "start", attributes: undefined, children: [], trainDialogIds: []}
    }

    updateTree() {
        let tree = this.makeRoot()
        if (this.props.trainDialogs.length > 0) {
          this.props.trainDialogs.forEach(td => this.addTrainDialog(tree, td))
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
            return apiAction.name
        }
        else if (action.actionType === CLM.ActionTypes.CARD) {
            const cardAction = new CLM.CardAction(action)
            return cardAction.templateName
        }
        else if (action.actionType === CLM.ActionTypes.END_SESSION) {
            //const sessionAction = new CLM.SessionAction(action)
            return "End Session"
        }
        else {
            // LARS handle missing action
            return action.actionId
        }

    }
    addExtractorStep(parentNode: TreeNode, extractorStep: CLM.TrainExtractorStep, roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        const child: TreeNode = {
            name: "User",
            userInput: extractorStep.textVariations.map(tv => tv.text),
            attributes: undefined,
            children: [],
            nodeSvgShape: JSON.parse(JSON.stringify(userShape)),
            trainDialogIds: [trainDialog.trainDialogId],
            roundIndex 
        }
        parentNode.children.push(child)
        return child
    }

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

    addScorerStep(parentNode: TreeNode, scorerStep: CLM.TrainScorerStep, roundIndex: number, scoreIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        if (!scorerStep.labelAction) {
            return parentNode
        }
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

    addScorerSteps(parentNode: TreeNode, scorerSteps: CLM.TrainScorerStep[], roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {
        let parent = parentNode
        scorerSteps.forEach((scorerStep, scoreIndex) => {
            parent = this.addScorerStep(parent, scorerStep, roundIndex, scoreIndex, trainDialog)
        })
        return parent
    }

    // Get next child that it the parent for a round
    getNextRoundParent(parent: TreeNode): TreeNode {
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

    findMatchingRound(parent: TreeNode, round: CLM.TrainRound, roundIndex: number, trainDialog: CLM.TrainDialog): TreeNode {

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
            match.nodeSvgShape.shapeProps.height += 20  
            return this.getNextRoundParent(match)
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

    addTrainDialog(tree: TreeNode, trainDialog: CLM.TrainDialog): void {
        let parent = tree
        trainDialog.rounds.forEach((round, roundIndex) => {

            parent = this.findMatchingRound(parent, round, roundIndex, trainDialog)
        })
    }

    @OF.autobind
    openTreeNode(treeNode: TreeNode): void {
        // Pick first one
        const trainDialogId = treeNode.trainDialogIds[0]
        if (trainDialogId) {
            const trainDialog = this.props.trainDialogs.find(t => t.trainDialogId === trainDialogId)
            if (trainDialog) {
                this.setState({trainDialog})
            
                let roundIndex = treeNode.roundIndex === undefined ? null : treeNode.roundIndex
                let scoreIndex = treeNode.scoreIndex === undefined ? null : treeNode.scoreIndex
                this.props.openTrainDialog(trainDialog, roundIndex, scoreIndex)
            
            }
        }
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open && this.state.tree != null}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName='cl-modal fullscreen'
            >
            <div className="demo-container">
                <div className="column-right">
                    <div className="tree-container">
                        <Tree 
                            data={this.state.tree!}
                            ref="myRef"//LARS TODO use prop
                            orientation='vertical'
                            allowForeignObjects={true}
                            collapsible={false}
                         //   onClick={(node: TreeNode) => { this.onOpenTrainDialog(node.trainDialogs[0]) }}
                            nodeLabelComponent={
                                {
                                    render: <TreeNodeLabel
                                        onExpandoClick={this.onClickExpando}
                                        onOpenTrainDialog={this.openTreeNode}
                                    />,
                                    foreignObjectWrapper: {
                                    y: 4,
                                    width: 250
                                }
                            }}
                            separation={{siblings: 2, nonSiblings: 2}}
                        /> 
                    </div>
                </div>
                {this.state.trainDialog &&
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
                    />    
                }  
            </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">
                            <OF.DefaultButton
                                onClick={this.onClickCancel}
                                ariaDescription={Util.formatMessageId(intl, FM.BUTTON_CLOSE)}
                                text={Util.formatMessageId(intl, FM.BUTTON_CLOSE)}
                            />
                        </div>
                    </div>
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