export class Action {
    constructor(id, actionType, content, negativeEntities, positiveEntities, waitAction, metadata, appID){
        this.id = id;
        this.actionType = actionType;
        this.content = content;
        this.negativeEntities = negativeEntities;
        this.positiveEntities = positiveEntities;
        this.waitAction = waitAction;
        this.appID = appID;
        this.metadata = metadata
    }
}
export class ActionMetadata {
    constructor(internal, type){
        this.internal = internal;
        this.type = type;
    }
}