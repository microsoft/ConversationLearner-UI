/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IOption, NodeTypes } from "./APEModels"
import { TextVariation, EntityBase, LabeledEntity } from '@conversationlearner/models'
import { convertEntitiesAndTextToEditorValue } from '../../ExtractorResponseEditor/utilities'
import { IGenericEntity, IGenericEntityData } from "../../ExtractorResponseEditor/models"

/**
 * Recursively walk up DOM tree until root or parent with non-static position is found.
 * (relative, fixed, or absolute) which will be used as reference for absolutely positioned elements within it
 */
export const getRelativeParent = (element: HTMLElement | null): HTMLElement => {
    if (!element) {
        return document.body
    }

    const position = window.getComputedStyle(element).getPropertyValue('position')
    if (position !== 'static') {
        return element
    }

    return getRelativeParent(element.parentElement)
};

export const valueToJSON = (value: any) => {
    const characters = value.characters ? value.characters.toJSON() : [];
    return {
        data: value.data.toJSON(),
        decorations: value.decorations ? value.decorations.toJSON() : [],
        document: value.toJSON().document,
        activeMarks: value.activeMarks.toJSON(),
        marks: value.marks.toJSON(),
        texts: value.texts.toJSON(),
        characters,
        selectedText: characters.reduce((s: string, node: any) => s + node.text, ''),
        selection: value.selection.toJSON()
    }
}

export const findNodeByPath = (path: number[], root: any, nodeType: string = NodeTypes.Mention): any => {
    if (path.length === 0) {
        return null
    }

    const [nextKey, ...nextPath] = path

    const nextRoot = root.findDescendant((node: any, i: number) => i === nextKey)
    // If the node was already removed due to another change it might not exist in the path anymore
    if (nextRoot === null) {
        return null
    }

    if (nextRoot.type === nodeType) {
        return nextRoot
    }

    return findNodeByPath(nextPath, nextRoot)
}

export const getNodesByPath = (path: number[], root: any, nodes: any[] = []): any[] => {
    if (path.length === 0) {
        return nodes
    }

    const [nextKey, ...nextPath] = path
    const nextRoot = root.findDescendant((node: any, i: number) => i === nextKey)

    // If the node was already removed due to another change it might not exist in the path anymore
    if (nextRoot === null) {
        return nodes
    }

    nodes.push(nextRoot)

    return getNodesByPath(nextPath, nextRoot, nodes)
}

interface INode {
    kind: string
    type: string
    nodes: INode[] | undefined
    data: any
}

/**
 * This a normal tree DFS with change that it only returns nodes that satisfy the predicate and also it will skip nodes that are excluded
 * In practice this means return all inline nodes and skip optional nodes effectively returning list of inline nodes that are not within and optional node.
 */
const depthFirstSearch = (root: INode, predicate: (n: INode) => boolean, exclude: (n: INode) => boolean, nodes: INode[] = []): INode[] => {
    if (predicate(root)) {
        nodes.push(root)
    }

    const childNodes = !Array.isArray(root.nodes)
        ? []
        : root.nodes
            .filter(n => !exclude(n))
            .map(n => depthFirstSearch(n, predicate, exclude))
            .reduce((a, b) => [...a, ...b], [])

    return [...nodes, ...childNodes]
}

export const getNonOptionalEntitiesFromValue = (value: any): IOption[] => {
    const tree = value.toJSON().document

    return depthFirstSearch(tree, n => n.type === NodeTypes.Mention && n.data.completed === true, n => n.type === NodeTypes.Optional)
        .map<IOption>(n => n.data.option)
}

export const getAllEntitiesFromValue = (value: any): IOption[] => {
    const tree = value.toJSON().document

    return depthFirstSearch(tree, n => n.type === NodeTypes.Mention && n.data.completed === true, n => false)
        .map<IOption>(n => n.data.option)
}

/**
 * Create SlateValue from Text Variation
 * Note: InlineNodeType shouldn't really be exposed here, but it's needed currently.
 *
 * This function is intended to be used to create Text Action Payloads which only use the 'mention-inline-node'.
 * However, it could be used to create extractor SlateValues which use 'custom-inline-node' or 'prebuilt' types.
 *
 * @param textVariation Text Variation (text + labelEntities)
 * @param entities List of Entities
 * @param inlineNodeType Type of Slate node to create for the Entities
 */
export const createSlateValueFromTextVariation = (textVariation: TextVariation, entities: EntityBase[], inlineNodeType = NodeTypes.Mention): object => {
    const sortedLabelEntities = [...textVariation.labelEntities]
        .sort((a, b) => a.startCharIndex - b.startCharIndex)

    const genericEntities = sortedLabelEntities
        // TODO: Check on type of Data. IGenericEntityData<>
        // Note: This might affect serialization as it looks for ID and Name properties
        .map<IGenericEntity<IGenericEntityData<LabeledEntity>>>(le => {
            const entity = entities.find(e => e.entityId === le.entityId)
            if (!entity) {
                throw new Error(`Could not find matching entity for given label entity with id: ${le.entityId}`)
            }

            return {
                startIndex: le.startCharIndex,
                endIndex: le.endCharIndex,
                data: {
                    text: le.entityText,
                    displayName: entity.entityName,
                    // Create fake option from Entity
                    option: {
                        id: entity.entityId,
                        name: entity.entityName,
                        type: entity.entityType,
                        resolverType: null
                    },
                    original: le
                }
            }
        })

    return convertEntitiesAndTextToEditorValue(textVariation.text, genericEntities, inlineNodeType)
}
