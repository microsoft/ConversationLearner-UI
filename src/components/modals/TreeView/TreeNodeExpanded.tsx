/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import AddButtonInput from '../AddButtonInput'
import AddScoreButton from '../AddButtonScore'
import './TreeView.css';
import { EditDialogType } from '../';
import { TreeNode, TreeScorerStep, TreeUserInput } from './TreeNodeLabel'

interface TreeNodeReceivedProps {
    nodeData?: any
    canEdit: boolean
    selectedNode: TreeNode | null
    generateActionDescriptions: (treeScorerSteps: TreeScorerStep[]) => void
    onDetailClick?: (nodeId: string) => void
    onPinClick?: (treeNode: TreeNode, isSelected: boolean) => void
    onExpandoClick: (nodeId: string) => void
    onOpenTrainDialog: (treeNode: TreeNode, trainDialogId: string) => void 
}

export class TreeNodeExpanded extends React.PureComponent<TreeNodeReceivedProps>  {

    isSelected(): boolean {
        if (this.props.selectedNode)  {
            if (this.props.selectedNode.roundIndex === this.props.nodeData.roundIndex) {
                if (this.props.selectedNode.trainDialogIds.includes(this.props.nodeData.trainDialogIds[0])) {
                    return true
                }
            }
        }
        return false
    }

    @OF.autobind
    onClickDetail(nodeId: string): void {
        if (this.props.onDetailClick) {
            this.props.onDetailClick(nodeId)
        }
    }

    @OF.autobind
    onClickPin(nodeData: TreeNode): void {
        if (this.props.onPinClick) {
            this.props.onPinClick(nodeData, this.isSelected())
        }
    }

    render() {
        const nodeData: TreeNode = this.props.nodeData
        if (nodeData.depth === 0) {
            return null
        }   
        // Show count of input
        let userInputs: TreeUserInput[] = []
        if (nodeData.userInput) {
            const orgInput = nodeData.userInput
            const distinctUserInput = orgInput.filter((item, pos) => orgInput.findIndex(i => item.content === i.content) === pos)
            userInputs = distinctUserInput.map(dui => {
                const count = orgInput.filter(ui => ui.content === dui.content).length
                // TOOD: need way for user to select which one.  Currenlty selects last train Dialog
                return {
                    content: count === 1 ? dui.content : `${dui.content} (${count})`,
                    trainDialogId: dui.trainDialogId
                }
            })
        }
        const isNodeelected = this.isSelected()
        let scorerSteps = nodeData.scorerSteps || []
        let userInputMore = false
        let scorerStepMore = false

        this.props.generateActionDescriptions(scorerSteps)

        return (
            <div>
                <div 
                    className={`cl-treeview-userBox${isNodeelected ? ` cl-treeview-botBoxSelected` : ''}`}
                >
                    {userInputs && userInputs.map((input, index) =>
                        <div
                            key={`${nodeData.id}${index}`}
                            className="cl-treeview-userInput"
                            role="button"
                            onClick={() => this.props.onOpenTrainDialog(this.props.nodeData, input.trainDialogId)}
                        >
                            {input.content}
                        </div>
                    )}
                    {userInputMore &&
                    <OF.IconButton 
                        className="cl-treeview-footerButton"
                        iconProps={{ iconName: 'More' }}
                        onClick={() => this.onClickDetail(nodeData.id!)}
                        ariaDescription="View More"
                    />}
                </div>
                <div className="cl-treeview-scorerBox">
                    {scorerSteps.map((s, index) => 
                            <div
                                key={`${nodeData.id}${index}SH`} 
                            >
                                <div 
                                    className="cl-treeview-memoryBox"
                                >
                                    {`(${s.memory.length}) ${s.memory.join(', ') || '-'}`}
                                </div>
                                <div
                                    key={`${nodeData.id}${index}SS`} 
                                    className="cl-treeview-scorerStep"
                                >
                                    {s.description}
                                </div>
                            </div>
                    )}
                    {scorerStepMore && 
                        <OF.IconButton 
                            className="cl-treeview-footerButton cl-treeview-moreButton-scorer"
                            iconProps={{ iconName: 'More' }}
                            onClick={() => this.onClickDetail(nodeData.id!)}
                            ariaDescription="View More"
                        />}
                </div>
                {this.props.canEdit &&
                    <div className="cl-treeview-buttonblock">
                        {nodeData._children && 
                            <OF.IconButton
                                className={nodeData._collapsed ? `` : `cl-treeview-flip`}
                                iconProps={{ iconName: 'DrillExpand' }}
                                onClick={() => this.onClickDetail(nodeData.id!)}
                                ariaDescription="Delete Turn"
                            />
                        }
                        <AddButtonInput
                            className={'cl-treeview-treeViewButton cl-treeview-treeViewButtonPadded'}
                            onClick={() => {}}
                            editType={EditDialogType.TRAIN_ORIGINAL}
                        />
                        <OF.IconButton
                            disabled={true}
                            className={`cl-treeview-treeViewButton`}
                            iconProps={{ iconName: 'BranchMerge' }}
                            onClick={() => {}}
                        />
                        <AddScoreButton
                            className={'cl-treeview-treeViewButton cl-treeview-treeViewButtonPadded'}
                            // Don't select an activity if on last step
                            onClick={() => {}}
                        />
                        <OF.IconButton
                            className={`cl-treeview-treeViewButton`}
                            iconProps={{ iconName: 'Delete' }}
                            onClick={() => {}}
                            ariaDescription="Delete Turn"
                        />
                    </div>
                }
                {!nodeData.children && 
                    <div
                        key={`${nodeData.id}END`}
                        className="cl-treeview-endConversation"
                    />
                }
                <div className='cl-treeview-memory'>
                    {nodeData.attributes && Object.keys(nodeData.attributes).join(', ')}
                </div>
            </div>
        )
    }
}
