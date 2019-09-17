import * as React from 'react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import SlateTransformer from '../modals/ActionPayloadEditor/slateTransformer'
import SlateSerializer from '../modals/ActionPayloadEditor/slateSerializer'
import { Value } from 'slate'

export function usePayloadRenderer(value: any, entities: CLM.EntityBase[], showMissingEntities: boolean, memories?: CLM.Memory[]) {
    const hasEntities = React.useMemo(() => SlateSerializer.getEntityIds(value.document).length >= 1, [value])
    const slateValues = React.useMemo(() => {
        const entityEntryMap = Util.createEntityMapWithNamesAndValues(entities, memories)
        const valueShowingEntityNames = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(value), entityEntryMap, e => `$${e.name}`, showMissingEntities)
        const valueShowingCurrentMemory = SlateTransformer.replaceEntityNodesWithValues(Util.deepCopy(value), entityEntryMap, e => e.value ? e.value : `$${e.name}`, showMissingEntities)

        // Show toggle if we have memory, payload has entities, and any entities have memory values
        const showToggle = hasEntities
            && Object.values(entityEntryMap).some(entry => entry.value)

        return {
            showToggle,
            slateValueShowingNames: Value.fromJSON(valueShowingEntityNames),
            slateValueShowingMemory: Value.fromJSON(valueShowingCurrentMemory),
        }
    }, [value, entities])

    return {
        ...slateValues,
        hasEntities
    }
}