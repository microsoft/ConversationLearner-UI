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
      cy.pause()
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

  //   it('Should verify that filter Train Dialog on entity button works', () => {
  //     actionModal.ClickTrainDialogFilterButton()
  //     train.VerifyListOfTrainDialogs([
  //       {firstInput: 'Hey', lastInput: 'world peace', lastResponse: "Sorry $name, I can't help you get $want"},
  //       {firstInput: 'I want a car!', lastInput: 'I want a car!', lastResponse: "What's your name?"}
  //     ])
  //   })
    
  // })
})