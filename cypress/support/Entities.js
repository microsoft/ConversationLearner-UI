/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const modelPage = require('../support/components/ModelPage')
const entitiesPage = require('../support/components/entitiespage')
const entityModal = require('../support/components/entitymodal')

export function CreateNewEntity(entityName)
{
  modelPage.navigateToEntities()
  entitiesPage.clickButtonNewEntity()
  entityModal.typeEntityName(entityName)
  entityModal.clickCreateButton()
  entitiesPage.verifyItemInList(entityName)
}