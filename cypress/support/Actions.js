/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const actionsPage = require('../support/components/actionspage')
const actionsModal = require('../support/components/ActionsModal')
const modelPage = require('../support/components/ModelPage')

export function CreateNewAction({response, expectedEntity = '', requiredEntities = '', disqualifyingEntities = '', type = 'TEXT' })
{
  modelPage.navigateToActions()
  actionsPage.ClickNewAction()
  // TODO: this is the default but we need to get this working... actionsModal.selectTypeText()
  actionsModal.TypeResponse(response)
  actionsModal.TypeExpectedEntity(expectedEntity)
  actionsModal.TypeRequiredEntities(requiredEntities)
  actionsModal.TypeDisqualifyingEntities(disqualifyingEntities)
  actionsModal.ClickCreateButton()
}