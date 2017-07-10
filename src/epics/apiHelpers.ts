import 'rxjs'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models'
import * as Rx from 'rxjs';
import { Observable, Observer } from 'rxjs'

//=========================================================
// CONFIG
//=========================================================

const config: AxiosRequestConfig = {
	headers: {
		"Content-Type": "application/json"
	}
}
const rootUrl: string = "http://localhost:5000/";

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
	console.log("In api helper entity route and appId is:", appId)
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
	let addAppRoute: string = `app`    //takes an app in the body
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(addAppRoute), config))
};
export const createBlisEntity = (appId: string, entity: EntityBase): Observable<AxiosResponse> => {
	let addEntityRoute: string = `app/${appId}/entity` //takes an entity in the body
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(addEntityRoute), config))
};
export const createBlisAction = (appId: string, action: ActionBase): Observable<AxiosResponse> => {
	let addActionRoute: string = `app/${appId}/action` //takes an action in the body
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(addActionRoute), config))
};

//=========================================================
// DELETE ROUTES
//=========================================================

export const deleteBlisApp = (appId: string, blisApp: BlisAppBase): Observable<AxiosResponse> => {
	let deleteAppRoute: string = `app/${appId}` //takes an app in the body
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(deleteAppRoute), config))
};
export const deleteBlisEntity = (appId: string, entity: EntityBase): Observable<AxiosResponse> => {
	let deleteEntityRoute: string = `app/${appId}/entity` //takes an entity in the body
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(deleteEntityRoute), config))
};
export const deleteBlisAction = (appId: string, actionId: string, action: ActionBase): Observable<AxiosResponse> => {
	let deleteActionRoute: string = `app/${appId}/action/${actionId}` //takes an action in the body
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(deleteActionRoute), config))
};

//=========================================================
// EDIT ROUTES
//=========================================================

export const editBlisApp = (appId: string, blisApp: BlisAppBase): Observable<AxiosResponse> => {
	let editAppRoute: string = `app/${appId}`//takes an app in the body
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(editAppRoute), config))
};
export const editBlisAction = (appId: string, actionId: string, action: ActionBase): Observable<AxiosResponse> => {
	let editActionRoute: string = `app/${appId}/action/${actionId}` //takes an action in the body
	return Rx.Observable.fromPromise(axios.get(rootUrl.concat(editActionRoute), config))
};