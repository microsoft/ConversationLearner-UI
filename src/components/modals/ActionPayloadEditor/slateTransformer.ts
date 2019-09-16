/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { NodeTypes, IOption } from './APEModels'
import * as Util from '../../../Utils/util'

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
            throw new Error(`Attempting to update option name on inline node, but could not find option with id: ${option.id}(${option.name}) in given list of options`)
        }

        // 1. Update option name
        option.name = matchingOption.name

        // 2. Update child text nodes which also contain entity name
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

function replaceEntityNodesWithValues(node: any, entityValuesMap: Record<string, Util.EntityMapEntry>, replacerFn: (entityEntry: Util.EntityMapEntry) => string, entitiesRequired: boolean = true): any {
    // Function operates on nodes, if top level value, start with document
    if (node.kind === "value") {
        const document = replaceEntityNodesWithValues(node.document, entityValuesMap, replacerFn)
        node.document = document
        return node
    }

    if (node.kind === 'inline' && node.type === NodeTypes.Optional) {
        console.log(`Traverse optional node: `, { node })
    }

    if (node.kind === 'inline' && node.type === NodeTypes.Mention) {
        // This check is required because when input is Slate Value node is Immutable.Map object
        // but it could also be a node from value.toJSON()
        const data = typeof node.data.toJS === 'function'
            ? node.data.toJS()
            : node.data
        const option = data.option

        if (!option) {
            throw new Error(`Attempting to get inline node option, but node did not have option`)
        }

        const entityId = option.id
        const entityEntry = entityValuesMap[entityId]

        // If entity value exists, replace children with text node of value
        // If entity value does NOT exist, set data to missing
        if (entityEntry) {
            const text = replacerFn(entityEntry)
            const textNode = {
                "kind": "text",
                "leaves": [
                    {
                        "kind": "leaf",
                        "text": text,
                        "marks": []
                    }
                ]
            }

            node.nodes = [
                textNode
            ]

            // If entity does not have value, mark as missing
            if (typeof entityEntry.value === "undefined") {
                node.data = {
                    ...data,
                    entityMissing: true
                }
            }
        }
    }

    if (Array.isArray(node.nodes)) {
        node.nodes = node.nodes
            .map((n: any) => replaceEntityNodesWithValues(n, entityValuesMap, replacerFn))
            .filter((n: any) => n)
    }

    return node
}

export default {
    updateOptionNames,
    replaceEntityNodesWithValues,
}