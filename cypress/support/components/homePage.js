/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

 export function visit()                        { cy.visit('http://localhost:5050') }
 export function navigateToModelPage(modelName) { cy.Get('button.root-65').contains(`${modelName}`).Click() }

 

