/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Value } from 'slate'
import * as models from './models'
import * as util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'

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

export const getSelectedText = (value: any) => {
    const characters = value.characters ? value.characters.toJSON() : []
    return characters.reduce((s: string, node: any) => s + node.text, '')
}

export const valueToJSON = (value: any) => {
    return {
        data: value.data.toJSON(),
        decorations: value.decorations ? value.decorations.toJSON() : [],
        document: value.toJSON().document,
        activeMarks: value.activeMarks.toJSON(),
        marks: value.marks.toJSON(),
        texts: value.texts.toJSON(),
        selectedText: getSelectedText(value),
        selection: value.selection.toJSON()
    }
}

export interface IToken {
    text: string
    isSelectable: boolean
    startIndex: number
    endIndex: number
}

interface ICustomEntityWithTokenIndices extends models.IGenericEntity<any> {
    startTokenIndex: number
    endTokenIndex: number
}

interface IEntityPlaceholder {
    entity: models.IGenericEntity<any>
    tokens: IToken[]
}

export type TokenArray = (IToken | IEntityPlaceholder)[]

export const tokenizeText = (text: string, tokenRegex: RegExp): IToken[] => {
    const tokens: IToken[] = []
    if (text.length === 0) {
        return tokens
    }

    let result: RegExpExecArray | null = null
    let lastIndex = tokenRegex.lastIndex
    // tslint:disable-next-line:no-conditional-assignment
    while ((result = tokenRegex.exec(text)) !== null) {
        const matchedText = text.substring(lastIndex, result.index)
        tokens.push(...[
            {
                text: matchedText,
                isSelectable: true,
                startIndex: lastIndex,
                endIndex: result.index
            },
            {
                text: result[0],
                isSelectable: false,
                startIndex: result.index,
                endIndex: result.index + result[0].length
            }
        ])

        lastIndex = tokenRegex.lastIndex
    }

    const endIndex = text.length
    tokens.push({
        text: text.substring(lastIndex, endIndex),
        isSelectable: true,
        startIndex: lastIndex,
        endIndex
    })

    return tokens
}

/**
 * Similar to findIndex, but finds last index by iterating array items from end/right instead of start/left
 * @param xs Array
 * @param f Predicate function
 */
export const findLastIndex = <T>(xs: T[], f: (x: T) => boolean): number => {
    // tslint:disable-next-line:no-increment-decrement
    for (let i = xs.length - 1; i >= 0; i--) {
        if (f(xs[i])) {
            return i
        }
    }

    return -1
}

/**
 * For each customEntity, find the indicies of the start and end tokens within the entity boundaries
 *
 *         [   custom entity  ]
 * [token0 token1 token2 token3 token4 token5]
 *         [1,               3]
 *
 * @param tokens Array of Tokens
 * @param customEntities Array of Custom Entities
 */
export const addTokenIndicesToCustomEntities = (tokens: IToken[], customEntities: models.IGenericEntity<any>[]): ICustomEntityWithTokenIndices[] => {
    return customEntities.map<ICustomEntityWithTokenIndices>(ce => {
        const startTokenIndex = tokens.findIndex(t => t.isSelectable === true && ce.startIndex < t.endIndex && t.endIndex <= ce.endIndex)
        const endTokenIndex = findLastIndex(tokens, t => t.isSelectable === true && ce.startIndex <= t.startIndex && t.startIndex < ce.endIndex)
        if (startTokenIndex === -1 || endTokenIndex === -1) {
            console.warn(`Could not find valid token for custom entity: `, ce)
        }

        //         if (startTokenIndex !== -1 && endTokenIndex !== -1) {
        //             const startToken = tokens[startTokenIndex]
        //             const endToken = tokens[endTokenIndex]

        //             console.log(`
        // token indices found:
        // ce.startIndex: ${ce.startIndex}
        // ce.endIndex: ${ce.endIndex}

        // startTokenIndex: ${startTokenIndex}
        // startToken.isSelectable: ${startToken.isSelectable}
        // startToken.startIndex: ${startToken.startIndex}
        // startToken.endIndex: ${startToken.endIndex}

        // endTokenIndex: ${endTokenIndex}
        // endToken.isSelectable: ${endToken.isSelectable}
        // endToken.startIndex: ${endToken.startIndex}
        // endToken.endIndex: ${endToken.endIndex}
        // `)
        //         }

        return {
            ...ce,
            startTokenIndex,
            endTokenIndex: endTokenIndex + 1
        }
    })
}

