export class Entity {
    constructor(public id: string, public entityType: string, public LUISPreName: string, public name: string, public metadata: EntityMetadata, public appID: string){
    }
}
export class EntityMetadata {
    constructor(public bucket: boolean, public negative: boolean, public positive: boolean, public task: boolean){
    }
}