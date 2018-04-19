/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { NodeTypes } from './models'
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

            if (isWithinOptionalNode && event.key === options.closingCharacter) {
                event.preventDefault()

                change
                    .insertText(options.closingCharacter)
                    .collapseToStartOfNextText()

                return true
            }
        },

        renderNode(props: any): React.ReactNode | void {
            switch (props.node.type) {
                case NodeTypes.Optional: return <OptionalNode {...props} />
            }
        }
    }
}