/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const modelPage = require('../support/components/ModelPage')
const entitiesGrid = require('./components/EntitiesGrid')
const entityModal = require('../support/components/EntityModal')

export function CreateNewEntity({name, multiValued, negatable, type = "custom"})
{
  modelPage.NavigateToEntities()
  entitiesGrid.ClickButtonNewEntity()
  if (type != 'custom') SelectEntityType(type)
  if (name) entityModal.TypeEntityName(name)
  if (multiValued) entityModal.ClickMultiValueCheckbox()
  if (negatable) entityModal.ClickNegatableCheckbox()
  entityModal.ClickCreateButton()
  entitiesGrid.VerifyItemInList(name)
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