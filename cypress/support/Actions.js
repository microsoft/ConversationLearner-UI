/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as actionModal from '../support/components/ActionModal'
import * as actionsGrid from '../support/components/ActionsGrid'
import * as modelPage from '../support/components/ModelPage'
import * as helpers from '../support/Helpers'

// ------------------------------------------------------------------------------------------------
// The UI automatically populates the Required Entities field with entities found in the response 
// text and it also automatically populates the Disqualtifying Entities field with the expected 
// entities, so the caller only needs to specify the ones the UI does not auto populate.
// However, there are cases where the caller may want to explicitly specify these autopopulated 
// values anyway, and this code does allow for that.

export function CreateNewAction({ 
    responseNameData, // TEXT-response, API-name, CARD-name, END_SESSION-data
    expectedEntities, 
    requiredEntities, 
    disqualifyingEntities, 
    uncheckWaitForResponse, 
    logicArgs,  // provide an array of strings
    renderArgs, // provide an array of strings
    type = 'TEXT'
  }) {
  // We do this first since we had a bug (1910) where it is not reset by the UI when
  // type END_SESSION is selected.
  if (uncheckWaitForResponse) actionModal.UncheckWaitForResponse()

  actionModal.SelectType(type)
  switch(type) {
    case 'TEXT': 
      actionModal.TypeResponse(responseNameData)
      break;
    case 'API':
      actionModal.SelectApi(responseNameData)
      if (logicArgs) actionModal.TypeApiLogicArgs(logicArgs)
      if (renderArgs) actionModal.TypeApiRenderArgs(renderArgs)
      break;
  }
  if (expectedEntities) actionModal.TypeExpectedEntity(expectedEntities)
  if (requiredEntities) actionModal.TypeRequiredEntities(requiredEntities)
  if (disqualifyingEntities) actionModal.TypeDisqualifyingEntities(disqualifyingEntities)
  actionModal.ClickCreateButton()
}
 
export function CreateNewActionThenVerifyInGrid({ 
    responseNameData, // TEXT-response, API-name, CARD-name, END_SESSION-data
    expectedEntities, 
    requiredEntities, 
    disqualifyingEntities, 
    uncheckWaitForResponse, 
    logicArgs,  // provide an array of strings
    renderArgs, // provide an array of strings
    type = 'TEXT',
    validateResponse: validateApiResponse  // The easiest way to get this is from the logs after a test run...search for 'ValidateApi'
  }) {
  modelPage.NavigateToActions()
  actionsGrid.ClickNewAction()

  CreateNewAction(arguments[0])

  const joined = (responseNameData ? responseNameData : '') + (logicArgs ? logicArgs.join() : '') + (renderArgs ? renderArgs.join() : '')
  const requiredEntitiesFromResponse = ExtractEntities(joined)

  responseNameData = responseNameData.replace(/{enter}/g, '')

  // Get the row that we are going to validate and assign a Cypress Alias to it.
  // If we skip this step, the validations that follow will fail.
  actionsGrid.GetRowToBeValidated(type, responseNameData)
  
  if (validateApiResponse) actionsGrid.ValidateApi(validateApiResponse)
  actionsGrid.ValidateActionType(type)
  actionsGrid.ValidateRequiredEntities(requiredEntitiesFromResponse, requiredEntities)
  actionsGrid.ValidateDisqualifyingEntities(expectedEntities, disqualifyingEntities)
  actionsGrid.ValidateExpectedEntities(expectedEntities)
  
  // Type END_SESSION must have "Wait for Response" checked even if uncheckWaitForResponse is true.
  actionsGrid.ValidateWaitForResponse((type === 'END_SESSION') || !uncheckWaitForResponse)
}

// ------------------------------------------------------------------------------------------------

// Input string looks something like this: "Sorry $name{enter}, I can't help you get $want{enter}"
// Returns an array containing entities like this: ['name', 'want']
// ...OR...Returns an empty array if there are no entities in the response string.
function ExtractEntities(response) {
  let entitiesToReturn = []
  let iCurrent = 0

  while (iCurrent < response.length) {
    let iStart = response.indexOf('$', iCurrent)
    if (iStart < 0) break
    iStart++

    let iEnd = response.indexOf('{enter}', iStart)
    if (iEnd < 0) break

    let entityName = response.substring(iStart, iEnd)

    if (!IsAlphaNumeric(entityName)) iCurrent = iStart
    else {
      entitiesToReturn.push(entityName)
      let length = "{enter}".length
      iCurrent = iEnd + length
    }
  }

  return entitiesToReturn
}

function IsAlphaNumeric(string) {
  for (let i = 0; i < string.length; i++) {
    const charCode = string.charCodeAt(i)
    if (!(charCode > 47 && charCode < 58) &&  // numeric (0-9)
      !(charCode > 64 && charCode < 91) &&  // upper alpha (A-Z)
      !(charCode > 96 && charCode < 123))   // lower alpha (a-z)
      return false
  }
  return true
}

export function DeleteAction(action) {
  actionsGrid.Edit(action)
  actionModal.ClickDeleteButton()
  actionModal.ClickConfirmButtom()
}