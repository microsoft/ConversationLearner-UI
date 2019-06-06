/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as actionsGrid from '../../../support/components/ActionsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Bot Model Mismatch - ErrorHandling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-wrongBot', 'z-botModelMismatch.cl')
    })
  })

  context('Validation', () => {
    it('Should verify that Home link/panel shows an IncidentTriangle and an error message', () => {
      modelPage.VerifyHomeLinkShowsIncidentTriangle()
      modelPage.HomePanel_VerifyErrorMessage('Please check that the correct version of your Bot is running.')
    })

    it('Should verify the Action grid shows an IncidentTriangle', () => {
      // data-testid="action-scorer-api-name" contains RandomGreeting
      //    parent data-testid="action-details-error"
      //    contains data-icon-name="IncidentTriangle"
      modelPage.NavigateToActions()
      let actionsGridrow = new actionsGrid.Row('API', 'RandomGreeting')
      actionsGridrow.VerifyIncidentTriangle()
    })
    
    it('Should verify the Train Dialog shows error and warning messages', () => {
      // Both Train and Log dialog has these same two...
      // turn 1 --- ERROR: API callback with name “RandomGreeting” is not defined
      // data-testid="dialog-modal-warning" contains Running Bot not compatible with this Model
      modelPage.NavigateToTrainDialogs()
      train.EditTraining('Lets have that greeting.', 'Lets have that greeting.', 'RandomGreeting')
      train.VerifyWarningMessage('Running Bot not compatible with this Model')
      train.ClickSaveCloseButton()
    })

    it('Should verify the Log Dialog shows error and warning messages', () => {
      // Both Train and Log dialog has these same two...
      // turn 1 --- ERROR: API callback with name “RandomGreeting” is not defined
      // data-testid="dialog-modal-warning" contains Running Bot not compatible with this Model
      modelPage.NavigateToLogDialogs()
      train.EditTraining('Lets have that greeting.', 'Lets have that greeting.', 'RandomGreeting')
      train.VerifyWarningMessage('Running Bot not compatible with this Model')
      train.ClickSaveCloseButton()
    })
  })
})
