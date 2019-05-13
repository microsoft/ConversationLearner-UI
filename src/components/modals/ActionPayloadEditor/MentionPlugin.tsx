/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as immutable from 'immutable'
import { IPickerProps, NodeTypes } from './APEModels'
import { getNodesByPath, findNodeByPath } from './utilities'
import MentionNode from './MentionNode'
import './MentionPlugin.css'

export const defaultPickerProps: IPickerProps = {
    isVisible: false,
    bottom: -9999,
    left: -9999,
    top: -9999,
    searchText: ''
}

export interface IOptions {
    triggerCharacter: string
    closingCharacter: string
    onChangeMenuProps: (menuProps: Partial<IPickerProps>) => void
}

export const defaultOptions: IOptions = {
    triggerCharacter: '$',
    closingCharacter: ' ',
    onChangeMenuProps: () => { },
}

export default function mentionPlugin(inputOptions: Partial<IOptions> = {}) {
    const options: IOptions = { ...defaultOptions, ...inputOptions }

    return {
        onKeyDown(event: React.KeyboardEvent<HTMLInputElement>, change: any): boolean | void {
            // Check that the key pressed matches our `key` option.
            // console.log(`event.metaKey: `, event.metaKey)
            // console.log(`event.ctrlKey: `, event.ctrlKey)
            // console.log(`event.key: `, event.key)
            const isWithinMentionNode = change.value.inlines.size > 0 && change.value.inlines.last().type === NodeTypes.Mention
            if (!isWithinMentionNode && event.key === options.triggerCharacter) {
                event.preventDefault()
                change
                    .insertInline({
                        type: NodeTypes.Mention,
                        data: {
                            completed: false
                        },
                        nodes: [
                            {
                                kind: 'text',
                                leaves: [
                                    {
                                        text: options.triggerCharacter
                                    }
                                ]
                            }
                        ]
                    })

                options.onChangeMenuProps({
                    isVisible: true
                })

                return true
            }

            if (isWithinMentionNode) {
                const lastInlineNode = change.value.inlines.last()
                const isNodeCompleted = lastInlineNode.data.get('completed')
                if (!isNodeCompleted && event.key === options.closingCharacter) {
                    event.preventDefault()

                    change
                        .removeNodeByKey(lastInlineNode.key)
                        .insertText(lastInlineNode.text)
                        .collapseToStartOfNextText()
                        .insertText(options.closingCharacter)

                    options.onChangeMenuProps({
                        isVisible: false
                    })

                    return true
                }
            }
        },

        onChange(change: any) {
            const { value, operations } = change

            const removeTextOperations: immutable.List<immutable.Map<any, any>> = operations
                .filter((o: any) => o.type === 'remove_text')

            if (removeTextOperations.size > 0) {
                const selection = change.value.selection
                const { startKey, startOffset } = selection

                // TODO: Generalize between previousSibling method, and node paths method
                const previousSibling = value.document.getPreviousSibling(startKey)
                if (previousSibling && previousSibling.type === NodeTypes.Optional) {
                    if (startOffset === 0) {
                        const removeTextOperation = removeTextOperations.first()
                        const nodes = getNodesByPath(removeTextOperation.toJS().path, value.document)
                        if (nodes.length > 2 && nodes[nodes.length - 2].type === NodeTypes.Optional) {
                            change = change
                                .collapseToEndOfPreviousText()
                        }
                    }
                }

                const paths: number[][] = removeTextOperations.map<number[]>(o => (o! as any).path).toJS()

                const mentionInlineNodesAlongPath: any[] = paths
                    .map(path => findNodeByPath(path, value.document))
                    .filter(n => n)

                // Remove all inline nodes along path that are completed
                mentionInlineNodesAlongPath.reduce((newChange: any, inlineNode: any) => {
                    return inlineNode.data.get('completed')
                        ? newChange
                            .removeNodeByKey(inlineNode.key)
                        : newChange
                }, change)

                // if (mentionInlineNodesAlongPath.length > 0) {
                //     options.onChangeMenuProps({
                //         isVisible: false
                //     })
                // }
            }
        },

        renderNode(props: any): React.ReactNode | void {
            switch (props.node.type) {
                case NodeTypes.Mention: return <MentionNode {...props} />
                default: return
            }
        }
    }
}