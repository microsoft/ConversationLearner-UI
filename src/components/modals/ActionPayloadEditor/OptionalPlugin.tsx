/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { NodeTypes } from './APEModels'
import OptionalNode from './OptionalNode'

export interface IOptions {
    openingCharacter: string
    closingCharacter: string
}

const defaultOptions: IOptions = {
    openingCharacter: '[',
    closingCharacter: ']'
}

export default function optionalPlugin(inputOptions: Partial<IOptions> = {}) {
    let options: IOptions = { ...defaultOptions, ...inputOptions }

    return {
        onKeyDown(event: React.KeyboardEvent<HTMLInputElement>, change: any): boolean | void {
            const isWithinOptionalNode = change.value.inlines.size > 0 && change.value.inlines.last().type === NodeTypes.Optional
            
            if (!isWithinOptionalNode && event.key === options.openingCharacter) {
                event.preventDefault()
                change
                    .insertInline({
                        type: NodeTypes.Optional,
                        data: {},
                        nodes: [
                            {
                                kind: 'text',
                                leaves: [
                                    {
                                        text: options.openingCharacter
                                    }
                                ]
                            }
                        ]
                    })

                return true
            }

            if (event.key === options.closingCharacter) {
                if (isWithinOptionalNode) {
                    event.preventDefault()
                    
                    change
                    .insertText(options.closingCharacter)
                    .collapseToStartOfNextText()
                    
                    return true
                }
                else {
                    const value = change.value
                    const previousSibling = value.document.getPreviousSibling(value.selection.startKey)

                    if (previousSibling.type !== NodeTypes.Optional) {
                        return
                    }

                    const currentNode = value.document.getDescendant(value.selection.startKey)
                    if (!currentNode) {
                        return
                    }

                    const lastTextOfPreviousOptionalNode = previousSibling.getLastText()
                    if (!lastTextOfPreviousOptionalNode) {
                        return    
                    }

                    event.preventDefault()
                    
                    // Intention is to extend the optional node to the end of current text
                    // 1. Remove all text from current node
                    // 2. If optional node already ends in closing character remove it
                    // 3. Put text inside the last text node of the optional node
                    const lastCharacter = lastTextOfPreviousOptionalNode.text[lastTextOfPreviousOptionalNode.text.length - 1]
                    const insertOffset = lastCharacter === options.closingCharacter
                        ? lastTextOfPreviousOptionalNode.text.length - 1
                        : lastTextOfPreviousOptionalNode.text.length

                    change
                        .removeTextByKey(currentNode.key, 0, currentNode.text.length)

                    if (lastCharacter === options.closingCharacter) {
                        change
                            .removeTextByKey(lastTextOfPreviousOptionalNode.key, insertOffset, 1)
                    }

                    change
                        .insertTextByKey(lastTextOfPreviousOptionalNode.key, insertOffset, `${currentNode.text}${options.closingCharacter}`)

                    return true
                }
            }
        },

        renderNode(props: any): React.ReactNode | void {
            switch (props.node.type) {
                case NodeTypes.Optional: return <OptionalNode {...props} />
            }
        }
    }
}