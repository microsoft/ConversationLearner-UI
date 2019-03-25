/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import './TreeView.css';

export interface TreeScorerStep {
    memory: string[]
    actionId?: string
    description?: string
}

export interface TreeUserInput {
    content: string
    trainDialogId: string
}

// From react-d3-tree library
interface ReactD3TreeItem {
    _children?: any
    _collapsed?: any
    depth?: number
    id?: string
}

export interface TreeNode extends ReactD3TreeItem {
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
    nodeLabelComponent?: any
    allowForeignObjects?: boolean
}

interface TreeNodeReceivedProps {
    nodeData?: TreeNode
    selectedNode: TreeNode | null
    generateActionDescriptions: (treeScorerSteps: TreeScorerStep[]) => void
    onDetailClick?: (nodeId: string) => void
    onPinClick?: (treeNode: TreeNode, isSelected: boolean) => void
    onExpandoClick: (nodeId: string) => void
    onOpenTrainDialog: (treeNode: TreeNode, trainDialogId: string) => void 
}

const MAX_LINES = 7

export class TreeNodeLabel extends React.PureComponent<TreeNodeReceivedProps>  {

    isSelected(): boolean {
        if (this.props.selectedNode && this.props.nodeData)  {
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
        const isNodeelected = this.isSelected()
        let scorerSteps = treeNode.scorerSteps || []
        let userInputMore = false
        let scorerStepMore = false

        // Do we need to show partial data?
        let totalLines = userInputs.length + (scorerSteps.length * 2)
        if (totalLines > MAX_LINES) {
            // Show as many scorer steps as possible but leave space for one extractor step or two if need ellipses
            const max_scorer_lines = MAX_LINES - 1
            const num_scorer_lines = Math.min(scorerSteps.length, max_scorer_lines / 2)
            const max_input_lines = MAX_LINES - (num_scorer_lines * 2)
            const num_input_lines = Math.min(userInputs.length, max_input_lines)

            if (num_input_lines < userInputs.length) {
                userInputs = userInputs.slice(0, num_input_lines)
                userInputMore = true
            }
            if (num_scorer_lines < scorerSteps.length) {
                scorerSteps = scorerSteps.slice(0, num_scorer_lines)
                scorerStepMore = true
            }
            }

        this.props.generateActionDescriptions(scorerSteps)

        return (
            <div>
                <div 
                    className={`cl-treeview-userBox${isNodeelected ? ` cl-treeview-botBoxSelected` : ''}`}
                >
                    {userInputs && userInputs.map((input, index) =>
                        <div
                            key={`${treeNode.id}${index}`}
                            className="cl-treeview-userInput cl-treeview-ellipse"
                            role="button"
                            onClick={() => this.props.onOpenTrainDialog(treeNode, input.trainDialogId)}
                        >
                            {input.content}
                        </div>
                    )}
                    {userInputMore &&
                    <OF.IconButton 
                        className="cl-treeview-footerButton"
                        iconProps={{ iconName: 'More' }}
                        onClick={() => this.onClickDetail(treeNode.id!)}
                        ariaDescription="View More"
                    />}
                </div>
                <div className="cl-treeview-scorerBox">
                    {scorerSteps.map((s, index) => 
                            <div
                                key={`${treeNode.id}${index}SH`} 
                            >
                                <div 
                                    className="cl-treeview-memoryBox cl-treeview-ellipse"
                                >
                                    {`(${s.memory.length}) ${s.memory.join(', ') || '-'}`}
                                </div>
                                <div
                                    key={`${treeNode.id}${index}SS`} 
                                    className="cl-treeview-scorerStep cl-treeview-ellipse"
                                >
                                    {s.description}
                                </div>
                            </div>
                    )}
                    {scorerStepMore && 
                        <OF.IconButton 
                            className="cl-treeview-footerButton cl-treeview-moreButton-scorer"
                            iconProps={{ iconName: 'More' }}
                            onClick={() => this.onClickDetail(treeNode.id!)}
                            ariaDescription="View More"
                        />}
                </div>
                    <OF.IconButton 
                        className="cl-treeview-footerButton cl-treeview-cl-treeview-footerButton-pin"
                        iconProps={{ iconName: isNodeelected ? 'PinnedFill' : 'Pin' }}
                        onClick={() => this.onClickPin(treeNode)}
                        ariaDescription="Pin Node"
                    />
                    <OF.IconButton 
                        className="cl-treeview-footerButton cl-treeview-moreButton-bottom"
                        iconProps={{ iconName: 'More' }}
                        onClick={() => this.onClickDetail(treeNode.id!)}
                        ariaDescription="View More"
                    />
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
