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
    nodeData?: TreeNode
    canEdit: boolean
    selectedNode: TreeNode | null
    generateActionDescriptions: (treeScorerSteps: TreeScorerStep[]) => void
    onExpandoClick: (nodeId: string) => void
    onOpenTrainDialog: (treeNode: TreeNode, trainDialogId: string) => void 
}

export class TreeNodeExpanded extends React.PureComponent<TreeNodeReceivedProps>  {

    render() {
        const treeNode = this.props.nodeData
        if (!treeNode || treeNode.depth === 0) {
            return null
        }   
        // Show count of input
        let userInputs: TreeUserInput[] = []
        if (treeNode.userInput) {
            const orgInput = treeNode.userInput
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

        let scorerSteps = treeNode.scorerSteps || []
        this.props.generateActionDescriptions(scorerSteps)

        return (
            <div>
                <div 
                    className="cl-treeview-userBox"
                >
                    {userInputs && userInputs.map((input, index) =>
                        <div
                            key={`${treeNode.id}${index}`}
                            className="cl-treeview-userInput"
                            role="button"
                            onClick={() => this.props.onOpenTrainDialog(treeNode, input.trainDialogId)}
                        >
                            {input.content}
                        </div>
                    )}
                </div>
                <div className="cl-treeview-scorerBox">
                    {scorerSteps.map((s, index) => 
                            <div
                                key={`${treeNode.id}${index}SH`} 
                            >
                                <div 
                                    className="cl-treeview-memoryBox"
                                >
                                    {`(${s.memory.length}) ${s.memory.join(', ') || '-'}`}
                                </div>
                                <div
                                    key={`${treeNode.id}${index}SS`} 
                                    className="cl-treeview-scorerStep"
                                >
                                    {s.description}
                                </div>
                            </div>
                    )}
                </div>
                {this.props.canEdit &&
                    <div className="cl-treeview-buttonblock">
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
                {!treeNode.children && 
                    <div
                        key={`${treeNode.id}END`}
                        className="cl-treeview-endConversation"
                    />
                }
                <div className='cl-treeview-memory'>
                    {treeNode.attributes && Object.keys(treeNode.attributes).join(', ')}
                </div>
            </div>
        )
    }
}
