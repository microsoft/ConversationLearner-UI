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
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Entities Edit and Delete - EntitiesActions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-EntityEditDel', 'z-entityTests.cl')
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
      actionsGrid.VerifyActionRow('promptquestion:Hi $name', 'CARD', ['name'], undefined, undefined, true, 'question:Hi $name')
      actionsGrid.VerifyActionRow('RenderTheArgslogic(memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:$namesecondArg:$sweetsthirdArg:$wantfourthArg:4fifthArg:5sixthArg:6seventhArg:7render(result, memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:$namesecondArg:$sweetsthirdArg:$wantfourthArg:4fifthArg:5sixthArg:6seventhArg:7', 'API', ['name', 'sweets', 'want'], undefined, undefined, false)
      actionsGrid.VerifyActionRow("Sorry $name, I can't help you get $want", 'TEXT', ['name', 'want'], undefined, undefined, true)
    })

    it('Should verify "Blocked Actions" tab contains expected Action details', () => {
      entityModal.SelectBlockedActionsTab()
      actionsGrid.VerifyActionRow('Something to do with $name', 'TEXT', undefined, ['name'], undefined, true)
      actionsGrid.VerifyActionRow("What's your name?", 'TEXT', undefined, ['name'], 'name', true)
    })

    it('Should not be able to delete this entity', () => {
      entityModal.ClickDeleteButton()
      entityModal.ClickCancelButtonOnUnableToDeletePopUp()
    })

    it('Should verify that filter Train Dialog on Entity button works', () => {
      entityModal.ClickTrainDialogFilterButton()
      train.VerifyEntityFilter('name')
      train.VerifyListOfTrainDialogs([
        {firstInput: 'Hey', lastInput: 'world peace', lastResponse: "Sorry $name, I can't help you get $want"}
      ])
    })
  })

  context('"sweets" Entity', () => {
    it('Should edit an existing entity and verify the Entity Type field is disabled', () => {
      modelPage.NavigateToEntities()
      entitiesGrid.EditEntity('sweets')
      entityModal.VerifyEntityTypeDisabled()
    })

    it('Should verify "Required For Action" tab contains expected Action details', () => {
      entityModal.SelectRequiredForActionsTab()
      actionsGrid.VerifyActionRow('name:$name sweets:$sweets want:$want', 'END_SESSION', ['name', 'sweets', 'want'], undefined, undefined, true)
      actionsGrid.VerifyActionRow('RenderTheArgslogic(memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:$namesecondArg:$sweetsthirdArg:$wantfourthArg:4fifthArg:5sixthArg:6seventhArg:7render(result, memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:$namesecondArg:$sweetsthirdArg:$wantfourthArg:4fifthArg:5sixthArg:6seventhArg:7', 'API', ['name', 'sweets', 'want'], undefined, undefined, false)
    })

    it('Should verify "Blocked Actions" tab contains expected Action details', () => {
      entityModal.SelectBlockedActionsTab()
      actionsGrid.VerifyActionRow('Hey $name', 'TEXT', ['name'], ['sweets', 'want'], undefined, true)
      actionsGrid.VerifyActionRow('Hey $name, what do you really want?', 'TEXT', ['name'], ['want', 'sweets'], 'want', true)
    })

    it('Should not be able to delete this entity', () => {
      entityModal.ClickDeleteButton()
      entityModal.ClickCancelButtonOnUnableToDeletePopUp()
    })

    it('Should verify that filter Train Dialog on Entity button works', () => {
      entityModal.ClickTrainDialogFilterButton()
      train.VerifyEntityFilter('sweets')
      train.VerifyListOfTrainDialogs([
        {firstInput: 'I love candy!', lastInput: 'I love candy!', lastResponse: "What's your name?"}
      ])
    })
  })

  context('"want" Entity', () => {
    it('Should edit an existing entity and verify the Entity Type field is disabled', () => {
      modelPage.NavigateToEntities()
      entitiesGrid.EditEntity('want')
      entityModal.VerifyEntityTypeDisabled()
    })

    it('Should verify "Required For Action" tab contains expected Action details', () => {
      entityModal.SelectRequiredForActionsTab()
      actionsGrid.VerifyActionRow('name:$name sweets:$sweets want:$want', 'END_SESSION', ['name', 'sweets', 'want'], undefined, undefined, true)
      actionsGrid.VerifyActionRow('RenderTheArgslogic(memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:$namesecondArg:$sweetsthirdArg:$wantfourthArg:4fifthArg:5sixthArg:6seventhArg:7render(result, memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:$namesecondArg:$sweetsthirdArg:$wantfourthArg:4fifthArg:5sixthArg:6seventhArg:7', 'API', ['name', 'sweets', 'want'], undefined, undefined, false)
      actionsGrid.VerifyActionRow("Sorry $name, I can't help you get $want", 'TEXT', ['name', 'want'], undefined, undefined, true)
    })

    it('Should verify "Blocked Actions" tab contains expected Action details', () => {
      entityModal.SelectBlockedActionsTab()
      actionsGrid.VerifyActionRow('Hey $name', 'TEXT', ['name'], ['sweets', 'want'], undefined, true)
      actionsGrid.VerifyActionRow('Hey $name, what do you really want?', 'TEXT', ['name'], ['want', 'sweets'], 'want', true)
    })

    it('Should not be able to delete this entity', () => {
      entityModal.ClickDeleteButton()
      entityModal.ClickCancelButtonOnUnableToDeletePopUp()
    })

    it('Should verify that filter Train Dialog on Entity button works', () => {
      entityModal.ClickTrainDialogFilterButton()
      train.VerifyEntityFilter('want')
      train.VerifyListOfTrainDialogs([
        {firstInput: 'Hey', lastInput: 'world peace', lastResponse: "Sorry $name, I can't help you get $want"},
        {firstInput: 'I want a car!', lastInput: 'I want a car!', lastResponse: "What's your name?"}
      ])
    })
  })

  context('"canBeDeleted" Entity', () => {
    it('Should edit an existing entity and verify the Entity Type field is disabled', () => {
      modelPage.NavigateToEntities()
      entitiesGrid.EditEntity('canBeDeleted')
      entityModal.VerifyEntityTypeDisabled()
    })

    it('Should verify "Required For Action" tab contains expected Action details', () => {
      entityModal.SelectRequiredForActionsTab()
      entityModal.VerifyEmptyGrid()
    })

    it('Should verify "Blocked Actions" tab contains expected Action details', () => {
      entityModal.SelectBlockedActionsTab()
      entityModal.VerifyEmptyGrid()
    })

    it('Should delete this entity and verify that it is no longer in the grid', () => {
      entityModal.ClickDeleteButton()
      entityModal.ClickConfirmButtonOnDeleteConfirmWithWarningPopUp()
      entitiesGrid.VerifyEntityNotInGrid('canBeDeleted')
    })
  })

  context('"canBeDeletedToo" Entity', () => {
    it('Should edit an existing entity and verify the Entity Type field is disabled', () => {
      modelPage.NavigateToEntities()
      entitiesGrid.EditEntity('canBeDeletedToo')
      entityModal.VerifyEntityTypeDisabled()
    })

    it('Should verify "Required For Action" tab contains expected Action details', () => {
      entityModal.SelectRequiredForActionsTab()
      entityModal.VerifyEmptyGrid()
    })

    it('Should verify "Blocked Actions" tab contains expected Action details', () => {
      entityModal.SelectBlockedActionsTab()
      entityModal.VerifyEmptyGrid()
    })

    it('Should be able to delete this entity and cancel when prompted to confirm', () => {
      entityModal.ClickDeleteButton()
      entityModal.ClickCancelButtonOnDeleteConfirmWithWarningPopUp()
    })

    it('Should verify that filter Train Dialog on Entity button works', () => {
      entityModal.ClickTrainDialogFilterButton()
      train.VerifyEntityFilter('canBeDeletedToo')
      train.VerifyListOfTrainDialogs([
        {firstInput: 'We will delete this entity.', lastInput: 'Will also delete this entity.', lastResponse: "What's your name?"}
      ])
    })

    it('Should edit Train Dialog and delete it', () => {
      train.EditTraining('We will delete this entity.', 'Will also delete this entity.', "What's your name?")
      train.ClickAbandonDeleteButton()
      train.ClickConfirmAbandonDialogButton()
    })

    it('Should edit the entity and verify that we can delete and cancel when prompted to confirm without a warning message', () => {
      modelPage.NavigateToEntities()
      entitiesGrid.EditEntity('canBeDeletedToo')
      entityModal.ClickDeleteButton()
      entityModal.ClickCancelButtonOnDeleteConfirmPopUp()
    })

    it('Should verify that we can delete it with only a confirmation and no warning message', () => {
      entityModal.ClickDeleteButton()
      entityModal.ClickConfirmButtonOnDeleteConfirmPopUp()
      entitiesGrid.VerifyEntityNotInGrid('canBeDeletedToo')
    })
  })
})