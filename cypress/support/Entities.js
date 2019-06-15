/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as modelPage from '../support/components/ModelPage'
import * as entitiesGrid from './components/EntitiesGrid'
import * as entityModal from '../support/components/EntityModal'

export function CreateNewEntity({ 
    name, 
    multiValued, 
    negatable, 
    resolverType, 
    type = 'Custom Trained', 
    expectPopup = false 
  }) {
  modelPage.NavigateToEntities()
  entitiesGrid.ClickButtonNewEntity()

  if (type != 'Custom Trained') SelectEntityType(type)
  if (name) { entityModal.TypeEntityName(name) }
  if (multiValued) { entityModal.ClickMultiValueCheckbox() }
  if (negatable) { entityModal.ClickNegatableCheckbox() }
  if (resolverType) { entityModal.SelectResolverType(resolverType) }

  entityModal.ClickCreateButton()
  if (expectPopup || (type != 'Custom Trained' && type != 'Programmatic')) entityModal.ClickOkButtonOnNoteAboutPreTrained()
}

export function CreateNewEntityThenVerifyInGrid({ 
    name, 
    multiValued, 
    negatable, 
    resolverType, 
    type = 'Custom Trained', 
    expectPopup = false 
  }) {

  CreateNewEntity(arguments[0])

  let entitiesGridRow
  if (name) { entitiesGridRow = new entitiesGrid.Row(name) }
  else { entitiesGridRow = new entitiesGrid.Row(`builtin-${type.toLowerCase()}`) }

  //entitiesGridRow.VerifyType(type)

  if (resolverType) { entitiesGridRow.VerifyResolverType(resolverType) }
  else { entitiesGridRow.VerifyResolverNone() }

  if (multiValued) { entitiesGridRow.VerifyMultiValueChecked() }
  else { entitiesGridRow.VerifyMultiValueUnChecked() }

  if (negatable) { entitiesGridRow.VerifyNegatableChecked() }
  else { entitiesGridRow.VerifyNegatableUnChecked() }
}

export function SelectEntityType(type) {
  entityModal.ClickEntityTypeDropdown()
  entityModal.ClickEntityType(type)
}

export const pretrainedEntityTypes = [
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