/**
 * (IToken[], ICustomEntityWithTokenIndicies[]) => (IToken | IEntityPlaceholder)[]
 * Given tokens and custom entities associated with tokens, replace tokens with entities placeholders
 * These entity placeholders eventually get converted to slate inline segments
 *
 * Simplified visual
 * [token0, token1, token2, token3, token4, token5, token6], [{token6, [1, 3]}]
 * [token0, [token1, token2, token3], token4, token5, token6]
 *
 * @param tokens Array of Tokens
 * @param customEntitiesWithTokens Array of Custom Entities with Token Indicies
 */
export const wrapTokensWithEntities = (tokens: IToken[], customEntitiesWithTokens: ICustomEntityWithTokenIndices[]): TokenArray => {
    // If there are no entities than no work to do, return tokens
    if (customEntitiesWithTokens.length === 0) {
        return tokens
    }

    const sortedCustomEntities = [...customEntitiesWithTokens].sort((a, b) => a.startIndex - b.startIndex)
    // Include all non labeled tokens before first entity
    const firstCet = sortedCustomEntities[0]
    const tokenArray: TokenArray = [...tokens.slice(0, firstCet.startTokenIndex)]

    for (const [i, cet] of Array.from(sortedCustomEntities.entries())) {
        // push labeled tokens
        tokenArray.push({
            entity: cet,
            tokens: tokens.slice(cet.startTokenIndex, cet.endTokenIndex)
        })

        // push non labeled tokens in between this and next entity
        if (i !== sortedCustomEntities.length - 1) {
            const nextCet = sortedCustomEntities[i + 1]
            tokenArray.push(...tokens.slice(cet.endTokenIndex, nextCet.startTokenIndex))
        }
    }

    // Include all non labeled tokens after last entity
    const lastCet = sortedCustomEntities[sortedCustomEntities.length - 1]
    tokenArray.push(...tokens.slice(lastCet.endTokenIndex))

    return tokenArray
}

export const labelTokens = (tokens: IToken[], customEntities: models.IGenericEntity<any>[]): TokenArray => {
    return wrapTokensWithEntities(tokens, addTokenIndicesToCustomEntities(tokens, customEntities))
}

export const convertToSlateNodes = (tokensWithEntities: TokenArray, inlineNodeType: string = models.NodeType.CustomEntityNodeType): any[] => {
    const nodes: any[] = []

    // If there are no tokens, just return empty text node to ensure valid SlateValue object
    // In other words non-void parent nodes must have a child.
    if (tokensWithEntities.length === 0) {
        nodes.push({
            "kind": "text",
            "leaves": [
                {
                    "kind": "leaf",
                    "text": '',
                    "marks": []
                }
            ]
        })

        return nodes
    }

    // TODO: Find better way to iterate over the nested array and determine based on flow-control / property types without casting
    for (const tokenOrEntity of tokensWithEntities) {
        if ((tokenOrEntity as IEntityPlaceholder).entity) {
            const entityPlaceholder: IEntityPlaceholder = tokenOrEntity as any
            const nestedNodes = convertToSlateNodes(entityPlaceholder.tokens, inlineNodeType)
            nodes.push({
                "kind": "inline",
                "type": inlineNodeType,
                "isVoid": false,
                "data": entityPlaceholder.entity.data,
                "nodes": nestedNodes
            })
        }
        else {
            const token: IToken = tokenOrEntity as any
            if (token.isSelectable) {
                nodes.push({
                    "kind": "inline",
                    "type": models.NodeType.TokenNodeType,
                    "isVoid": false,
                    "data": token,
                    "nodes": [
                        {
                            "kind": "text",
                            "leaves": [
                                {
                                    "kind": "leaf",
                                    "text": token.text,
                                    "marks": []
                                }
                            ]
                        }
                    ]
                })
            }
            else {
                nodes.push({
                    "kind": "text",
                    "leaves": [
                        {
                            "kind": "leaf",
                            "text": token.text,
                            "marks": []
                        }
                    ]
                })
            }
        }
    }

    return nodes
}

