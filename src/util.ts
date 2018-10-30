/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import { Activity } from 'botframework-directlinejs'
import { ReplayError } from '@conversationlearner/models';

export function notNullOrUndefined<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

export function replace<T>(xs: T[], updatedX: T, getId: (x: T) => object | number | string): T[] {
    const index = xs.findIndex(x => getId(x) === getId(updatedX))
    if (index < 0) {
        throw new Error(`You attempted to replace item in list with id: ${getId(updatedX)} but no item could be found.  Perhaps you meant to add the item to the list or it was already removed.`)
    }

    return [...xs.slice(0, index), updatedX, ...xs.slice(index + 1)]
}

export function isNullOrWhiteSpace(str: string | null): boolean {
    return (!str || str.length === 0 || /^\s*$/.test(str))
}

export function entityDisplayName(entity: CLM.EntityBase) {
    if (entity.positiveId) {
        return `-${entity.entityName.slice(1)}`;
    } else if (entity.negativeId) {
        return `+${entity.entityName}`;
    } else {
        return entity.entityName;
    }
}

export function getReplayError(activity: Activity | null): ReplayError | null | undefined {
    if (!activity || !activity.channelData || !activity.channelData.clData) {
        return null
    }
    let clData: CLM.CLChannelData = activity.channelData.clData
    return clData.replayError
}

export function matchedActivityIndex(selectedActivity: Activity, activities: Activity[]): number | null {
    if (!selectedActivity || activities.length === 0) {
        return null
    }
    else {
        let clDataSelected: CLM.CLChannelData = selectedActivity.channelData.clData
        let index = activities.findIndex(a => {
                let clData: CLM.CLChannelData = a.channelData.clData
                return (
                    clData.senderType === clDataSelected.senderType &&
                    clData.roundIndex === clDataSelected.roundIndex &&
                    clData.scoreIndex === clDataSelected.scoreIndex)
            }
        )
        if (index < 0) {
            console.log('Failed to find selected activity')
            return null
        }
        return index
    }
}

export function packageReferences(app: CLM.AppBase): CLM.PackageReference[] {
    return [
        ...app.packageVersions,
        {
            packageId: app.devPackageId,
            packageVersion: 'Master'
        }
    ]
}

// SDK add dummy empty filled Entity when memory items are missing.  This filters them out
export function filterDummyEntities(memories: CLM.Memory[]): CLM.Memory[] {
    return memories.filter(m => {
        return (m.entityValues.length > 0)
    })
}

export function createEntityMapFromMemories(entities: CLM.EntityBase[], memories: CLM.Memory[]): Map<string, string> {
    return memories.reduce((map, m) => {
        const entity = entities.find(e => e.entityName === m.entityName)
        if (entity !== undefined) {
            map.set(entity.entityId, CLM.memoryValuesAsString(m.entityValues))
        }
        return map
    }, new Map<string, string>())
}

export const CL_DEMO_ID = '4433d65080bc95c0f2bddd26b5a0c816d09619cd4f8be0fec99fd2944e536888'
export function isDemoAccount(userId: string): boolean {
    return userId.indexOf(CL_DEMO_ID) > -1
}

// TODO: Remove coupling with the start character on ActionPayloadEditor
export function getDefaultEntityMap(entities: CLM.EntityBase[]): Map<string, string> {
    return entities.reduce((m, e) => m.set(e.entityId, `$${e.entityName}`), new Map<string, string>())
}

export function setStateAsync(that: any, newState: any) {
    return new Promise((resolve) => {
        that.setState(newState, () => {
            resolve();
        });
    });
}

export const delay = <T>(ms: number, value?: T): Promise<T> => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))
