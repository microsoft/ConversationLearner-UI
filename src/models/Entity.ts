export class Entity {
    constructor(id, entityType, LUISPreName, name, metadata, appID){
        this.id = id;
        this.entityType = entityType;
        this.LUISPreName = LUISPreName;
        this.name = name;
        this.metadata = metadata;
        this.appID = appID;
    }
}
export class EntityMetadata {
    constructor(bucket, negative, positive, task){
        this.bucket = bucket;
        this.negative = negative;
        this.positive = positive;
        this.task = task;
    }
}