export const convertToSlateValue = (tokensWithEntities: TokenArray, inlineNodeType: string = models.NodeType.CustomEntityNodeType): any => {
    const nodes = convertToSlateNodes(tokensWithEntities, inlineNodeType)
    const document = {
        "document": {
            "nodes": [
                {
                    "kind": "block",
                    "type": "paragraph",
                    "isVoid": false,
                    "data": {},
                    "nodes": nodes
                }
            ]
        }
    }

    return Value.fromJSON(document)
}

function convertSegmentsToSlateValue(normalizedSegements: models.ISegement[], inlineType: string = models.NodeType.CustomEntityNodeType) {
    const nodes = normalizedSegements
        .map(segement => {
            if (segement.type === 'inline') {
                return {
                    "kind": "inline",
                    "type": inlineType,
                    "isVoid": false,
                    "data": segement.data,
                    "nodes": [
                        {
                            "kind": "text",
                            "leaves": [
                                {
                                    "kind": "leaf",
                                    "text": segement.text,
                                    "marks": []
                                }
                            ]
                        }
                    ]
                }
            }

            return {
                "kind": "text",
                "leaves": [
                    {
                        "kind": "leaf",
                        "text": segement.text,
                        "marks": []
                    }
                ]
            }
        })

    return {
        "document": {
            "nodes": [
                {
                    "kind": "block",
                    "type": "paragraph",
                    "isVoid": false,
                    "data": {},
                    "nodes": nodes
                }
            ]
        }
    }
}

export const discardOverlappingEntities = (customEntities: models.IGenericEntity<object>[]): models.IGenericEntity<any>[] => {
    // Group by start index
    const entityGroups = customEntities
        .reduce<models.IGenericEntity<object>[][]>((groups, customEntity) => {
            const existingGroup = groups.find(g => g.some(ce => ce.startIndex === customEntity.startIndex))
            if (existingGroup) {
                existingGroup.push(customEntity)
            }
            else {
                const newGroup = [customEntity]
                groups.push(newGroup)
            }

            return groups
        }, [])

    // Sort groups by size (smallest first) might not be necessary, but might be precursor to supporting hierarchial (intentional overlap)
    const sortedEntityGroups = entityGroups.map(g => [...g].sort((a, b) => {
        const sizeA = a.endIndex - a.startIndex
        const sizeB = b.endIndex - b.startIndex

        return sizeA - sizeB
    }))

    // Flatten groups by taking first of non overlapping entity of next group
    let lastEndIndex = 0
    const nonOverlappingEntities: models.IGenericEntity<object>[] = []
    for (const group of sortedEntityGroups) {
        // https://github.com/Microsoft/TypeScript/issues/13778
        const firstEntityOfGroup: models.IGenericEntity<object> | undefined = group[0]
        if (!firstEntityOfGroup) {
            throw new Error(`Error when discarding overlapping entities. Cannot get first entity of group because the group is empty.`)
        }

        if (firstEntityOfGroup.startIndex >= lastEndIndex) {
            nonOverlappingEntities.push(firstEntityOfGroup)
            lastEndIndex = firstEntityOfGroup.endIndex
        }
    }

    return nonOverlappingEntities
}

/**
 * Compare every entity to every other entity. If any have overlapping indices then log warning.
 * 
 * @param customEntities List of custom entities
 */
