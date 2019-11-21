/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../../Utils/util'
import Tree from 'react-d3-tree';
import { TreeUtils } from '../../../Utils/TreeUtils'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../../types'
import { FM } from '../../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { TreeNodeLabel, TreeNode, TreeScorerStep } from './TreeNodeLabel'
import { TreeNodeExpanded } from './TreeNodeExpanded'
import { EditDialogType, EditState } from '../../../types/const'
import './TreeView.css';
import { autobind } from 'core-decorators';

const NODE_WIDTH = 250
const NODE_HEIGHT = 200

interface ComponentState {
    tree: TreeNode | null
    selectedNode: TreeNode | null
    expandedNode: TreeNode | null
    translateX: number | null,
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
        treeElement: null,
        fullScreen: false,
        showBanner: true
    }

    private treeContainerRef = React.createRef<any>()

    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (this.props.open && !prevProps.open) {
            this.updateTree()
        }
        else if (this.props.trainDialogs.length > 0 && this.props.trainDialogs !== prevProps.trainDialogs) {
            this.updateTree()
        }
        if (this.treeContainerRef.current) {
            if (!this.state.translateX || (this.state.selectedNode !== prevState.selectedNode)) {
                if (this.state.selectedNode) {
                    this.setState({ translateX: NODE_WIDTH })
                }
                else {
                    const dimensions = this.treeContainerRef.current.getBoundingClientRect();
                    this.setState({
                        translateX: dimensions.width / 2.5,
                    })
                }
            }
        }
    }

    @autobind
    onNodeDetail(nodeId: string): void {
        const matches: TreeNode[] = this.state.treeElement.findNodesById(nodeId, this.state.treeElement.state.data, []);
        const expandedNode = matches[0];
        this.setState({ expandedNode: expandedNode || null })
    }

    @autobind
    onCloseExpando(): void {
        this.setState({ expandedNode: null })
    }

    @autobind
    onClickExpando(nodeId: string): void {
        const matches = this.state.treeElement.findNodesById(nodeId, this.state.treeElement.state.data, []);
        const targetNode = matches[0];
        targetNode._collapsed ? this.state.treeElement.expandNode(targetNode) : this.state.treeElement.collapseNode(targetNode);

        this.state.treeElement.setState({ data: this.state.treeElement.state.data, isTransitioning: false });

        setTimeout(
            () => this.state.treeElement.setState({ isTransitioning: false }),
            this.state.treeElement.props.transitionDuration as number + 10,
        );
        this.state.treeElement.internalState.targetNode = targetNode;
    }

    @autobind
    dismissBanner() {
        this.setState({ showBanner: false })
    }

    makeRoot(): TreeNode {
        return { name: "start", attributes: undefined, children: [], trainDialogIds: [], sourceLogDialogIds: [] }
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
        let tree: TreeNode | null = null
        if (this.props.trainDialogs.length > 0) {
            if (this.state.selectedNode && this.isSelectedNodeValid()) {
                let filter = this.state.selectedNode
                let selected = this.props.trainDialogs.filter(td => filter.trainDialogIds.includes(td.trainDialogId))
                let excluded = this.props.trainDialogs.filter(td => !filter.trainDialogIds.includes(td.trainDialogId))
                const trainDialogs = [...selected, ...excluded]
                tree = TreeUtils.MakeTree(trainDialogs, this.props.entities)
            }
            else {
                tree = TreeUtils.MakeTree(this.props.trainDialogs, this.props.entities)
            }
        }
        this.setState({ tree })
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
        else if (action.actionType === CLM.ActionTypes.DISPATCH) {
            const dispatchAction = new CLM.DispatchAction(action)
            return `Dispatch to Model: ${dispatchAction.modelName}`
        }
        else if (action.actionType === CLM.ActionTypes.CHANGE_MODEL) {
            const changeModelAction = new CLM.ChangeModelAction(action)
            return `Change to Model: ${changeModelAction.modelName}`
        }
        else {
            return "UNKNOWN ACTION TYPE"
        }

    }

    @autobind
    generateActionDescriptions(treeScorerStep: TreeScorerStep[]): void {
        treeScorerStep.forEach(tss => {
            let action = this.props.actions.find(a => a.actionId === tss.actionId)
            return action ? tss.description = this.simpleActionRenderer(action) : "- MISSING ACTION -"
        })
    }

    @autobind
    async openTrainDialog(selectedNode: TreeNode, trainDialogId: string): Promise<void> {
        if (trainDialogId) {
            this.setState({ expandedNode: null })
            const trainDialog = this.props.trainDialogs.find(t => t.trainDialogId === trainDialogId)
            if (trainDialog) {
                const roundIndex = selectedNode.roundIndex === undefined ? null : selectedNode.roundIndex
                const scoreIndex = selectedNode.scoreIndex === undefined ? null : selectedNode.scoreIndex
                this.props.openTrainDialog(trainDialog, roundIndex, scoreIndex)
            }
        }
    }

    @autobind
    async pinToNode(selectedNode: TreeNode, isSelected: boolean): Promise<void> {
        if (this.state.selectedNode && isSelected) {
            await Util.setStateAsync(this, { selectedNode: null })
        }
        else {
            await Util.setStateAsync(this, { selectedNode })
        }
        this.updateTree()
    }

    @autobind
    setTreeRef(treeElement: any): void {
        this.setState({ treeElement })
    }

    @autobind
    toggleFullScreen(): void {
        this.setState({ fullScreen: !this.state.fullScreen })
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
                    iconProps={this.state.fullScreen ? { iconName: "MiniContract" } : { iconName: "MiniExpand" }}
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
                            ref={this.treeContainerRef}
                        >
                            {this.state.tree && this.treeContainerRef.current &&
                                <Tree
                                    data={this.state.tree}
                                    ref={this.setTreeRef}
                                    orientation='vertical'
                                    allowForeignObjects={true}
                                    collapsible={false}
                                    nodeSize={{ x: NODE_WIDTH, y: NODE_HEIGHT + 2 }}
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
                                    separation={{ siblings: 1.2, nonSiblings: 1.2 }}
                                    translate={{ x: this.state.translateX || 50, y: 20 }}
                                    transitionDuration={0}
                                />
                            }
                        </div>
                    </div>
                    {this.state.expandedNode &&
                        <OF.Modal
                            isOpen={true}
                            containerClassName='cl-modal'
                        >
                            <div className="cl-treeview-expandedNode">
                                <TreeNodeExpanded
                                    nodeData={this.state.expandedNode}
                                    canEdit={false}
                                    selectedNode={this.state.selectedNode}
                                    generateActionDescriptions={this.generateActionDescriptions}
                                    onExpandoClick={() => { }}
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
                        </OF.Modal>
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
        actions: state.actions,
        entities: state.entities,
        teachSession: state.teachSession
    }
}

export interface ReceivedProps {
    open: boolean
    app: CLM.AppBase,
    trainDialogs: CLM.TrainDialog[]
    editingPackageId: string,
    editState: EditState,
    // Is it new, from a TrainDialog or LogDialog
    editType: EditDialogType,
    // When editing and existing log or train dialog
    sourceTrainDialog: CLM.TrainDialog | null
    // Train Dialog that this edit originally came from (not same as sourceTrainDialog)
    originalTrainDialogId: string | null
    onCancel: () => void
    openTrainDialog: (trainDialog: CLM.TrainDialog, roundIndex: number | null, scoreIndex: number | null) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>;
type dispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TreeView))