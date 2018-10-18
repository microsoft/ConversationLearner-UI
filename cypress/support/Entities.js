/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const modelPage = require('../support/components/ModelPage')
const entitiesPage = require('./components/EntitiesPage')
const entityModal = require('../support/components/EntityModal')

export function CreateNewEntity({name, multiValued, negatable, type = "custom"})
{
  modelPage.NavigateToEntities()
  entitiesPage.ClickButtonNewEntity()
  if (type != 'custom') SelectEntityType(type)
  if (name) entityModal.TypeEntityName(name)
  if (multiValued) entityModal.ClickMultiValueCheckbox()
  if (negatable) entityModal.ClickNegatableCheckbox()
  entityModal.ClickCreateButton()
  entitiesPage.VerifyItemInList(name)
}

export function SelectEntityType(type)
{
  entityModal.ClickEntityTypeDropdown()
  entityModal.ClickEntityType(type)
}

export const entityTypes = 
[
  "programmatic",
  "datetimeV2",
  "number",
  "ordinal",
  "percentage",
  "temperature",
  "dimension",
  "money",
  "age",
  "url",
  "email",
  "phonenumber",
]