export const warnAboutOverlappingEntities = (customEntities: models.IGenericEntity<object>[]): boolean => {
    return customEntities.some((entity, i) => {
        return customEntities
            .slice(i + 1)
            .some((otherEntity, _, es) => {
                // Overlap start index
                //  [ other entity ]
                //            [ entity ]
                const overlapStartIndex = (otherEntity.startIndex <= entity.startIndex
                    && otherEntity.endIndex >= entity.startIndex)
                // Overlap end index
                //    [ other entity ]
                // [entity]
                const overlapEndIndex = (otherEntity.startIndex <= entity.endIndex
                    && otherEntity.endIndex >= entity.endIndex)

                const overlap = overlapStartIndex || overlapEndIndex

                if (overlap) {
                    // console.debug(`Entity `, entity, `has overlap with other entities.`, es)
                    console.warn(`Custom entities have overlap. Overlapping entities will be discarded to allow proper rendering in UI but this is a bug.`, customEntities)
                }

                return overlap
            })
    })
}

/**
 * Note: this is more like a negative match used to determine characters that split the string instead of
 * positive match would specify characters which are tokens. Only chose this because it seems like a much
 * simpler regex / smaller set of characters, but I imagine alternative approach would work
 */
export const tokenizeRegex = /\s+|[.?,!]/g

/**
 * Used for conversion of text and custom entities. For proper usage within extractor editor we need to tokenize the text.
 * This is what makes it different from the below method which doesnt need to be tokenized.
 *
 * @param text plain text
 * @param customEntities array of entities
 */
export const convertEntitiesAndTextToTokenizedEditorValue = (text: string, customEntities: models.IGenericEntity<any>[], inlineNodeType: string) => {
    warnAboutOverlappingEntities(customEntities)
    const nonOverlappingCustomEntities = discardOverlappingEntities(customEntities)
    const labeledTokens = labelTokens(tokenizeText(text, tokenizeRegex), nonOverlappingCustomEntities)
    return convertToSlateValue(labeledTokens, inlineNodeType)
}

/**
 * Used for conversion of text and prebuilt entities. Because the user can't editing label for prebuilts we don't need to tokenize the text.
 * It can be split precisely and only on entity boundaries.
 *
 * Works by incrementially spliting the initial segment per entity
 *  0123456789012345678901234567
 * 'I am some sample user input' [[5,6],[17,21]]
 * 'I am ','some', 'sample user input'
 * 'I am ','some', 'sample','user',' input'
 *
 * Some and User would be highlighted because they are labels.
 *
 * Algorithm was done this was to help be robust against overlapping entities and partially complete and skip them, but I think it still fails
 * Could change to single pass algorithm that first checkx entity boundaries upfront. This might be simpler.
 *
 * @param text Plain text
 * @param customEntities Array of Entities (Likely Prebult entities)
 * @param inlineNodeType The node type to use for Slate nodes. (Likely Prebult)
 */
