/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import AddButtonInput from './AddButtonInput'
import AddScoreButton from './AddButtonScore'
import './TreeView.css';
import { EditDialogType } from '.';

export interface TreeScorerStep {
    memory: string[]
    actionId?: string
    description?: string
}

export interface TreeUserInput {
    content: string
    trainDialogId: string
}

export interface TreeNode {
    name: string
    userInput?: TreeUserInput[]
    attributes: { [key: string]: string; } | undefined
    trainDialogIds: string[]
    roundIndex?: number
    scoreIndex?: number
    scorerSteps?: TreeScorerStep[]
    roundMemory?: string[]
    children: TreeNode[]
    nodeSvgShape?: any
    actionId?: string
    nodeLabelComponent?: any
    allowForeignObjects?: boolean

    // Properties added by library
    _children?: any
    _collapsed?: any
    depth?: number
    id?: string
}

interface TreeNodeReceivedProps {
    nodeData?: any
    expanded?: boolean
    canEdit: boolean
    selectedNode: TreeNode | null
    generateActionDescriptions: (treeScorerSteps: TreeScorerStep[]) => void
    onDetailClick?: (nodeId: string) => void
    onPinClick?: (treeNode: TreeNode) => void
    onExpandoClick: (nodeId: string) => void
    onOpenTrainDialog: (treeNode: TreeNode, trainDialogId: string) => void 
}

const MAX_LINES = 6

export class TreeNodeLabel extends React.PureComponent<TreeNodeReceivedProps>  {

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
            this.props.onPinClick(nodeData)
        }
    }

    render() {
        const nodeData: TreeNode = this.props.nodeData
        if (nodeData.depth === 0) {
            return null
        }
        if (nodeData.actionId) {
            return (
                <div>
                    <div 
                        className={`botBox${this.isSelected() ? ` botBoxSelected` : ''}`}
                    >
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
            // Show count of input
            let userInput: TreeUserInput[] = []
            if (nodeData.userInput) {
                const orgInput = nodeData.userInput
                const distinctUserInput = orgInput.filter((item, pos) => orgInput.findIndex(i => item.content === i.content) === pos)
                userInput = distinctUserInput.map(dui => {
                    const count = orgInput.filter(ui => ui.content === dui.content).length
                    // TOOD: need way for user to select which one.  Currenlty selects last train Dialog
                    return {
                        content: count === 1 ? dui.content : `${dui.content} (${count})`,
                        trainDialogId: dui.trainDialogId
                    }
                })
            }
            let scorerSteps = nodeData.scorerSteps || []
            let userInputMore = false
            let scorerStepMore = false

            // Do we need to show partial data?
            if (!this.props.expanded) {
                let totalLines = userInput.length + (scorerSteps.length * 2)
                if (totalLines > MAX_LINES) {
                    // Show as many scorer steps as possible but leave space for one extractor step or two if need ellipses
                    const max_scorer_lines = MAX_LINES - 1
                    const num_scorer_lines = Math.min(scorerSteps.length, max_scorer_lines / 2)
                    const max_input_lines = MAX_LINES - (num_scorer_lines * 2)
                    const num_input_lines = Math.min(userInput.length, max_input_lines)

                    if (num_input_lines < userInput.length) {
                        // TOOD: need way for user to select which one.  Currenlty selects last train Dialog
                        userInput = userInput.slice(0, num_input_lines)
                        userInputMore = true
                    }
                    if (num_scorer_lines < scorerSteps.length) {
                        // TOOD: need way for user to select which one.  Currenlty selects last train Dialog
                        scorerSteps = scorerSteps.slice(0, num_scorer_lines)
                        scorerStepMore = true
                    }
                }
            }
            this.props.generateActionDescriptions(scorerSteps)

            return (
                <div>
                    <div 
                        className={`userBox${this.isSelected() ? ` botBoxSelected` : ''}`}
                    >
                        {userInput && userInput.map((input, index) =>
                            <div
                                key={`${nodeData.id}${index}`}
                                className={`userInput${this.props.expanded ? '' : ' ellipse'}`}
                                role="button"
                                onClick={() => this.props.onOpenTrainDialog(this.props.nodeData, input.trainDialogId)}
                            >
                                {input.content}
                            </div>
                        )}
                        {userInputMore &&
                        <OF.IconButton 
                            className="footerButton"
                            iconProps={{ iconName: 'More' }}
                            onClick={() => this.onClickDetail(nodeData.id!)}
                            ariaDescription="View More"
                        />}
                    </div>
                    <div className="scorerBox">
                        {scorerSteps.map((s, index) => 
                                <div
                                    key={`${nodeData.id}${index}SH`} 
                                >
                                    <div 
                                        className={`memoryBox${this.props.expanded ? '' : ' ellipse'}`}
                                    >
                                        {`(${s.memory.length}) ${s.memory.join(', ') || '-'}`}
                                    </div>
                                    <div
                                        key={`${nodeData.id}${index}SS`} 
                                        className={`scorerStep${this.props.expanded ? '' : ' ellipse'}`}
                                    >
                                        {s.description}
                                    </div>
                                </div>
                        )}
                        {scorerStepMore && 
                            <OF.IconButton 
                                className="footerButton moreButton-scorer"
                                iconProps={{ iconName: 'More' }}
                                onClick={() => this.onClickDetail(nodeData.id!)}
                                ariaDescription="View More"
                            />}
                    </div>
                    {!this.props.expanded &&
                        <div>
                            <OF.IconButton 
                                className="footerButton footerButton-pin"
                                iconProps={{ iconName: 'Pin' }}
                                onClick={() => this.onClickPin(nodeData)}
                                ariaDescription="Pin Node"
                            />
                            <OF.IconButton 
                                className="footerButton moreButton-bottom"
                                iconProps={{ iconName: 'More' }}
                                onClick={() => this.onClickDetail(nodeData.id!)}
                                ariaDescription="View More"
                            />
                        </div>
                    }
                    {this.props.canEdit &&
                        <div className="buttonblock">
                            {nodeData._children && 
                                <OF.IconButton
                                    className={nodeData._collapsed ? `` : `flip`}
                                    iconProps={{ iconName: 'DrillExpand' }}
                                    onClick={() => this.onClickDetail(nodeData.id!)}
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
                    }
                    {!nodeData.children && 
                        <div
                            key={`${nodeData.id}END`}
                            className="endConversation"
                        />
                    }
                    <div className='memory'>
                        {nodeData.attributes && Object.keys(nodeData.attributes).join(', ')}
                    </div>
                </div>
            )
        }
    }
}
