//=========================================================
//=================== DUMMY DATA ==========================

import { BLISApplication } from '../models/Application';
import { Action, ActionMetadata } from '../models/Action';
import { Entity, EntityMetadata } from '../models/Entity';
import { TrainDialog, Dialog, Turn, Input } from '../models/TrainDialog';
import { ActionTypes, APITypes, EntityTypes } from '../models/Constants'; 

let firstApp = new BLISApplication('58bdb485-3dd6-4451-b1cf-940dbf89e920', 'PizzaBot');
let secondApp = new BLISApplication('11tdb485-3dd6-1051-b1cf-040d3d4ae920', 'StockBot');
let bucketableMeta = new EntityMetadata(true, false, false, false)
let noMeta = new EntityMetadata(false, false, false, false)
let positiveMeta = new EntityMetadata(false, false, true, false)

let nameEntity = new Entity('11002431b-cb6a-42df-9a54-da167bedc23f', EntityTypes.local, null, 'name', noMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920')
let toppingsEntity = new Entity('3f7663a8-1a12-45a1-a531-d56401c469a4', EntityTypes.local, null, 'toppings', bucketableMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920')
let sizeEntity = new Entity('ede8946e-6a19-46c3-950f-c7661ea8faf0', EntityTypes.luis, null, 'size', noMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920');
let companyEntity = new Entity('a463f832-0402-45df-a209-9dcf0e106a62', EntityTypes.local, null, 'company', noMeta, '11tdb485-3dd6-1051-b1cf-040d3d4ae920');
let localAPICallMeta = new ActionMetadata(false, APITypes.local)
let azureCallMeta = new ActionMetadata(false, APITypes.azure)
let intentCallMeta = new ActionMetadata(false, APITypes.intent)
let textResponseMeta = new ActionMetadata(true, null)
let hiAction = new Action('16f61108-d73c-4c09-8e39-0b86ccca958d', ActionTypes.text, 'Hi there', [], [nameEntity], false, textResponseMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920')
let getSizeAction = new Action('d10ffd29-a8f4-4c3b-83ca-3481ae2727d8', ActionTypes.api, 'What size would you like?', [sizeEntity], [], false, azureCallMeta, '11tdb485-3dd6-1051-b1cf-040d3d4ae920')
let getNameAction = new Action('c8891a93-73f5-4f3c-8f48-72276d31b93f', ActionTypes.text, 'What is your name?', [nameEntity], [], false, textResponseMeta, '58bdb485-3dd6-4451-b1cf-940dbf89e920')

let APPS = [firstApp, secondApp];
let ENTITIES = [nameEntity, sizeEntity, toppingsEntity, companyEntity]
let ACTIONS = [hiAction, getNameAction, getSizeAction]

//=========================================================
//=========================================================

export const FETCH_APPLICATIONS = 'FETCH_APPS';
export const FETCH_ENTITIES = 'FETCH_ENTITIES';
export const FETCH_ACTIONS = 'FETCH_ACTIONS';
export const FETCH_TRAIN_DIALOGS = 'FETCH_TRAIN_DIALOGS';
export const fetchApplications = () => { 
    return {
        type: FETCH_APPLICATIONS,
        payload: APPS
    }
}
export const fetchAllEntities = (blisAppID) => { 
    let entities = ENTITIES.filter(ent => ent.appID == blisAppID);
    return {
        type: FETCH_ENTITIES,
        payload: entities
    }
}
export const fetchAllActions = (blisAppID) => { 
    let actions = ACTIONS.filter(ent => ent.appID == blisAppID);
    return {
        type: FETCH_ACTIONS,
        payload: actions
    }
}
export const fetchAllTrainDialogs = (blisAppID) => { 
    return {
        type: FETCH_TRAIN_DIALOGS,
        payload: {}
    }
}