/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { AT } from './types/ActionTypes'

export interface ErrorCallback {
    actionType: AT;
    callback: ((actionType: AT) => void);
    guid?: string;
}

export class ErrorInjector {

    private static disabledActions: string[] = [];
    
    public static SetError(actionType: string, enabled: boolean) {
        if (enabled) {
            ErrorInjector.disabledActions.push(actionType);
        }
        else {
            ErrorInjector.disabledActions = ErrorInjector.disabledActions.filter(s => s != actionType);
        }
    }

    public static ShouldError(actionType: AT) {
        return (ErrorInjector.disabledActions.find(s => s == AT[AT[actionType]]) != null)
    }
    
}