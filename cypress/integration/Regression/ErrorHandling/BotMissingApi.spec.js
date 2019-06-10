/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as actionModal from '../../../support/components/ActionModal'
import * as actionsGrid from '../../../support/components/ActionsGrid'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as logDialogsGrid from '../../../support/components/logDialogsGrid'
import * as helpers from '../../../support/Helpers'

describe('Bot Missing API - ErrorHandling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-botMisingApi', 'z-botMisingApi.cl')
    })
  })

  context('Validation', () => {
    it('Should verify that Home link/panel shows an IncidentTriangle and an error message', () => {
      modelPage.VerifyHomeLinkShowsIncidentTriangle()
      modelPage.HomePanel_VerifyErrorMessage('Please check that the correct version of your Bot is running.')
    })
    
    it('Should verify the Action grid shows an IncidentTriangle', () => {
      modelPage.NavigateToActions()
      let actionsGridrow = new actionsGrid.Row('API', 'RandomGreeting')
      actionsGridrow.VerifyIncidentTriangle()
    })
    
    it('Should edit the Action and verify it contains the expected error message', () => {
      let actionsGridrow = new actionsGrid.Row('API', 'RandomGreeting')
      actionsGridrow.EditAction()
      actionModal.VerifyErrorMessage('ERROR: Bot Missing Callback: RandomGreeting')
      actionModal.ClickCancelButtom()
    })

    it('Should verify that the New Train Dialog Button is disabled', () => {
      modelPage.NavigateToTrainDialogs()
      trainDialogsGrid.VerifyNewTrainDialogButtonIsDisabled()
    })

    it('Should verify the Train Dialog shows error and warning messages', () => {
      train.EditTraining('Lets have that greeting.', 'How about some text?', 'Just a simple text action...')
      train.VerifyChatTurnIsAnExactMatch('ERROR: API callback with name “RandomGreeting” is not defined', 6, 1)
      train.VerifyWarningMessage('Running Bot not compatible with this Model')
    })
    
    it('Should verify that the turns have no actionable buttons', () => {
      train.SelectAndVerifyEachChatTurnHasNoButtons()
    })

    it('Should verify the Action Scorer pane has no enabled buttons for any of the Bot turns', () => {
      train.SelectAndVerifyEachBotChatTurnHasNoSelectActionButtons()
    })

    it('Should verify that there only the Close button is enabled', () => {
      train.VerifyCloseIsTheOnlyEnabledButton()
    })
    
    it('Should close the Train Dialog', () => {
      train.ClickSaveCloseButton()
    })

    it('Should verify cannot start a new Log Dialog', () => {
      modelPage.NavigateToLogDialogs()
      logDialogsGrid.VerifyNewLogDialogButtonIsDisabled()
    })
  })
})
