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
export function CreateNewAction({response, expectedEntities, requiredEntities, disqualifyingEntities, uncheckWaitForResponse, type = 'TEXT' })
{
  modelPage.NavigateToActions()
  actionModal.ClickNewAction()
  // TODO: this is the default but we need to get this working... actionsModal.selectTypeText()
  actionModal.TypeResponse(response)
  actionModal.TypeExpectedEntity(expectedEntities)
  actionModal.TypeRequiredEntities(requiredEntities)
  actionModal.TypeDisqualifyingEntities(disqualifyingEntities)
  if (uncheckWaitForResponse) actionModal.UncheckWaitForResponse()
  actionModal.ClickCreateButton()

  var requiredEntitiesFromResponse = ExtractEntities(response)
  response = response.replace(/{enter}/g, '')
  
  // Get the row that we are going to validate and assign a Cypress Alias to it.
  // If we skip this step, the validations that follow will fail.
  actionsGrid.GetRowToBeValidated(response)

  actionsGrid.ValidateRequiredEntities(requiredEntitiesFromResponse, requiredEntities)
  actionsGrid.ValidateDisqualifyingEntities(expectedEntities, disqualifyingEntities)
  actionsGrid.ValidateExpectedEntities(expectedEntities)
}

// Input string looks something like this: "Sorry $name{enter}, I can't help you get $want{enter}"
// Returns an array containing entities like this: ['name', 'want']
export function ExtractEntities(response)
{
  var entitiesToReturn = new Array()
  var iCurrent = 0
  
  while (iCurrent < response.length)
  {
    var iStart = response.indexOf('$', iCurrent)
    if (iStart < 0) break;
    iStart ++
    
    var iEnd = response.indexOf('{enter}', iStart)
    if (iEnd < 0) break;

    var entityName = response.substring(iStart, iEnd)
    
    if (!IsAlphaNumeric(entityName)) iCurrent = iStart
    else
    {
      entitiesToReturn.push(entityName)
      iCurrent = iEnd + 7 // 7 = "{enter}".length
    }
  }
  
  return entitiesToReturn
}

export function IsAlphaNumeric(string)
{
  for (var i = 0; i < string.length; i++) 
  {
    var charCode = string.charCodeAt(i)
    if (!(charCode > 47 && charCode < 58) &&  // numeric (0-9)
        !(charCode > 64 && charCode < 91) &&  // upper alpha (A-Z)
        !(charCode > 96 && charCode < 123))   // lower alpha (a-z)
        return false
  } 
  return true
}