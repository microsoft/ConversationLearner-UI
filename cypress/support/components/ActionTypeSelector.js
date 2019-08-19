/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

export const pairs = [
  {type: 'TEXT', selector: '[data-testid="action-scorer-text-response"]'},
  {type: 'API', selector: '[data-testid="action-scorer-api"]'},
  {type: 'END_SESSION', selector: '[data-testid="action-scorer-session-response-user"]'},
  {type: 'CARD', selector: '[data-testid="action-scorer-card"]'},
  {type: 'SET_ENTITY', selector: '[data-testid="actions-list-set-entity"], [data-testid="action-scorer-action-set-entity"]'},
  {type: 'MISSING ACTION', selector: '[data-testid="action-scorer-action-set-entity"]'},
]

export function GetSelector(actionType) { 
  let typeSelectorPair = pairs.find(typeSelectorPair => typeSelectorPair.type === actionType) 
  if (!typeSelectorPair) { throw new Error(`Test Code Error - Unrecognized type: '${actionType}'`) }
  
  return typeSelectorPair.selector
}