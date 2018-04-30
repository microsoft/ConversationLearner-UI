/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { NodeTypes } from "./models";

// Based on: https://github.com/ianstormtaylor/slate/blob/master/packages/slate-plain-serializer/src/index.js

function serialize(value: any, entityValuesMap: Map<string, string>, fallbackToOriginal: boolean = false): string {
    const valueAsJson = typeof value.toJSON === 'function' ? value.toJSON() : value
    const processedDocument = removeOptionalNodesWithoutEntityValues(valueAsJson.document, Array.from(entityValuesMap.keys()))
    return serializeNode(processedDocument, entityValuesMap, fallbackToOriginal)
}

/**
 * Given node return filter out optional nodes without matching values provided
 * 
 * E.g. You are welcome[, $name] -> You are welcome
 * @param node Slate Node
 * @param entityValues Key Value pair of entity id to entity display value
 */
function removeOptionalNodesWithoutEntityValues(node: any, entityIds: string[]): any | undefined {
    if (node.kind === 'inline' && node.type === NodeTypes.Optional) {
        const entityIdsWithinOptionalNode = getEntityIds(node)
        const hasValues = entityIdsWithinOptionalNode.every(x => entityIds.includes(x))
        return hasValues ? node : undefined
    }

    if (Array.isArray(node.nodes)) {
        node.nodes = node.nodes
            .map((n: any) => removeOptionalNodesWithoutEntityValues(n, entityIds))
            .filter((n: any) => n)
    }

    return node
}

function getEntityIds(node: any): string[] {
    const entityIds: string[] = []

    // If current node is inline node which we know to have entityId then save it in the list
    if (node.kind === 'inline' && node.type === NodeTypes.Mention) {
        // This check is required becuase when input is Slate Value node is Immutable.Map object
        // but it could also be a node from value.toJSON()
        const data = typeof node.data.toJS === 'function'
            ? node.data.toJS()
            : node.data
        const option = data.option

        if (!option) {
            throw new Error(`Attempting to serialize inline node but it did not have option`)
        }

        const entityId = option.id
        entityIds.push(entityId)
    }

    // Technically this would never get called because inline nodes shouldn't have other children which are inline nodes
    // however, it's good to have working depth-first-traversal anyways
    if (Array.isArray(node.nodes)) {
        const childrenEntityIds: string[] = node.nodes
            .map((n: any) => getEntityIds(n))
            .reduce((totalIds: string[], nodeIds: string[]) => [...totalIds, ...nodeIds], [])

        entityIds.push(...childrenEntityIds)
    }

    return entityIds
}

function serializeNode(node: any, entityValues: Map<string, string>, fallbackToOriginal: boolean): string {
    if (node.kind === 'text') {
        return node.leaves.map((n: any) => n.text).join('')
    }

    const serializedChildNodes = node.nodes.map((n: any) => serializeNode(n, entityValues, fallbackToOriginal))
    
    if (node.kind === 'inline' && node.type === NodeTypes.Mention) {
        // This check is required becuase when input is Slate Value node is Immutable.Map object
        // but it could also be a node from value.toJSON()
        const data = typeof node.data.toJS === 'function'
            ? node.data.toJS()
            : node.data

        if (!data.completed) {
            return serializedChildNodes.join('')
        }

        const option = data.option

        if (!option) {
            throw new Error(`Attempting to serialize inline node but it did not have option`)
        }

        const entityId = option.id
        const mapContainsEntity = entityValues.has(entityId)
        if (!mapContainsEntity) {
            if (fallbackToOriginal) {
                return serializedChildNodes.join('')
            }

            const entityValuesString = Array.from(entityValues.entries())
                .map(([id, value]) => `${id}: ${value}`)
                .join(', ')
            throw new Error(
                `Inline node representing entity ${entityId} was NOT provided a value in the given entityValue map: [${entityValuesString}]`
            )
        }

        return entityValues.get(entityId)!
    }

    if (node.kind === 'document') {
        return serializedChildNodes.join('\n')
    }

    const serializedChildren = serializedChildNodes.join('')

    return (node.kind === 'inline' && node.type === NodeTypes.Optional)
        ? serializedChildren.slice(1, -1)
        : serializedChildren
}

export default {
    serialize
}