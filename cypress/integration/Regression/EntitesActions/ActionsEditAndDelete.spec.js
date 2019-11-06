/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as actionsGrid from '../../../support/components/ActionsGrid'
import * as actionModal from '../../../support/components/ActionModal'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Actions Edit and Delete - EntitiesActions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-ActionEditDel', 'z-actionTests.cl')
    })
  })

  context('Verify Disabled & Enabled Action Type Dropdown', () => {
    it('Should edit some existing Actions to verify that the Action Type Dropdown is disabled', () => {
      modelPage.NavigateToActions()
      
      actionsGrid.EditApiAction('LogicWithNoArgslogic(memoryManager)')
      actionModal.VerifyActionTypeDisabled()
      actionModal.ClickCancelButton()

      actionsGrid.EditSetEntityAction('fruits: STRAWBERRY')
      actionModal.VerifyActionTypeDisabled()
      actionModal.ClickCancelButton()

      actionsGrid.EditCardAction('promptquestion:Do you like being questioned?button1:Yesbutton2:No')
      actionModal.VerifyActionTypeDisabled()
      actionModal.ClickCancelButton()

      actionsGrid.EditTextAction('Something extra')
      actionModal.VerifyActionTypeDisabled()
      actionModal.ClickCancelButton()

      actionsGrid.EditEndSessionAction('Goodbye')
      actionModal.VerifyActionTypeDisabled()
    })

    it('Should filter the Train Dialog list to only the 1 that contains the last Action we viewed', () => {
      actionModal.ClickTrainDialogFilterButton()
      train.VerifyActionFilter('Goodbye')
    })

    it('Should edit Train Dialog that caused those Actions to have a disabled Type field and delete it', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('API', 'We are done here.', 'Goodbye')
      train.ClickAbandonDeleteButton()
      train.ClickConfirmAbandonDialogButton()
    })

    it('Should edit some existing Actions to verify that the Action Type Dropdown is enabled', () => {
      modelPage.NavigateToActions()

      actionsGrid.EditApiAction('LogicWithNoArgslogic(memoryManager)')
      actionModal.VerifyActionTypeEnabled()
      actionModal.ClickCancelButton()

      actionsGrid.EditSetEntityAction('fruits: STRAWBERRY')
      actionModal.VerifyActionTypeEnabled()
      actionModal.ClickCancelButton()

      actionsGrid.EditCardAction('promptquestion:Do you like being questioned?button1:Yesbutton2:No')
      actionModal.VerifyActionTypeEnabled()
      actionModal.ClickCancelButton()

      actionsGrid.EditEndSessionAction('Goodbye')
      actionModal.VerifyActionTypeEnabled()
      actionModal.ClickCancelButton()
    })

    it('Should edit 1 existing Action to verify that the Action Type Dropdown is still disabled', () => {
      actionsGrid.EditTextAction('Something extra')
      actionModal.VerifyActionTypeDisabled()
      actionModal.ClickCancelButton()
    })
  })

  context('Action - "Can be deleted - not used in a Train Dialog"', () => {
    it('Should edit an existing action', () => {
      actionsGrid.EditTextAction('Can be deleted - not used in a Train Dialog')
    })

    it('Should verify that delete Action can be canceled', () => {
      actionModal.ClickDeleteButton()
      actionModal.ClickCancelDeleteButton()
    })

    it('Should verify that Action can be deleted', () => {
      actionModal.ClickDeleteButton()
      actionModal.ClickConfirmDeleteButton()
      actionsGrid.VerifyTextActionNotInGrid('Can be deleted - not used in a Train Dialog')
    })
  })

  context('Action - "Something extra"', () => {
    it('Should edit an existing action', () => {
      actionsGrid.EditTextAction('Something extra')
    })

    it('Should verify that delete Action can be canceled', () => {
      actionModal.ClickDeleteButton()
      
      // Bug 2188: Delete Action does not give warning if Action is used in Train Dialog that has errors.
      // When this bug is fixed, the next line of code will fail and should be removed...
      // ...also remove the comment from the other line.
      actionModal.ClickCancelDeleteButton()
      //actionModal.ClickCancelDeleteWithWarningButton()
    })

    it('Should verify that filter Train Dialog on Action button works', () => {
      actionModal.ClickTrainDialogFilterButton()
      train.VerifyActionFilter('Something extra')
      trainDialogsGrid.VerifyListOfTrainDialogs([
        {firstInput: 'My entity: AABBCC', lastInput: 'Error is Intentional', lastResponse: 'Something extra'},
      ])
    })

    it('Should edit the existing action once again', () => {
      modelPage.NavigateToActions()
      actionsGrid.EditTextAction('Something extra')
    })

    it('Should verify that Action can be deleted', () => {
      actionModal.ClickDeleteButton()

      // Bug 2188: Delete Action does not give warning if Action is used in Train Dialog that has errors.
      // When this bug is fixed, the next line of code will fail and should be removed...
      // ...also remove the comment from the other line.
      actionModal.ClickConfirmDeleteButton()
      //actionModal.ClickConfirmDeleteWithWarningButton()

      actionsGrid.VerifyTextActionNotInGrid('Something extra')
    })
  })

  context('Action - "Your entity contains: $entity"', () => {
    it('Should edit an existing action', () => {
      actionsGrid.EditTextAction('Your entity contains: $entity')
    })

    it('Should verify that delete Action can be canceled', () => {
      actionModal.ClickDeleteButton()
      actionModal.ClickCancelDeleteWithWarningButton()
    })

    it('Should verify that filter Train Dialog on Action button works', () => {
      actionModal.ClickTrainDialogFilterButton()
      train.VerifyActionFilter('Your entity contains: $entity')
      trainDialogsGrid.VerifyListOfTrainDialogs([
        {firstInput: 'My entity: AABBCC', lastInput: 'Error is Intentional', lastResponse: ''},
        {firstInput: 'An entity: EEEFFFGGG', lastInput: 'An entity: EEEFFFGGG', lastResponse: 'Your entity contains: $entity'},
      ])
    })

    it('Should edit the existing action once again', () => {
      modelPage.NavigateToActions()
      actionsGrid.EditTextAction('Your entity contains: $entity')
    })

    it('Should verify that Action can be deleted', () => {
      actionModal.ClickDeleteButton()
      actionModal.ClickConfirmDeleteWithWarningButton()
      actionsGrid.VerifyTextActionNotInGrid('Your entity contains: $entity')
    })
  })
})