export const convertEntitiesAndTextToEditorValue = (text: string, customEntities: models.IGenericEntity<any>[], inlineNodeType: string) => {
    const initialSegment: models.ISegement = {
        text,
        startIndex: 0,
        endIndex: text.length,
        type: models.SegementType.Normal,
        data: {}
    }

    const normalizedSegements = customEntities.reduce<models.ISegement[]>((segements, entity) => {
        const segementIndexWhereEntityBelongs = segements.findIndex(seg => seg.startIndex <= entity.startIndex && entity.endIndex <= seg.endIndex)
        if (segementIndexWhereEntityBelongs === -1) {
            throw new Error(`When attempting to convert entities to editor value, could not find text segement to place entity. Entity indices are: [${entity.startIndex}, ${entity.endIndex}] but available segement ranges are: ${segements.map(s => `[${s.startIndex}, ${s.endIndex}]`).join(`, `)}`)
        }
        const prevSegements = segements.slice(0, segementIndexWhereEntityBelongs)
        const nextSegements = segements.slice(segementIndexWhereEntityBelongs + 1, segements.length)
        const segementWhereEntityBelongs = segements[segementIndexWhereEntityBelongs]

        const absolutePrevSegementEndIndex = entity.startIndex
        const relativePrevSegementEndIndex = entity.startIndex - segementWhereEntityBelongs.startIndex
        const prevSegementText = segementWhereEntityBelongs.text.substring(0, relativePrevSegementEndIndex)
        const prevSegement: models.ISegement = {
            ...segementWhereEntityBelongs,
            text: prevSegementText,
            endIndex: absolutePrevSegementEndIndex,
        }

        const absoluteNextSegementStartIndex = entity.endIndex
        const relativeNextSegementStartIndex = entity.endIndex - segementWhereEntityBelongs.startIndex
        const nextSegementText = segementWhereEntityBelongs.text.substring(relativeNextSegementStartIndex)
        const nextSegement: models.ISegement = {
            ...segementWhereEntityBelongs,
            text: nextSegementText,
            startIndex: absoluteNextSegementStartIndex,
        }

        const newSegement: models.ISegement = {
            text: segementWhereEntityBelongs.text.substring(relativePrevSegementEndIndex, relativeNextSegementStartIndex),
            startIndex: entity.startIndex,
            endIndex: entity.endIndex,
            type: models.SegementType.Inline,
            data: entity.data
        }

        const newSegements = prevSegements
        if (prevSegement.startIndex !== prevSegement.endIndex) {
            newSegements.push(prevSegement)
        }

        if (newSegement.startIndex !== newSegement.endIndex) {
            newSegements.push(newSegement)
        }

        if (nextSegement.startIndex !== nextSegement.endIndex) {
            newSegements.push(nextSegement)
        }

        return [...newSegements, ...nextSegements]
    }, [
        initialSegment
    ])

    // console.log(`convertEntitiesAndTextToEditorValue: `, normalizedSegements.map(s => `[${s.startIndex}, '${s.text}', ${s.endIndex}]`).join(', '))
    const document = convertSegmentsToSlateValue(normalizedSegements, inlineNodeType);

    return Value.fromJSON(document)
}

/**
 * Given slate change object return array of entities contained.
 * Essentially scans slate object for inline noes that have entity data (type: mention-inline-node)
 * Reconstructs index boundaries from indicies on start and end tokens
 *
 * @param change Slate change object.
 */
export const getEntitiesFromValueUsingTokenData = (change: any): models.IGenericEntity<models.IGenericEntityData<CLM.PredictedEntity>>[] => {
    const entityInlineNodes = change.value.document.filterDescendants((node: any) => node.type === models.NodeType.CustomEntityNodeType)
    return (entityInlineNodes.map((entityNode: any) => {
        const tokenInlineNodes: any[] = entityNode.filterDescendants((node: any) => node.type === models.NodeType.TokenNodeType).toJS()
        if (tokenInlineNodes.length === 0) {
            console.warn(`Error 'getEntitiesFromValue': found entity node which did not contain any token nodes `)
            return null
        }

        const firstToken: IToken = tokenInlineNodes[0].data
        const lastToken: IToken = tokenInlineNodes[tokenInlineNodes.length - 1].data
        const data: models.IGenericEntityData<CLM.PredictedEntity> = entityNode.data.toJS()

        return {
            startIndex: firstToken.startIndex,
            endIndex: lastToken.endIndex,
            data
        }
    })
        .toJS() as any[])
        .filter(x => x)
}

export const getPreBuiltEntityDisplayName = (entity: CLM.EntityBase, pe: CLM.PredictedEntity): string => {
    if (typeof pe.builtinType !== 'string' || pe.builtinType.length === 0) {
        return entity.entityType
    }

    const names = pe.builtinType.split('.')
    const [builtinPrefix, ...segements] = names
    /**
     * Expect resolutions to have builtinType to be of form:
     * builtin.datetimeV2.duration
     * If it somehow is not '.'(period) delimeted. Return whole type
     */
    if (segements.length === 0) {
        return builtinPrefix
    }

    return segements.join('.')
}

