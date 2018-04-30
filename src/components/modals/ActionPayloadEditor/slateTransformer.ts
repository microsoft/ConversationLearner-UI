/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { NodeTypes, IOption } from './models'

function updateOptionNames(value: any, options: IOption[]) {
    // Clone to ensure non-destructive operation
    const valueClone = JSON.parse(JSON.stringify(value))
    updateNodeOptionNames(valueClone.document, options)
    return valueClone
}

function updateNodeOptionNames(node: any, options: IOption[], newName?: string) {
    if (node.kind === 'document') {
        node.nodes.forEach((n: any) => updateNodeOptionNames(n, options))
        return node
    } else if (node.kind === 'block') {
        node.nodes.forEach((n: any) => updateNodeOptionNames(n, options))
        return node
    } else if (node.kind === 'inline' && node.type === NodeTypes.Mention) {
        const data = node.data
        if (!data.completed) {
            return node
        }

        const option = data.option
        if (!option) {
            throw new Error(`Attempting to update option name on inline node but it did not have option`)
        }

        const matchingOption = options.find(o => o.id === option.id)
        if (!matchingOption) {
            throw new Error(`Attempting to update optoin name on inline node, but could not find option with id: ${option.id}(${option.name}) in given list of options`)
        }

        // 1. Update option name
        option.name = matchingOption.name

        // 2. Update 
        node.nodes.map((n: any) => updateNodeOptionNames(n, options, matchingOption.name))
        return node
    } else if (node.kind === 'text') {
        // If we have newName defined we are likely on text node within inline node and should update leaf text
        // Otherwise return node unmodified
        if (typeof newName === 'string') {
            node.leaves.forEach((n: any) => n.text = `$${newName}`)
        }
        
        return node
    } else {
        node.nodes.map((n: any) => updateNodeOptionNames(n, options))
        return node
    }
}

export default {
    updateOptionNames
}