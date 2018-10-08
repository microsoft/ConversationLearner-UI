/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const modelPage = require('../support/components/ModelPage')
const entitiesPage = require('./components/EntitiesPage')
const entityModal = require('../support/components/EntityModal')

export function CreateNewEntity({name, programaticOnly, multiValued, negatable, type = "custom"})
{
  modelPage.NavigateToEntities()
  entitiesPage.ClickButtonNewEntity()
  entityModal.TypeEntityName(name)
  if (programaticOnly) entityModal.ClickProgrammaticOnlyCheckbox()
  if (multiValued) entityModal.ClickMultiValueCheckbox()
  if (negatable) entityModal.ClickNegatableCheckbox()
  entityModal.ClickCreateButton()
  entitiesPage.VerifyItemInList(name)
}