export const convertPredictedEntityToGenericEntity = (pe: CLM.PredictedEntity, entityName: string, displayName: string): models.IGenericEntity<models.IGenericEntityData<CLM.PredictedEntity>> =>
    ({
        startIndex: pe.startCharIndex,
        // The predicted entities returned by the service treat indices as characters instead of before or after the character so add 1 to endIndex for slicing using JavaScript
        // Also, it seems when predicted entities come back from the service during Teach Session the endIndex is 1 less;
        // however, the entities that are returned when viewing TrainDialog are correctly matching length of text
        endIndex: pe.startCharIndex + pe.entityText.length, // pe.endCharIndex + 1,
        data: {
            option: {
                id: pe.entityId,
                name: entityName,
                type: pe.builtinType,
                resolverType: null
            },
            text: pe.entityText,
            displayName,
            original: pe,
        }
    })

export const convertGenericEntityToPredictedEntity = (entities: CLM.EntityBase[]) => (ge: models.IGenericEntity<models.IGenericEntityData<CLM.PredictedEntity>>): CLM.PredictedEntity => {
    const predictedEntity = ge.data.original
    if (predictedEntity) {
        return predictedEntity
    }

    // If predicted entity doesn't exist, re-construct predicted entity object using the option/entity chosen by the user and the selected text
    // Such as the case where we're editing the extract response and adding a new entity
    const option = ge.data.option
    const text = ge.data.text ?? ''

    if (option.type !== CLM.EntityType.LUIS) {
        console.warn(`convertGenericEntityToPredictedEntity option selected as option type other than LUIS, this will most likely cause an error`)
    }

    const entity = entities.find(e => e.entityId === option.id)
    if (!entity) {
        throw new Error(`Could not find entity with id: ${option.id} in list of entities: ${entities}`)
    }

    // There was old bug about start and end indices on textVariations not matching the actual text
    // The variations should be generated as these customEntities go out and get converted to an extractResponse
    // Then eventually saved on the dialog round
    if (text.length !== (ge.endIndex - ge.startIndex)) {
        throw new Error(`Entity labeling error. Start and End index difference don't match the length of selected text. This shouldn't be possible.`)
    }

    return {
        entityId: entity.entityId,
        startCharIndex: ge.startIndex,
        endCharIndex: ge.endIndex - 1,
        entityText: text,
        resolution: {},
        builtinType: entity.entityType, // undefined
        score: 0
    }
}

export const convertExtractorResponseToEditorModels = (extractResponse: CLM.ExtractResponse, entities: CLM.EntityBase[]): models.IEditorProps => {
    const options = entities
        .filter(e => e.entityType === CLM.EntityType.LUIS)
        .map<models.IOption>(e =>
            ({
                id: e.entityId,
                name: util.entityDisplayName(e),
                type: e.entityType,
                resolverType: e.resolverType
            })
        )

    const text = extractResponse.text
    const internalPredictedEntities = extractResponse.predictedEntities
        .map(predictedEntity => {
            const entity = entities.find(e => e.entityId === predictedEntity.entityId)
            return {
                entity,
                predictedEntity
            }
        })
        // Entity could be null if user deleted an entity in use
        .filter(ipe => ipe.entity !== null)

    const customEntities = internalPredictedEntities
        .filter(({ entity }) => entity?.entityType === CLM.EntityType.LUIS)
        .map(({ entity, predictedEntity }) => convertPredictedEntityToGenericEntity(predictedEntity, entity!.entityName, util.entityDisplayName(entity!)))

    const preBuiltEntities = internalPredictedEntities
        .filter(({ entity }) => entity && CLM.isPrebuilt(entity))
        .map(({ entity, predictedEntity }) => convertPredictedEntityToGenericEntity(predictedEntity, entity!.entityName, getPreBuiltEntityDisplayName(entity!, predictedEntity)))

    return {
        options,
        text,
        customEntities,
        preBuiltEntities
    }
}
