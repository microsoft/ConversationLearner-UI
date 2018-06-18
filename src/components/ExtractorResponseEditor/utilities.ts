/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Value } from 'slate'
import * as models from './models'
import * as util from '../../util'
import { EntityBase, PredictedEntity, ExtractResponse, EntityType } from '@conversationlearner/models'

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

    let result: RegExpExecArray = null
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

export const wrapTokensWithEntities = (tokens: IToken[], customEntitiesWithTokens: ICustomEntityWithTokenIndices[]): TokenArray => {
    // If there are no entities than no work to do, return tokens
    if (customEntitiesWithTokens.length === 0) {
        return tokens
    }
    
    const sortedCustomEntities = [...customEntitiesWithTokens].sort((a, b) => a.startIndex - b.startIndex)
    // Include all non labeled tokens before first entity
    const firstCet = sortedCustomEntities[0]
    const tokenArray: TokenArray = [...tokens.slice(0, firstCet.startTokenIndex)]

    for (let [i, cet] of Array.from(sortedCustomEntities.entries())) {
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

export const convertToSlateNodes = (tokensWithEntities: TokenArray): any[] => {
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
    for (let tokenOrEntity of tokensWithEntities) {
        if ((tokenOrEntity as IEntityPlaceholder).entity) {
            const entityPlaceholder: IEntityPlaceholder = tokenOrEntity as any
            const nestedNodes = convertToSlateNodes(entityPlaceholder.tokens)
            nodes.push({
                "kind": "inline",
                "type": models.NodeType.CustomEntityNodeType,
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

export const convertToSlateValue = (tokensWithEntities: TokenArray): any => {
    const nodes = convertToSlateNodes(tokensWithEntities)
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

/**
 * Note: this is more like a negative match used to determine characters that split the string instead of 
 * positive match would specify characters which are tokens. Only chose this because it seems like a much
 * simpler regex / smaller set of characters, but I imagine alternative approach would work
 */
export const tokenizeRegex = /\s+|[.?,!]/g

export const convertEntitiesAndTextToTokenizedEditorValue = (text: string, customEntities: models.IGenericEntity<any>[], inlineType: string) => {
    const labeledTokens = labelTokens(tokenizeText(text, tokenizeRegex), customEntities)
    return convertToSlateValue(labeledTokens)
}

export const convertEntitiesAndTextToEditorValue = (text: string, customEntities: models.IGenericEntity<any>[], inlineType: string) => {
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
            {
                text,
                startIndex: 0,
                endIndex: text.length,
                type: models.SegementType.Normal,
                data: {}
            }
        ])

    // console.log(`convertEntitiesAndTextToEditorValue: `, normalizedSegements.map(s => `[${s.startIndex}, '${s.text}', ${s.endIndex}]`).join(', '))
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

export const convertMatchedTextIntoMatchedOption = <T>(inputText: string, matches: [number, number][], original: T): models.MatchedOption<T> => {
    const matchedStrings = matches.reduce<models.ISegement[]>((segements, [startIndex, originalEndIndex]) => {
        // TODO: For some reason the Fuse.io library returns the end index before the last character instead of after
        // I opened issue here for explanation: https://github.com/krisk/Fuse/issues/212
        let endIndex = originalEndIndex + 1
        const segementIndexWhereEntityBelongs = segements.findIndex(seg => seg.startIndex <= startIndex && endIndex <= seg.endIndex)
        const prevSegements = segements.slice(0, segementIndexWhereEntityBelongs)
        const nextSegements = segements.slice(segementIndexWhereEntityBelongs + 1, segements.length)
        const segementWhereEntityBelongs = segements[segementIndexWhereEntityBelongs]

        const prevSegementEndIndex = startIndex - segementWhereEntityBelongs.startIndex
        const prevSegementText = segementWhereEntityBelongs.text.substring(0, prevSegementEndIndex)
        const prevSegement: models.ISegement = {
            ...segementWhereEntityBelongs,
            text: prevSegementText,
            endIndex: startIndex,
        }

        const nextSegementStartIndex = endIndex - segementWhereEntityBelongs.startIndex
        const nextSegementText = segementWhereEntityBelongs.text.substring(nextSegementStartIndex, segementWhereEntityBelongs.text.length)
        const nextSegement: models.ISegement = {
            ...segementWhereEntityBelongs,
            text: nextSegementText,
            startIndex: endIndex,
        }

        const newSegement: models.ISegement = {
            text: segementWhereEntityBelongs.text.substring(prevSegementEndIndex, nextSegementStartIndex),
            startIndex: startIndex,
            endIndex: endIndex,
            type: models.SegementType.Inline,
            data: {
                matched: true
            }
        }

        const newSegements = []
        if (prevSegement.startIndex !== prevSegement.endIndex) {
            newSegements.push(prevSegement)
        }

        if (newSegement.startIndex !== newSegement.endIndex) {
            newSegements.push(newSegement)
        }

        if (nextSegement.startIndex !== nextSegement.endIndex) {
            newSegements.push(nextSegement)
        }

        return [...prevSegements, ...newSegements, ...nextSegements]
    }, [
            {
                text: inputText,
                startIndex: 0,
                endIndex: inputText.length,
                type: models.SegementType.Normal,
                data: {
                    matched: false
                }
            }
        ]).map(({ text, data }) => ({
            text,
            matched: data.matched
        }))

    return {
        highlighted: false,
        original,
        matchedStrings
    }
}

export const getEntitiesFromValueUsingTokenData = (change: any): models.IGenericEntity<models.IGenericEntityData<PredictedEntity>>[] => {
    const entityInlineNodes = change.value.document.filterDescendants((node: any) => node.type === models.NodeType.CustomEntityNodeType)
    return (entityInlineNodes.map((entityNode: any) => {
        const tokenInlineNodes: any[] = entityNode.filterDescendants((node: any) => node.type === models.NodeType.TokenNodeType).toJS()
        if (tokenInlineNodes.length === 0) {
            console.warn(`Error 'getEntitiesFromValue': found entity node which did not contain any token nodes `)
            return null
        }

        const firstToken: IToken = tokenInlineNodes[0].data
        const lastToken: IToken = tokenInlineNodes[tokenInlineNodes.length - 1].data
        const data: models.IGenericEntityData<PredictedEntity> = entityNode.data.toJS()

        return {
            startIndex: firstToken.startIndex,
            endIndex: lastToken.endIndex,
            data
        }
    })
        .toJS() as any[])
        .filter(x => x)
}

export const getPreBuiltEntityDisplayName = (entity: EntityBase, pe: PredictedEntity): string => {
    if (typeof pe.builtinType !== 'string' || pe.builtinType.length === 0) {
        return entity.entityType
    }

    const names = pe.builtinType.split('.')
    return names[names.length - 1]
}

export const convertPredictedEntityToGenericEntity = (pe: PredictedEntity, entityName: string, displayName: string): models.IGenericEntity<models.IGenericEntityData<PredictedEntity>> =>
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
                type: pe.builtinType
            },
            text: pe.entityText,
            displayName,
            original: pe
        }
    })

export const convertGenericEntityToPredictedEntity = (entities: EntityBase[]) => (ge: models.IGenericEntity<models.IGenericEntityData<PredictedEntity>>): PredictedEntity => {
    const predictedEntity = ge.data.original
    if (predictedEntity) {
        return predictedEntity
    }

    // If predicted entity doesn't exist, re-construct predicted entity object using the option/entity chosen by the user and the selected text
    // Such as the case where we're editing the extract response and adding a new entity
    const option = ge.data.option
    const text = ge.data.text || ''

    if (option.type !== EntityType.LUIS) {
        console.warn(`convertGenericEntityToPredictedEntity option selected as option type other than LUIS, this will most likely cause an error`)
    }

    const entity = entities.find(e => e.entityId === option.id)
    if (!entity) {
        throw new Error(`Could not find entity with id: ${option.id} in list of entities: ${entities}`)
    }

    return {
        entityId: entity.entityId,
        startCharIndex: ge.startIndex,
        endCharIndex: ge.endIndex - 1,
        entityText: text,
        resolution: {},
        builtinType: undefined,
        score: 0
    }
}

export const convertExtractorResponseToEditorModels = (extractResponse: ExtractResponse, entities: EntityBase[]): models.IEditorProps => {
    const options = entities
        .filter(e => e.entityType === EntityType.LUIS)
        .map<models.IOption>(e =>
            ({
                id: e.entityId,
                name: util.entityDisplayName(e),
                type: e.entityType
            })
        )

    const text = extractResponse.text
    const internalPredictedEntities = extractResponse.predictedEntities
        .map<models.InternalPredictedEntity>(predictedEntity => {
            const entity = entities.find(e => e.entityId === predictedEntity.entityId)
            return {
                entity,
                predictedEntity
            }
        })

    const customEntities = internalPredictedEntities
        .filter(({ entity }) => entity && entity.entityType === EntityType.LUIS)
        .map(({ entity, predictedEntity }) => convertPredictedEntityToGenericEntity(predictedEntity, entity.entityName, util.entityDisplayName(entity)))

    const preBuiltEntities = internalPredictedEntities
        .filter(({ entity }) => entity && entity.entityType !== EntityType.LUIS && entity.entityType !== EntityType.LOCAL)
        .map(({ entity, predictedEntity }) => convertPredictedEntityToGenericEntity(predictedEntity, entity.entityName, getPreBuiltEntityDisplayName(entity, predictedEntity)))

    return {
        options,
        text,
        customEntities,
        preBuiltEntities
    }
}
