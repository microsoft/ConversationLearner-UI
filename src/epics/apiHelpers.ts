import 'rxjs'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models'
import * as Rx from 'rxjs';
import { Observable, Observer } from 'rxjs'

//=========================================================
// CONFIG
//=========================================================

const userId = 'testUser'
const config: AxiosRequestConfig = {
	headers: {
		"Content-Type": "application/json"
	}
}
const rootUrl: string = "http://localhost:5000/";

//=========================================================
// PARAMETER REQUIREMENTS
//=========================================================

export interface BlisAppForUpdate extends BlisAppBase {
	trainingFailureMessage: string;
	trainingRequired: boolean;
	trainingStatus: string;
	latestPackageId: number
}

//=========================================================
// GET ROUTES
//=========================================================

export const getAllBlisApps = (): Observable<AxiosResponse> => {
	const getAppsRoute: string = "apps"
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(getAppsRoute), config))
};
export const getBlisApp = (appId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = `app/${appId}`
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(getAppRoute), config))
};
export const getAllEntitiesForBlisApp = (appId: string): Observable<AxiosResponse> => {
	let getEntitiesForAppRoute: string = `app/${appId}/entities`
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(getEntitiesForAppRoute), config))
};
export const getBlisEntity = (appId: string, entityId: string): Observable<AxiosResponse> => {
	let getEntityRoute: string = `app/${appId}/entity/${entityId}`
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(getEntityRoute), config))
};
export const getAllActionsForBlisApp = (appId: string): Observable<AxiosResponse> => {
	let getActionsForAppRoute: string = `app/${appId}/actions`;
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(getActionsForAppRoute), config))
};
export const getBlisAction = (appId: string, actionId: string): Observable<AxiosResponse> => {
	let getActionRoute: string = `app/${appId}/action/${actionId}`
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(getActionRoute), config))
};

//=========================================================
// CREATE ROUTES
//=========================================================

export const createBlisApp = (blisApp: BlisAppBase): Observable<AxiosResponse> => {
	let addAppRoute: string = `app?userId=${userId}`
	//remove the appId property from the object
	const { appId, ...appToSend } = blisApp
	return Rx.Observable.fromPromise(axios.post(rootUrl.concat(addAppRoute), appToSend, config))
};
export const createBlisEntity = (entity: EntityBase, appId: string, ): Observable<AxiosResponse> => {
	let addEntityRoute: string = `app/${appId}/entity`
	//remove property from the object that the route will not accept
	const { version, packageCreationId, packageDeletionId, entityId, ...entityToSend } = entity;
	return Rx.Observable.fromPromise(axios.post(rootUrl.concat(addEntityRoute), entityToSend, config))
};
export const createBlisAction = (action: ActionBase, appId: string): Observable<AxiosResponse> => {
	let addActionRoute: string = `app/${appId}/action`
	//remove property from the object that the route will not accept
	const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
	return Rx.Observable.fromPromise(axios.post(rootUrl.concat(addActionRoute), actionToSend, config))
};

//=========================================================
// DELETE ROUTES
//=========================================================

export const deleteBlisApp = (blisAppId: string, blisApp: BlisAppForUpdate): Observable<AxiosResponse> => {
	let deleteAppRoute: string = `app/${blisAppId}` //takes an app in the body
	const { appId, latestPackageId, metadata, trainingRequired, trainingStatus, trainingFailureMessage, ...appToSend } = blisApp
	let configWithBody = {...config, body: appToSend}
	return Rx.Observable.fromPromise(axios.delete(rootUrl.concat(deleteAppRoute), configWithBody))
};
export const deleteBlisEntity = (appId: string, entity: EntityBase): Observable<AxiosResponse> => {
	let deleteEntityRoute: string = `app/${appId}/entity`
	const { version, packageCreationId, packageDeletionId, entityId, ...entityToSend } = entity;
	let configWithBody = {...config, body: entityToSend};
	return Rx.Observable.fromPromise(axios.delete(rootUrl.concat(deleteEntityRoute), configWithBody))
};
export const deleteBlisAction = (appId: string, blisActionId: string, action: ActionBase): Observable<AxiosResponse> => {
	let deleteActionRoute: string = `app/${appId}/action/${blisActionId}` 
	const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
	let configWithBody = {...config, body: actionToSend}
	return Rx.Observable.fromPromise(axios.delete(rootUrl.concat(deleteActionRoute), configWithBody))
};

//=========================================================
// EDIT ROUTES
//=========================================================

export const editBlisApp = (blisAppId: string, blisApp: BlisAppForUpdate): Observable<AxiosResponse> => {
	let editAppRoute: string = `app/${blisAppId}`;
	const { appId, latestPackageId, metadata, trainingRequired, trainingStatus, trainingFailureMessage, ...appToSend } = blisApp
	return Rx.Observable.fromPromise(axios.put(rootUrl.concat(editAppRoute), appToSend, config))
};
export const editBlisAction = (appId: string, blisActionId: string, action: ActionBase): Observable<AxiosResponse> => {
	let editActionRoute: string = `app/${appId}/action/${blisActionId}`
	const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
	return Rx.Observable.fromPromise(axios.put(rootUrl.concat(editActionRoute), actionToSend, config))
};