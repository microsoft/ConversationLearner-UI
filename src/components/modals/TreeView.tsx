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
import AddButtonInput from './AddButtonInput'
import AddScoreButton from './AddButtonScore'
import Tree from 'react-d3-tree';
import './TreeView.css';
import { EditDialogType } from '.';

interface TreeNode {
    name: string
    userInput?: string[]
    attributes: { [key: string]: string; } | undefined
    children: TreeNode[]
    nodeSvgShape?: any
    actionId?: string
    nodeLabelComponent?: any
    allowForeignObjects?: boolean
    _children?: any
    _collapsed?: any
    id?: string
}

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
}

interface NodeReceivedProps {
    nodeData?: any
    onExpandoClick: (nodeId: string) => void 
}

class NodeLabel extends React.PureComponent<NodeReceivedProps>  {

    render() {
        const nodeData: TreeNode = this.props.nodeData
        if (nodeData.actionId) {
            return (
                <div>
                    <div className="botBox">
                            {nodeData.name}
                            <div className="buttonblock">
                                {nodeData._children && 
                                    <OF.IconButton
                                        className={nodeData._collapsed ? `` : `flip`}
                                        iconProps={{ iconName: 'DrillExpand' }}
                                        onClick={() => {
                                            this.props.onExpandoClick(nodeData.id!)
                                            this.forceUpdate()
                                        }}
                                        ariaDescription="Delete Turn"
                                    />
                                }
                                <AddButtonInput
                                    className={'treeViewButton treeViewButtonPadded'}
                                    onClick={() => {}}
                                    editType={EditDialogType.TRAIN_ORIGINAL}
                                />
                                <OF.IconButton
                                    className={`treeViewButton`}
                                    iconProps={{ iconName: '' }}
                                    onClick={() => {}}
                                />
                                <AddScoreButton
                                    className={'treeViewButton treeViewButtonPadded'}
                                    // Don't select an activity if on last step
                                    onClick={() => {}}
                                />
                                <OF.IconButton
                                    className={`treeViewButton`}
                                    iconProps={{ iconName: 'Delete' }}
                                    onClick={() => {}}
                                    ariaDescription="Delete Turn"
                                />
                            </div>
                    </div>
                    <div className='memory'>
                        {nodeData.attributes && Object.keys(nodeData.attributes).join(', ')}
                    </div>
                </div>
            )
        }
        else {
            return (
                <div>
                    <div className="userBox">
                        {nodeData.userInput && nodeData.userInput.map(input =>
                            <div
                                key={input}
                            >
                                {input}
                            </div>
                        )}
                        <div className="buttonblock">
                            {nodeData._children && 
                                <OF.IconButton
                                    className={nodeData._collapsed ? `` : `flip`}
                                    iconProps={{ iconName: 'DrillExpand' }}
                                    onClick={() => this.props.onExpandoClick(nodeData.id!)}
                                    ariaDescription="Delete Turn"
                                />
                            }
                            <AddButtonInput
                                className={'treeViewButton treeViewButtonPadded'}
                                onClick={() => {}}
                                editType={EditDialogType.TRAIN_ORIGINAL}
                            />
                            <OF.IconButton
                                disabled={true}
                                className={`treeViewButton`}
                                iconProps={{ iconName: 'BranchMerge' }}
                                onClick={() => {}}
                            />
                            <AddScoreButton
                                className={'treeViewButton treeViewButtonPadded'}
                                // Don't select an activity if on last step
                                onClick={() => {}}
                            />
                            <OF.IconButton
                                className={`treeViewButton`}
                                iconProps={{ iconName: 'Delete' }}
                                onClick={() => {}}
                                ariaDescription="Delete Turn"
                            />
                        </div>
                    </div>
                    <div className='memory'>
                        {nodeData.attributes && Object.keys(nodeData.attributes).join(', ')}
                    </div>
                </div>
            )
        }
    }
}

class TreeView extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        tree: null
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
        return { name: "start", attributes: undefined, children: []}
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
    addExtractorStep(parentNode: TreeNode, extractorStep: CLM.TrainExtractorStep): TreeNode {
        const child: TreeNode = {
            name: "User",
            userInput: extractorStep.textVariations.map(tv => tv.text),
            attributes: undefined,
            children: [],
            nodeSvgShape: JSON.parse(JSON.stringify(userShape))
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

    addScorerStep(parentNode: TreeNode, scorerStep: CLM.TrainScorerStep): TreeNode {
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
            actionId: action ? action.actionId : "MISSING ACTION"
        }
        parentNode.children.push(child)
        return child
    }

    addScorerSteps(parentNode: TreeNode, scorerSteps: CLM.TrainScorerStep[]): TreeNode {
        let parent = parentNode
        scorerSteps.forEach(ss => {
            parent = this.addScorerStep(parent, ss)
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

    findMatchingRound(parent: TreeNode, round: CLM.TrainRound): TreeNode {

        // Create new round
        let tempParent: TreeNode = this.makeRoot()
        let child = this.addRound(tempParent, round)

        // Check for existing matching round
        let match = parent.children.find(r => {
            // Maching round
            return this.doesRoundMatch(r, tempParent.children[0])
        })

        // If a match, return last scorer step as parent
        if (match) { 
            //  match.name = `${match.name}||${tempParent.children[0].name}`  LARS
            // props.allowForeignObjects && props.nodeLabelComponent LARS
            match.userInput = [...match.userInput, ...tempParent.children[0].userInput]
            match.allowForeignObjects = true
            match.nodeSvgShape.shapeProps.height += 20  
            return this.getNextRoundParent(match)
        }

        // Otherwise add as new child
        parent.children.push(tempParent.children[0])
        return child
    }

    addRound(parentNode: TreeNode, round: CLM.TrainRound): TreeNode {
        let parent = parentNode
        parent = this.addExtractorStep(parent, round.extractorStep)
        parent = this.addScorerSteps(parent, round.scorerSteps)
        return parent
    }

    addTrainDialog(tree: TreeNode, trainDialog: CLM.TrainDialog): void {
        let parent = tree
        trainDialog.rounds.forEach(round => {

            parent = this.findMatchingRound(parent, round)
        })
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
                            onClick={(nodeObj) => { /*this.handleNodeClick(nodeObj.id, event)*/ }}
                            nodeLabelComponent={
                                {
                                    render: <NodeLabel
                                        onExpandoClick={this.onClickExpando}
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
        entities: state.entities
    }
}

export interface ReceivedProps {
    open: boolean
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TreeView))