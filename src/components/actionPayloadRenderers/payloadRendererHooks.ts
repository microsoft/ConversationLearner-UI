import * as React from 'react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import SlateTransformer from '../modals/ActionPayloadEditor/slateTransformer'
import SlateSerializer from '../modals/ActionPayloadEditor/slateSerializer'
import { Value } from 'slate'

export function usePayloadRenderer(
    value: any,
    entities: CLM.EntityBase[],
    showMissingEntities: boolean,
    memories?: CLM.Memory[]
) {
    const entityIds = SlateSerializer.getEntityIds(value.document)
    const hasEntities = entityIds.length >= 1

    const renderedValues = React.useMemo(() => {
        const entityEntryMap = Util.createEntityMapWithNamesAndValues(entities, memories)
        const valueShowingEntityNames = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(value), entityEntryMap, e => `$${e.name}`, showMissingEntities)
        const valueShowingCurrentMemory = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(value), entityEntryMap, e => e.value ? e.value : `$${e.name}`, showMissingEntities)

        // Show toggle if payload has entities and any of those entities have memory values
        const showToggle = hasEntities
            && Object.entries(entityEntryMap)
                .filter(([entityId, entityEntry]) => entityIds.includes(entityId))
                .some(([entityId, entityEntry]) => entityEntry.value)

        return {
            showToggle,
            slateValueShowingNames: Value.fromJSON(valueShowingEntityNames),
            slateValueShowingMemory: Value.fromJSON(valueShowingCurrentMemory),
        }
    }, [value, entities])

    return {
        ...renderedValues,
        hasEntities
    }
}

export type RenderedActionArgumentWithHighlights = {
    parameter: string
    entityIds: string[]
    hasEntities: boolean
    jsonValueShowingEntityNames?: object
    jsonValueShowingCurrentMemory?: object
}

export function useMultiPayloadRenderer(
    actionArguments: CLM.ActionArgument[],
    entities: CLM.EntityBase[],
    showMissingEntities: boolean,
    memories?: CLM.Memory[]
) {
    const renderedArgumentsAndToggle = React.useMemo(() => {
        const entityEntryMap = Util.createEntityMapWithNamesAndValues(entities, memories)

        const renderedArgumentsWithHighlights = actionArguments
            .map<RenderedActionArgumentWithHighlights>(aa => {
                // Argument might not have a value if user left it blank
                if (!aa.value) {
                    return {
                        ...aa,
                        entityIds: [],
                        hasEntities: false
                    }
                }

                const entityIds = SlateSerializer.getEntityIds((aa.value as any).document)
                const hasEntities = entityIds.length >= 1
                const jsonValueShowingEntityNames = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(aa.value), entityEntryMap, e => `$${e.name}`, showMissingEntities)
                const jsonValueShowingCurrentMemory = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(aa.value), entityEntryMap, e => e.value ? e.value : `$${e.name}`, showMissingEntities)

                return {
                    ...aa,
                    entityIds,
                    hasEntities,
                    jsonValueShowingEntityNames,
                    jsonValueShowingCurrentMemory,
                }
            })

        const duplicatedEntityIds = renderedArgumentsWithHighlights.reduce((total, rArg) => [...total, ...rArg.entityIds], [])
        const entityIdsReferencedInValues = [...new Set(duplicatedEntityIds)]

        // Show toggle any of the payloads has entities and any of those entities have memory values
        const showToggle = renderedArgumentsWithHighlights.some(aa => aa.hasEntities)
            && Object.entries(entityEntryMap)
                .filter(([entityId, entityEntry]) => entityIdsReferencedInValues.includes(entityId))
                .some(([entityId, entityEntry]) => entityEntry.value)

        // Convert JSON objects representing values into actual SlateValues
        const renderedArguments = renderedArgumentsWithHighlights.map(renderArg => ({
            ...renderArg,
            valueShowingEntityNames: Value.fromJSON(renderArg.jsonValueShowingEntityNames),
            valueShowingCurrentMemory: Value.fromJSON(renderArg.jsonValueShowingCurrentMemory),
        }))

        return {
            showToggle,
            renderedArguments
        }
    }, [actionArguments.length, entities, memories, showMissingEntities])

    return renderedArgumentsAndToggle
}