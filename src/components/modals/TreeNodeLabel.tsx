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

export interface TreeNode {
    name: string
    userInput?: string[]
    attributes: { [key: string]: string; } | undefined
    trainDialogIds: string[]
    roundIndex?: number
    scoreIndex?: number
    children: TreeNode[]
    nodeSvgShape?: any
    actionId?: string
    nodeLabelComponent?: any
    allowForeignObjects?: boolean
    _children?: any
    _collapsed?: any
    id?: string
}

interface TreeNodeReceivedProps {
    nodeData?: any
    onExpandoClick: (nodeId: string) => void
    onOpenTrainDialog: (treeNode: TreeNode) => void 
}

export class TreeNodeLabel extends React.PureComponent<TreeNodeReceivedProps>  {

    render() {
        const nodeData: TreeNode = this.props.nodeData
        if (nodeData.actionId) {
            return (
                <div>
                    <div 
                        className="botBox"
                        role="button"
                        onClick={() => this.props.onOpenTrainDialog(this.props.nodeData)}
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
            return (
                <div>
                    <div 
                        className="userBox"
                        role="button"
                        onClick={() => this.props.onOpenTrainDialog(this.props.nodeData)}
                    >
                        {nodeData.userInput && nodeData.userInput.map((input, index) =>
                            <div
                                key={`${nodeData.id}${index}`}
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
