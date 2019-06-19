/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as modelPage from '../support/components/ModelPage'
import * as entitiesGrid from './components/EntitiesGrid'
import * as entityModal from '../support/components/EntityModal'

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

export function CreateNewEntity({ 
    name, 
    multiValued, 
    negatable, 
    resolverType, 
    type = 'Custom Trained', 
    expectPopup 
  }) {
  modelPage.NavigateToEntities()
  entitiesGrid.ClickButtonNewEntity()

  if (type != 'Custom Trained') SelectEntityType(type)
  if (name) { entityModal.TypeEntityName(name) }
  if (multiValued) { entityModal.ClickMultiValueCheckbox() }
  if (negatable) { entityModal.ClickNegatableCheckbox() }
  if (resolverType) { entityModal.SelectResolverType(resolverType) }

  entityModal.ClickCreateButton()
  if (expectPopup) { entityModal.ClickOkButtonOnNoteAboutPreTrained() }
}

export function CreateNewEntityThenVerifyInGrid({ 
    name, 
    multiValued, 
    negatable, 
    resolverType, 
    type = 'Custom Trained', 
    expectPopup 
  }) {

  CreateNewEntity(arguments[0])

  let entitiesGridRow
  if (name) { entitiesGridRow = new entitiesGrid.Row(name) }
  else { entitiesGridRow = new entitiesGrid.Row(`builtin-${type.toLowerCase()}`) }

  let typeForVerification = type
  if (type == 'Custom Trained') { typeForVerification = 'CUSTOM' }
  else if (type == 'Programmatic') { typeForVerification = 'PROGRAMMATIC' }
  entitiesGridRow.VerifyType(typeForVerification)

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

