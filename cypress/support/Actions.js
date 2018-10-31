/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const actionModal = require('../support/components/ActionModal')
const actionsGrid = require('../support/components/ActionsGrid')
const modelPage = require('../support/components/ModelPage')

TODO: Need to finish comenting this code and verifying it works with all current users of it
// NOTE: Setting an Expected Entity causes the same entity to be placed in the Disqualified Entity field by default
//       Currently this is not an issue but you will see it try to re-add the same Disqualified Entity durring a test run.
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

  // This complication deals with the fact that
  if(!requiredEntities && !requiredEntitiesFromResponse) actionsGrid.ValidateRequiredEntitiesIsEmpty()
  else
  {
    if(!requiredEntities) requiredEntities = requiredEntitiesFromResponse
    else
    {
      if(!Array.isArray(requiredEntities)) requiredEntities = [requiredEntities]
      if(requiredEntitiesFromResponse) requiredEntities.concat(requiredEntitiesFromResponse)
    }
    actionsGrid.ValidateRequiredEntities(requiredEntities)
  }
  
  if(expectedEntities || disqualifyingEntities) actionsGrid.ValidateDisqualifyingEntities(expectedEntities, disqualifyingEntities)
  else actionsGrid.ValidateDisqualifyingEntitiesIsEmpty()

  if(expectedEntities) actionsGrid.ValidateExpectedEntities(expectedEntities)
  else actionsGrid.ValidateExpectedEntitiesIsEmpty()
}
