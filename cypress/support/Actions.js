/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const actionsModal = require('../support/components/ActionsModal')
const actionsGrid = require('../support/components/ActionsGrid')
const modelPage = require('../support/components/ModelPage')

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

  actionsGrid.SetResponseDetailsRowAlias(response)

  var requiredEntitiesFromResponse = response.match(/(?<=\$)[^ ]+?(?={enter})/g)
  if(!requiredEntities && !requiredEntitiesFromResponse) actionsGrid.ValidateRequiredEntitiesIsEmpty()
  else
  {
    if(!requiredEntities) requiredEntities = requiredEntitiesFromResponse
    else
    {
      if(!Array.isArray(requiredEntities)) requiredEntities = [requiredEntities]
      if(requiredEntitiesFromResponse) requiredEntities.concat(requiredEntitiesFromResponse)
    }
  }
  

  // TODO: Validate the above in the grid
}
