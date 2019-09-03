/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as actionModal from '../../../support/components/ActionModal'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as train from '../../../support/Train'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Bug 2259 Repro', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-bug2259', 'z-comprehensive4.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Attempt to reproduce Bug 2259', () => {
    it('Edit existing Train Dialog', () => {
      train.EditTraining('Hi', 'Mangoes and Peaches', 'Goodbye')
    })

    it('Select a Bot Turn, + Action + Entity - Create an Enum Entity', () => {
      train.SelectChatTurnExactMatch('What kind of fruit do you like?')
      scorerModal.ClickAddActionButton()
      actionModal.ClickAddEntityButton()
      entities.CreateNewEntity({ type: 'Enum', name: 'anEnum', enumValues: ['ONE', 'TWO'] })
    })

    // Bug 2259: Adding a new Enum Entity from Train Dialog -> Add Action Cause UI to Crash
    // Once this bug is fixed comment out this block of code and uncomment the next block
    it('Verify that Bug 2259 reproduced', () => {
      cy.WaitForStableDOM()
      cy.wrap(1, {timeout: 15000}).should(() => {
        const element = Cypress.$('[data-testid="action-creator-cancel-button"]')[0]
        if (Cypress.$(element).is(':visible')) {
          throw new Error('Retry and wait for error message to show up')
        }
      })
    })
    
    // This code should work once bug 2259 is fixed...
    // Uncomment this and comment out the above to detect a regression.
    // it('Verify that Bug 2259 did not reproduce', () => {
    //   actionModal.ClickCancelButton()
    // })
  })
})
