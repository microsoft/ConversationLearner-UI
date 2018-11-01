/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const actionModal = require('../support/components/ActionModal')
const actionsGrid = require('../support/components/ActionsGrid')
const modelPage = require('../support/components/ModelPage')

// The UI automatically populates the Required Entities field with entities found in the response text and
// it also automatically populates the Disqualtifying Entities field with the expected entities,
// so the caller only needs to specify the ones the UI does not auto populate.
// However, there are cases where the caller may want to explicitly specify these autopopulated values anyway,
// so this code does allow for that.
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

  var requiredEntitiesFromResponse = response.match(/(?<=\$)[^ ]+?(?={enter})/g)
  response = response.replace(/{enter}/g, '')
  
  // Get the row that we are going to validate and assign a Cypress Alias to it
  actionsGrid.GetRowToBeValidated(response)

  // if(!requiredEntities && !requiredEntitiesFromResponse) actionsGrid.ValidateRequiredEntitiesIsEmpty()
  // else 
  actionsGrid.ValidateRequiredEntities(requiredEntitiesFromResponse, requiredEntities)
  
  // if(!expectedEntities && !disqualifyingEntities) actionsGrid.ValidateDisqualifyingEntitiesIsEmpty()
  // else 
  actionsGrid.ValidateDisqualifyingEntities(expectedEntities, disqualifyingEntities)

  // if(!expectedEntities) actionsGrid.ValidateExpectedEntitiesIsEmpty()
  // else 
  actionsGrid.ValidateExpectedEntities(expectedEntities)
}
