import { Value } from 'slate'
import * as models from './models'

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
    return characters.reduce((s: string, node: any) => s += node.text, '')
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

export const convertEntitiesAndTextToEditorValue = (text: string, customEntities: models.IGenericEntity<any>[], inlineType: string) => {
    const normalizedSegements = customEntities.reduce<models.ISegement[]>((segements, entity) => {
        const segementIndexWhereEntityBelongs = segements.findIndex(seg => seg.startIndex <= entity.startIndex && entity.endIndex <= seg.endIndex)
        if (segementIndexWhereEntityBelongs === -1) {
            throw new Error(`When attempting to convert entities to editor value, could not find text segement to place entity. Entity indicies are: [${entity.startIndex}, ${entity.endIndex}] but available segement ranges are: ${segements.map(s => `[${s.startIndex}, ${s.endIndex}]`).join(`, `)}`)
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

export const convertMatchedTextIntoMatchedOption = <T>(text: string, matches: [number, number][], original: T): models.MatchedOption<T> => {
    const matchedStrings = matches.reduce<models.ISegement[]>((segements, [startIndex, originalEndIndex]) => {
        // if (startIndex === endIndex) {
        //     return segements
        // }

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
                text,
                startIndex: 0,
                endIndex: text.length,
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

export const getEntitiesFromValue = (change: any) => {
    const inlineNodes = change.value.document.filterDescendants((node: any) => node.type === models.NodeType.CustomEntityNodeType)

    /**
     * TODO: Find out how to properly convert inline nodes back to entities
     * Currently the issue is that the anchorOffset and focusOffset are relative to the node they are within
     * but the entities we operate on are absolute values relative to the start of the entire text and I know
     * how to convert those back to absolute values.
     * 
     * The current implementation is kind of hack to compare selectedText with all text; however, this has issue with repeated
     * entities on repeated words which must then be deduped.  This is relying on fact that it will hopefully not occur often.
     * However, it should be improved.
     */
    return inlineNodes.map((node: any, i: number) => {
        const selectionChange = change
            .moveToRangeOf(node)
        const text = selectionChange.value.document.text
        const selectedText = getSelectedText(selectionChange.value)
        const startIndex = text.search(selectedText)
        const endIndex = startIndex + selectedText.length

        return {
            startIndex,
            endIndex,
            text: selectedText,
            data: node.data.toJS()
        }
    })
        .toJS()
        .reduce((entities: models.IGenericEntity<models.IGenericEntityData<any>>[], entity: models.IGenericEntity<models.IGenericEntityData<any>>) => {
            return entities.some(e => e.startIndex === entity.startIndex && e.endIndex === entity.endIndex)
                ? entities
                : [...entities, entity]
        }, [])
}

export const getEntityDisplayName = (pe: models.PredictedEntity): string => {
    const names = pe.builtinType.split('.')
    // If builtinType is only copy of entityType
    if (names.length === 1) {
        return pe.builtinType
    }

    // If builtinType is just basic value 'builtin.number' -> 'number'
    if (names.length === 2) {
        return names[1]
    }

    // If builtinType is complex value 'builtin.encyclopedia.people.person' -> 'person'
    return names[names.length - 1]
}

export const convertPredictedEntityToGenericEntity = (pe: models.PredictedEntity, displayName: string): models.IGenericEntity<models.IGenericEntityData<models.PredictedEntity>> =>
    ({
        startIndex: pe.startCharIndex,
        // The predicted entities returned by the service treat indices as characters instead of before or after the character so add 1 to endIndex for slicing using JavaScript
        // Also, it seems when predicted entities come back from the service during Teach Session the endIndex is 1 less;
        // howver, the entities that are returned when viewing TrainDialog are correctly matching length of text
        endIndex: pe.startCharIndex + pe.entityText.length, // pe.endCharIndex + 1,
        data: {
            option: {
                id: pe.entityId,
                name: pe.entityName,
                type: pe.builtinType
            },
            displayName,
            original: pe
        }
    })

export const convertGenericEntityToPredictedEntity = (ge: models.IGenericEntity<models.IGenericEntityData<models.PredictedEntity>>): any => {
    const predictedEntity = ge.data.original
    if (predictedEntity) {
        return predictedEntity
    }

    // If predicted entity doesn't exist, re-construct predicted entity object using the option/entity chosen by the user and the selected text
    // Such as the case where we're editing the extract response and adding a new entity
    const option = ge.data.option
    const text = (ge as any).text || (ge.data as any).text || ''

    if (option.type !== "LUIS") {
        console.warn(`convertGenericEntityToPredictedEntity option selected as option type other than LUIS, this will most likely cause an error`)
    }

    return {
        startCharIndex: ge.startIndex,
        endCharIndex: ge.endIndex - 1,
        entityId: option.id,
        entityName: option.name,
        entityText: text,
        entityType: option.type,
        resolution: {},
        builtinType: undefined
    }
}

// TODO: Use strong types from blis-models
export const convertExtractorResponseToEditorModels = (extractResponse: models.ExtractResponse, entities: models.EntityBase[]) => {
    const options = entities
        .filter(e => e.entityType === "LUIS")
        .map<models.IOption>(e =>
        ({
            id: e.entityId,
            name: e.entityName,
            type: e.entityType
        }))

    const text = extractResponse.text
    
    // Predicted entities for non prebuilts to not have builtinType property
    const customEntities = extractResponse.predictedEntities
        .filter(pe => (pe as any).entityType === "LUIS" || typeof pe.builtinType === undefined || pe.builtinType === "LUIS")
        .map(pe => convertPredictedEntityToGenericEntity(pe, pe.entityName))

    const preBuiltEntities = extractResponse.predictedEntities
        .filter(pe => typeof pe.builtinType === "string" && pe.builtinType !== "LUIS")
        .map(pe => convertPredictedEntityToGenericEntity(pe, getEntityDisplayName(pe)))

    return {
        options,
        text,
        customEntities,
        preBuiltEntities
    }
}