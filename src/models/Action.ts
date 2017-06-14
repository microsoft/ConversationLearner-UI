import { Entity } from './Entity';
export class Action {
    constructor(public id: string, public actionType: string, public content: string, public negativeEntities: Entity[], public positiveEntities: Entity[], public waitAction: boolean, public metadata: ActionMetadata, public appID: string){
    }
}
export class ActionMetadata {
    constructor(public internal: boolean, public type: string){
    }
}