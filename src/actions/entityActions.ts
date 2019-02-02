/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import * as CLM from '@conversationlearner/models'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import * as ClientFactory from '../services/clientFactory' 
import { fetchApplicationTrainingStatusThunkAsync } from './appActions'
import { AxiosError } from 'axios'
import { fetchAllActionsThunkAsync } from './actionActions';
import { fetchAllTrainDialogsThunkAsync } from './trainActions';

//-------------------------------------
// createEntity
//-------------------------------------
const createEntityAsync = (appId: string, entity: CLM.EntityBase): ActionObject => {
    return {
        type: AT.CREATE_ENTITY_ASYNC,
        entity: entity,
        appId: appId
    }
}

const createEntityFulfilled = (entity: CLM.EntityBase): ActionObject => {
    return {
        type: AT.CREATE_ENTITY_FULFILLED,
        entity: entity
    }
}

export const createEntityThunkAsync = (appId: string, entity: CLM.EntityBase) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(createEntityAsync(appId, entity))
        const clClient = ClientFactory.getInstance(AT.CREATE_ENTITY_ASYNC)

        try {     
            const posEntity = await clClient.entitiesCreate(appId, entity);
            dispatch(createEntityFulfilled(posEntity));

            if (posEntity.negativeId) {
                // Need to load negative entity in order to load it into memory
                const negEntity = await clClient.entitiesGetById(appId, posEntity.negativeId)
                dispatch(createEntityFulfilled(negEntity));
            }

            // If created entity has resolver, we fetch all entities to make sure 
            // that definition of prebuilt entity is in the memory
            if (typeof entity.resolverType !== 'undefined' && entity.resolverType !== null)
            {
                dispatch(fetchAllEntitiesThunkAsync(appId));
            }
            
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_ENTITY_ASYNC))
        }
    }
}

//-------------------------------------
// editEntity
//-------------------------------------
const editEntityAsync = (appId: string, entity: CLM.EntityBase): ActionObject => {
    return {
        type: AT.EDIT_ENTITY_ASYNC,
        appId,
        entity
    }
}

const editEntityFulfilled = (entity: CLM.EntityBase): ActionObject => {
    return {
        type: AT.EDIT_ENTITY_FULFILLED,
        entity: entity
    }
}

export const editEntityThunkAsync = (appId: string, entity: CLM.EntityBase, prevEntity: CLM.EntityBase) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_ENTITY_ASYNC)
        dispatch(editEntityAsync(appId, entity))

        try {
            const changedEntityResponse = await clClient.entitiesUpdate(appId, entity)
            dispatch(editEntityFulfilled(entity))

            // If we're setting negatable flag
            if (entity.isNegatible && !prevEntity.isNegatible) {
                // Need to fetch negative entity in order to load it into memory
                const negEntity = await clClient.entitiesGetById(appId, changedEntityResponse.negativeEntityId)
                dispatch(createEntityFulfilled(negEntity))
            }
            // If we're UNsetting negatable flag
            else if (!entity.isNegatible && prevEntity.isNegatible) {
                // Need to remove negative entity from memory
                dispatch(deleteEntityFulfilled(prevEntity.negativeId!))
            }
            // If entity is negatable and negative entity have changed as a result of this edit
            else if (entity.isNegatible && changedEntityResponse.negativeEntityId) {
                const negEntity = await clClient.entitiesGetById(appId, changedEntityResponse.negativeEntityId)
                dispatch(editEntityFulfilled(negEntity))
            }

            // If updated entity has a different resolver, we fetch all entities to make sure 
            // that definition of prebuilt entity is in the memory
            if (entity.resolverType !== prevEntity.resolverType)
            {
                dispatch(fetchAllEntitiesThunkAsync(appId));
            }

            // If any train dialogs were modified fetch train dialogs 
            if (changedEntityResponse.trainDialogIds && changedEntityResponse.trainDialogIds.length > 0) {
                dispatch(fetchAllTrainDialogsThunkAsync(appId));
            }

            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return entity
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_ENTITY_ASYNC))
            throw error
        }
    }
}

