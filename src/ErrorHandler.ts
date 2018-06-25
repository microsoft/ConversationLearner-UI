/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { AT } from './types/ActionTypes'
import { generateGUID } from './util'

export interface ErrorCallback {
    actionType: AT;
    callback: ((actionType: AT) => void);
    guid?: string;
}

export class ErrorHandler {

    static callbacks: ErrorCallback[] = [];

    public static registerCallbacks(callbacks: ErrorCallback[]): string {
        let guid = generateGUID();

        callbacks.forEach(cb => {
            cb.guid = guid;
            this.callbacks.push(cb);
        });

        return guid;
    }

    public static deleteCallbacks(guid: string): void {
        this.callbacks = this.callbacks.filter(cb => cb.guid !== guid);
    }

    public static handleError(actionType: AT) {
        let callbacks = this.callbacks.filter(cb => cb.actionType === actionType);
        callbacks.forEach(cb => cb.callback(actionType));
    }
}