/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const actionsModal = require('../support/components/ActionsModal')
const actionsGrid = require('../support/components/ActionsGrid')
const modelPage = require('../support/components/ModelPage')

// NOTE: Setting an Expected Entity causes the same entity to be placed in the Disqualified Entity field by default
//       Currently this is not an issue but you will see it try to re-add the same Disqualified Entity durring a test run.
export function CreateNewAction({response, expectedEntities, requiredEntities, disqualifyingEntities, type = 'TEXT' })
{
  modelPage.NavigateToActions()
  actionsModal.ClickNewAction()
  // TODO: this is the default but we need to get this working... actionsModal.selectTypeText()
  actionsModal.TypeResponse(response)
  if(expectedEntities) actionsModal.TypeExpectedEntity(expectedEntities)
  if(requiredEntities) actionsModal.TypeRequiredEntities(requiredEntities)
  if(disqualifyingEntities) actionsModal.TypeDisqualifyingEntities(disqualifyingEntities)
  actionsModal.ClickCreateButton()

  var requiredEntitiesFromResponse = response.match(/(?<=\$)[^ ]+?(?={enter})/g)
  response = response.replace(/{enter}/g, '')
  
  // Set the pre-requisit for all validations for the row.
  actionsGrid.SetResponseDetailsRowAlias(response)

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
  
  if(disqualifyingEntities) actionsGrid.ValidateDisqualifyingEntities(disqualifyingEntities)
  else actionsGrid.ValidateDisqualifyingEntitiesIsEmpty()

  if(expectedEntities) actionsGrid.ValidateExpectedEntities(expectedEntities)
  else actionsGrid.ValidateExpectedEntitiesIsEmpty()
}
