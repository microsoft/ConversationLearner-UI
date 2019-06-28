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
import * as actionModal from '../../../support/components/ActionModal'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Actions Edit and Delete - EntitiesActions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-ActionEditDel', 'z-actionTests.cl')
    })
  })

  context('Action - "Can be deleted - not used in a Train Dialog"', () => {
    it('Should edit an existing action', () => {
      modelPage.NavigateToActions()
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
      modelPage.NavigateToActions()
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
      train.VerifyListOfTrainDialogs([
        {firstInput: 'My entity: AABBCC', lastInput: 'My entity: AABBCC', lastResponse: 'Something extra'},
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
      modelPage.NavigateToActions()
      actionsGrid.EditTextAction('Your entity contains: $entity')
    })

    it('Should verify that delete Action can be canceled', () => {
      actionModal.ClickDeleteButton()
      actionModal.ClickCancelDeleteWithWarningButton()
    })

    it('Should verify that filter Train Dialog on Action button works', () => {
      actionModal.ClickTrainDialogFilterButton()
      train.VerifyListOfTrainDialogs([
        {firstInput: 'My entity: AABBCC', lastInput: 'My entity: AABBCC', lastResponse: ''},
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