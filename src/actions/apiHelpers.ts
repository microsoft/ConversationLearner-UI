import axios, { AxiosPromise, AxiosRequestConfig } from 'axios'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models'

const config: AxiosRequestConfig = {
	headers: {
		"Content-Type": "application/json"
	}
}

const rootUrl: string = "http://localhost:5000/";

export const getAllBlisApps = (): AxiosPromise => {
	const getAppsRoute: string = "apps"
	return axios.get(rootUrl.concat(getAppsRoute), config)
};
export const getBlisApp = (appId: string): AxiosPromise => {
	let getAppRoute: string = `app/${appId}`
	return axios.get(rootUrl.concat(getAppRoute), config)
};
export const getAllEntitiesForBlisApp = (appId: string): AxiosPromise => {
	let getEntitiesForAppRoute: string = `app/${appId}/entities`
	return axios.get(rootUrl.concat(getEntitiesForAppRoute), config)
};
export const getBlisEntity = (appId: string, entityId: string): AxiosPromise => {
	let getEntityRoute: string = `app/${appId}/entity/${entityId}`
	return axios.get(rootUrl.concat(getEntityRoute), config)
};
export const getAllActionsForBlisApp = (appId: string): AxiosPromise => {
	let getActionsForAppRoute: string = `app/${appId}/actions`;
	return axios.get(rootUrl.concat(getActionsForAppRoute), config)
};
export const getBlisAction = (appId: string, actionId: string): AxiosPromise => {
	let getActionRoute: string = `app/${appId}/action/${actionId}`
	return axios.get(rootUrl.concat(getActionRoute), config)
};
export const createBlisApp = (blisApp: BlisAppBase): AxiosPromise => {
	let addAppRoute: string = `app`    //takes an app in the body
	return axios.get(rootUrl.concat(addAppRoute), config)
};
export const createBlisEntity = (appId: string, entity: EntityBase): AxiosPromise => {
	let addEntityRoute: string = `app/${appId}/entity` //takes an entity in the body
	return axios.get(rootUrl.concat(addEntityRoute), config)
};
export const createBlisAction = (appId: string, action: ActionBase): AxiosPromise => {
	let addActionRoute: string = `app/${appId}/action` //takes an action in the body
	return axios.get(rootUrl.concat(addActionRoute), config)
};
export const deleteBlisApp = (appId: string, blisApp: BlisAppBase): AxiosPromise => {
	let deleteAppRoute: string = `app/${appId}` //takes an app in the body
	return axios.get(rootUrl.concat(deleteAppRoute), config)
};
export const deleteBlisEntity = (appId: string, entity: EntityBase): AxiosPromise => {
	let deleteEntityRoute: string = `app/${appId}/entity` //takes an entity in the body
	return axios.get(rootUrl.concat(deleteEntityRoute), config)
};
export const deleteBlisAction = (appId: string, actionId: string, action: ActionBase): AxiosPromise => {
	let deleteActionRoute: string = `app/${appId}/action/${actionId}` //takes an action in the body
	return axios.get(rootUrl.concat(deleteActionRoute), config)
};
export const editBlisApp = (appId: string, blisApp: BlisAppBase): AxiosPromise => {
	let editAppRoute: string = `app/${appId}`//takes an app in the body
	return axios.get(rootUrl.concat(editAppRoute), config)
};
export const editBlisAction = (appId: string, actionId: string, action: ActionBase): AxiosPromise => {
	let editActionRoute: string = `app/${appId}/action/${actionId}` //takes an action in the body
	return axios.get(rootUrl.concat(editActionRoute), config)
};