
import { BLISApplication } from '../models/Application';
import { Action, ActionMetadata } from '../models/Action';
import { Entity, EntityMetadata } from '../models/Entity';
import { TrainDialog, Dialog, Turn, Input } from '../models/TrainDialog';
import { ActionTypes, EntityTypes } from '../models/Constants'; 
import { ActionObject } from './ActionObject'

//=========================================================
//=================== DUMMY DATA ==========================

let firstApp = new BLISApplication('58bdb485-3dd6-4451-b1cf-940dbf89e920', 'PizzaBot', '2bd14f6c-8899-4682-855c-910fd6227351', 'English');
let secondApp = new BLISApplication('11tdb485-3dd6-1051-b1cf-040d3d4ae920', 'StockBot', 'a68af138-c7c7-499c-9491-7bc3754cef76', 'English');
let bucketableMeta = new EntityMetadata(true, false, false, false)
let noMeta = new EntityMetadata(false, false, false, false)
let positiveMeta = new EntityMetadata(false, false, true, false)

let nameEntity = new Entity('11002431b-cb6a-42df-9a54-da167bedc23f', EntityTypes.LOCAL, null, 'name', noMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920')
let toppingsEntity = new Entity('3f7663a8-1a12-45a1-a531-d56401c469a4', EntityTypes.LOCAL, null, 'toppings', bucketableMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920')
let sizeEntity = new Entity('ede8946e-6a19-46c3-950f-c7661ea8faf0', EntityTypes.LUIS, null, 'size', noMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920');
let companyEntity = new Entity('a463f832-0402-45df-a209-9dcf0e106a62', EntityTypes.LOCAL, null, 'company', noMeta, '11tdb485-3dd6-1051-b1cf-040d3d4ae920');
let localAPICallMeta = new ActionMetadata(false, null)
let azureCallMeta = new ActionMetadata(false, null)
let intentCallMeta = new ActionMetadata(false, null)
let textResponseMeta = new ActionMetadata(true, null)
let hiAction = new Action('16f61108-d73c-4c09-8e39-0b86ccca958d', ActionTypes.TEXT, 'Hi there', [], [nameEntity], false, textResponseMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920')
let getSizeAction = new Action('d10ffd29-a8f4-4c3b-83ca-3481ae2727d8', ActionTypes.API_LOCAL, 'What size would you like?', [sizeEntity], [], false, azureCallMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920')
let getNameAction = new Action('c8891a93-73f5-4f3c-8f48-72276d31b93f', ActionTypes.INTENT, 'What is your name?', [nameEntity], [], false, textResponseMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920')
let getCompanyAction = new Action('d10ffa29-a8f4-4c3b-83ca-3481ae2727d8', ActionTypes.API_AZURE, 'What company do you need info for? ', [companyEntity], [], false, localAPICallMeta, '11tdb485-3dd6-1051-b1cf-040d3d4ae920')
let dialog1 = new TrainDialog('34edb485-3dd6-1051-b1cf-0wes3d4ae920', new Dialog([new Turn(null, null)]), '11tdb485-3dd6-1051-b1cf-040d3d4ae920' )
let dialog2 = new TrainDialog('1c85dc72-2f26-449e-840b-de247ffe83bf', new Dialog([new Turn(null, null)]), '58bdb485-3dd6-4451-b1cf-940dbf89e920' )
let APPS : BLISApplication[] = [firstApp, secondApp];
let ENTITIES = [nameEntity, sizeEntity, toppingsEntity, companyEntity]
let ACTIONS = [hiAction, getNameAction, getSizeAction, getCompanyAction]
let TRAINDIALOGS: TrainDialog[] = [dialog1, dialog2];

//=========================================================
//=========================================================

export const fetchApplications = () : ActionObject => { 
    //will need to make a call to BLIS to get all apps for this user
    return {
        type: 'FETCH_APPLICATIONS',
        allBlisApps: APPS
    }
}
export const fetchAllEntities = (blisAppID: string) : ActionObject => { 
    //will need to make a call to BLIS to get all entities for this app
    let entities = ENTITIES.filter(ent => ent.appID == blisAppID);
    return {
        type: 'FETCH_ENTITIES',
        allEntities: entities
    }
}
export const fetchAllActions = (blisAppID: string) : ActionObject => { 
    //will need to make a call to BLIS to get all actions for this app
    let actions = ACTIONS.filter(ent => ent.appID == blisAppID);
    return {
        type: 'FETCH_ACTIONS',
        allActions: actions
    }
}
export const fetchAllTrainDialogs = (blisAppID: string) : ActionObject => { 
    //will need to make a call to BLIS to get all train dialogs for this app
    let trainDialogs = TRAINDIALOGS.filter(td => td.appID == blisAppID);
    return {
        type: 'FETCH_TRAIN_DIALOGS',
        allTrainDialogs: TRAINDIALOGS
    }
}