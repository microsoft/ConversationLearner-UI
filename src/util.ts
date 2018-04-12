import * as models from 'conversationlearner-models'
import { EntityBase } from 'conversationlearner-models';

export function generateGUID(): string {
    let d = new Date().getTime();
    let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (char == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return guid;
}

export function replace<T>(xs: T[], updatedX: T, getId: (x: T) => any): T[] {
    const index = xs.findIndex(x => getId(x) === getId(updatedX))
    if (index < 0) {
        throw new Error(`You attempted to replace item in list with id: ${getId(updatedX)} but no item could be found.  Perhaps you meant to add the item to the list or it was already removed.`)
    }

    return [...xs.slice(0, index), updatedX, ...xs.slice(index + 1)]
}

export function isNullOrWhiteSpace(str: string): boolean {
    return (!str || str.length === 0 || /^\s*$/.test(str))
}

export function entityDisplayName(entity: models.EntityBase) {
    if (entity.positiveId) {
        return `-${entity.entityName.slice(1)}`;
    }
    else if (entity.negativeId) {
        return `+${entity.entityName}`;
    } 
    else {
        return entity.entityName;
    }
}

export function packageReferences(app: models.AppBase): models.PackageReference[] { 
    return [...app.packageVersions || [], {packageId: app.devPackageId, packageVersion: 'Master'}] as models.PackageReference[]
}

// TODO: Remove coupling with the start character on ActionPayloadEditor
export function getDefaultEntityMap(entities: EntityBase[]): Map<string, string> {
    return entities.reduce((m, e) => m.set(e.entityId, `$${e.entityName}`), new Map<string, string>())
}