//-------------------------------------
// deleteEntity
//-------------------------------------
const deleteEntityAsync = (appId: string, entityId: string): ActionObject => {
    return {
        type: AT.DELETE_ENTITY_ASYNC,
        entityId: entityId,
        appId: appId
    }
}

const deleteEntityFulfilled = (entityId: string): ActionObject => {
    return {
        type: AT.DELETE_ENTITY_FULFILLED,
        entityId: entityId
    }
}

export const deleteEntityThunkAsync = (appId: string, entity: CLM.EntityBase) => {
    return async (dispatch: Dispatch<any>) => {
        const entityId = entity.entityId
        dispatch(deleteEntityAsync(appId, entityId))
        const clClient = ClientFactory.getInstance(AT.DELETE_ENTITY_ASYNC)

        try {
            const deleteEditResponse = await clClient.entitiesDelete(appId, entityId);
            dispatch(deleteEntityFulfilled(entityId))
            if (entity.isNegatible) {
                // If entity is negatable assume it has negativeId
                const negativeEntityId = entity.negativeId!
                dispatch(deleteEntityFulfilled(negativeEntityId))
            }
            
            // If deleted entity is prebuilt entity, we fetch all entities to make sure 
            // that entities in the memory are all up to date
            if (CLM.isPrebuilt(entity)) {
                dispatch(fetchAllEntitiesThunkAsync(appId));
            }
            
            // If any actions were modified, reload them
            if (deleteEditResponse.actionIds && deleteEditResponse.actionIds.length > 0) {
                dispatch(fetchAllActionsThunkAsync(appId))
            }

            // If any train dialogs were modified fetch train dialogs 
            if (deleteEditResponse.trainDialogIds && deleteEditResponse.trainDialogIds.length > 0) {
                dispatch(fetchAllTrainDialogsThunkAsync(appId));
            }

            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
            return true;
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_ENTITY_ASYNC))
            return false;
        }
    }
}

//-------------------------------------
// fetchAllEntities
//-------------------------------------
const fetchAllEntitiesAsync = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_ENTITIES_ASYNC,
        appId: appId
    }
}

const fetchAllEntitiesFulfilled = (entities: CLM.EntityBase[]): ActionObject => {
    return {
        type: AT.FETCH_ENTITIES_FULFILLED,
        allEntities: entities
    }
}

export const fetchAllEntitiesThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ENTITIES_ASYNC)
        dispatch(fetchAllEntitiesAsync(appId))

        try {
            const entities = await clClient.entities(appId)
            dispatch(fetchAllEntitiesFulfilled(entities))
            return entities
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_ENTITIES_ASYNC))
            return null;
        }
    }
}

//-------------------------------------
// fetchEntityDeleteValidation
//-------------------------------------
const fetchEntityDeleteValidationAsync = (appId: string, packageId: string, entityId: string): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        entityId: entityId
    }
}

const fetchEntityDeleteValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_DELETE_VALIDATION_FULFILLED
    }
}

export const fetchEntityDeleteValidationThunkAsync = (appId: string, packageId: string, entityId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC)
        dispatch(fetchEntityDeleteValidationAsync(appId, packageId, entityId))

        try {
            const invalidTrainDialogIds = await clClient.entitiesDeleteValidation(appId, packageId, entityId)
            dispatch(fetchEntityDeleteValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC))
            return null;
        }
    }
}

//-------------------------------------
// fetchEntityEditValidation
//-------------------------------------
const fetchEntityEditValidationAsync = (appId: string, packageId: string, entity: CLM.EntityBase): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        entity: entity
    }
}

const fetchEntityEditValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_EDIT_VALIDATION_FULFILLED
    }
}

export const fetchEntityEditValidationThunkAsync = (appId: string, packageId: string, entity: CLM.EntityBase) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC)
        dispatch(fetchEntityEditValidationAsync(appId, packageId, entity))

        try {
            const invalidTrainDialogIds = await clClient.entitiesUpdateValidation(appId, packageId, entity)
            dispatch(fetchEntityEditValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC))
            return null;
        }
    }
}