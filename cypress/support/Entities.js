/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const modelPage = require('../support/components/ModelPage')
const entitiesPage = require('./components/EntitiesPage')
const entityModal = require('../support/components/EntityModal')

export function CreateNewEntity(entityName)
{
  modelPage.NavigateToEntities()
  entitiesPage.ClickButtonNewEntity()
  entityModal.TypeEntityName(entityName)
  entityModal.ClickCreateButton()
  entitiesPage.VerifyItemInList(entityName)
}