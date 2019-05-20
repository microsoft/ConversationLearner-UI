/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as common from '../../../support/Common'
import * as actions from '../../../support/Actions'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as helpers from '../../../support/Helpers'

describe('Missing Action - ErrorHandling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-missingAction', 'z-whatsYourName.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })

    it('Should verify there are no error icons on the page', () => {
      modelPage.VerifyNoIncidentTriangleOnPage()
    })

    it('Should complete and save a simple 1 action Train Dialog', () => {
      train.CreateNewTrainDialog()
      train.TypeYourMessage(common.gonnaDeleteAnAction)
      train.ClickScoreActionsButton()
      train.SelectAction(common.whatsYourName)
      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Action', () => {
    it('Should delete the action we just used in the Train Dialog', () => {
      modelPage.NavigateToActions()
      actions.DeleteAction(common.whatsYourName)
    })
  })

  context('Train Dialogs Grid', () => {
    it('Should verify there are now error icons showing in the Train Dialog grid', () => {
      modelPage.NavigateToTrainDialogs()
      modelPage.VerifyIncidentTriangleForTrainDialogs()
      trainDialogsGrid.VerifyIncidentTriangleFoundInTrainDialogsGrid(common.gonnaDeleteAnAction, common.gonnaDeleteAnAction, '')
    })
  })

  context('Train', () => {
    it('Should edit the Train Dialog and verify the expected error messages show up', () => {
      train.EditTraining(common.gonnaDeleteAnAction, common.gonnaDeleteAnAction, '')
      train.VerifyErrorMessage(common.trainDialogHasErrorsMessage)

      train.SelectChatTurnStartsWith('ERROR: Can’t find Action Id')
      train.VerifyErrorMessage('Action does not exist')
      scorerModal.VerifyMissingActionNotice()
    })

    it('Should create a new action from Train Dialog which should also correct the error in the Train Dialog', () => {
      scorerModal.ClickAddActionButton()
      actions.CreateNewAction({ response: common.whatsYourName, expectedEntities: ['name'] })
      train.VerifyNoErrorMessage()
      train.ClickSaveCloseButton()
      modelPage.VerifyNoIncidentTriangleOnPage()
    })
  })
})