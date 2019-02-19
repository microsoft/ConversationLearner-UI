/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const actionModal = require('../support/components/ActionModal')
const actionsGrid = require('../support/components/ActionsGrid')
const modelPage = require('../support/components/ModelPage')
const helpers = require('../support/Helpers')

// The UI automatically populates the Required Entities field with entities found in the response text and
// it also automatically populates the Disqualtifying Entities field with the expected entities,
// so the caller only needs to specify the ones the UI does not auto populate.
// However, there are cases where the caller may want to explicitly specify these autopopulated values anyway,
// and this code does allow for that.
export function CreateNewAction({ response, expectedEntities, requiredEntities, disqualifyingEntities, uncheckWaitForResponse, type = 'TEXT' }) {
  modelPage.NavigateToActions()
  actionsGrid.ClickNewAction()

  // We do this first since we had a bug (1910) where it is not reset by the UI when
  // type END_SESSION is selected.
  if (uncheckWaitForResponse) actionModal.UncheckWaitForResponse()

  actionModal.SelectType(type)
  actionModal.TypeResponse(response)
  if (expectedEntities) actionModal.TypeExpectedEntity(expectedEntities)
  if (requiredEntities) actionModal.TypeRequiredEntities(requiredEntities)
  if (disqualifyingEntities) actionModal.TypeDisqualifyingEntities(disqualifyingEntities)
  actionModal.ClickCreateButton()

  let requiredEntitiesFromResponse = ExtractEntities(response)
  response = response.replace(/{enter}/g, '')

  // Get the row that we are going to validate and assign a Cypress Alias to it.
  // If we skip this step, the validations that follow will fail.
  if (type === 'END_SESSION') actionsGrid.GetEndSessionRowToBeValidated(response)
  else actionsGrid.GetRowToBeValidated(response)

  actionsGrid.ValidateRequiredEntities(requiredEntitiesFromResponse, requiredEntities)
  actionsGrid.ValidateDisqualifyingEntities(expectedEntities, disqualifyingEntities)
  actionsGrid.ValidateExpectedEntities(expectedEntities)
  
  // Type END_SESSION must have "Wait for Response" checked even if user unchecks it.
  // TODO: When bug 1910 is fixed tests using this function and END_SESSION will fail,
  //       when that happens uncomment the next line and remove the following one.
  //actionsGrid.ValidateWaitForResponse((type === 'END_SESSION') || !uncheckWaitForResponse)
  actionsGrid.ValidateWaitForResponse(!uncheckWaitForResponse)
}

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
    let charCode = string.charCodeAt(i)
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