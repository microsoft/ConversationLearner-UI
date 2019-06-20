/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entities from '../../../support/Entities'
import * as entitiesGrid from '../../../support/components/EntitiesGrid'
import * as entityModal from '../../../support/components/EntityModal'
import * as actionsGrid from '../../../support/components/ActionsGrid'
import * as helpers from '../../../support/Helpers'

describe('Edit and Delete Entities - EntitiesActions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-EditDelete', 'z-entityTests.cl')
    })
  })

  context('"name" Entity', () => {
    it('Should edit an existing entity and verify the Entity Type field is disabled', () => {
      modelPage.NavigateToEntities()
      entitiesGrid.EditEntity('name')
      entityModal.VerifyEntityTypeDisabled()
    })

    it('Should verify "Required For Action" tab contains expected Action details', () => {
      entityModal.SelectRequiredForActionsTab()
      actionsGrid.VerifyActionRow('Hey $name', 'TEXT', ['name'], ['sweets', 'want'], undefined, true)
      actionsGrid.VerifyActionRow('Hey $name, what do you really want?', 'TEXT', ['name'], ['want', 'sweets'], 'want', true)
      actionsGrid.VerifyActionRow('name:$name sweets:$sweets want:$want', 'END_SESSION', ['name', 'sweets', 'want'], undefined, undefined, true)
      actionsGrid.VerifyActionRow('prompt', 'CARD', ['name'], undefined, undefined, true, 'question:Hi $name')
      actionsGrid.VerifyActionRow('RenderTheArgs', 'API', ['name', 'sweets', 'want'], undefined, undefined, false, 'RenderTheArgslogic(memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$name"secondArg:"$sweets"thirdArg:"$want"fourthArg:"4"fifthArg:"5"sixthArg:"6"seventhArg:"7"render(result, memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:"$name"secondArg:"$sweets"thirdArg:"$want"fourthArg:"4"fifthArg:"5"sixthArg:"6"seventhArg:"7"')
      actionsGrid.VerifyActionRow("Sorry $name, I can't help you get $want", 'TEXT', ['name', 'want'], undefined, undefined, true)
    })

    it('Should verify "Blocked Actions" tab contains expected Action details', () => {
      entityModal.SelectBlockedActionsTab()
      actionsGrid.VerifyActionRow('Something to do with $name', 'TEXT', undefined, ['name'], undefined, true)
      actionsGrid.VerifyActionRow("What's your name?", 'TEXT', undefined, ['name'], 'name', true)
    })

    it('Should verify that filter Train Dialog on entity button works', () => {
    })
  })

    // it('Should ', () => {
    //   actionsGrid.VerifyActionRow()
    //   actionsGrid.VerifyActionRow()
    //   actionsGrid.VerifyActionRow()
    //   actionsGrid.VerifyActionRow()
    // })

    it('Should ', () => {
    })

    it('Should ', () => {
    })

    it('Should ', () => {
    })

  })
})