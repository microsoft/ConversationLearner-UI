/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('New Entity Label on Existing Phrase 1 - Entity Labeling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Import a model and wait for training to complete', () => {
      models.ImportModel('z-newEntityLabel1', 'z-newEntityLabel.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('One Instance of the Phrase', () => {
    it('Create a new Train Dialog and add a description for unique identification', () => {
      train.CreateNewTrainDialog()
      train.TypeDescription('Test Generated')
    })

    it('User types a new and unique phrase and labels a word as an Entity', () => {
      train.TypeYourMessage('A totally unique phrase')
      train.LabelTextAsEntity('unique', 'anEntity')
      train.ClickScoreActionsButton()
      train.SelectTextAction('The only response')
    })

    it('User types the same unique phrase but does not label it', () => {
      train.TypeYourMessage('A totally unique phrase')
    })

    it('Change to Previously Submitted Label from prior turn...after we Score Actions', () => {
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(undefined, [{ text: 'unique', entity: 'anEntity' }])
      train.SelectTextAction('The only response')
    })

    it('Verify that both user turns have the expected markup', () => {
      train.VerifyChatTurnIsAnExactMatchWithMarkup('A totally unique phrase', 4, 0)
    })
    
    it('', () => {
    })
    
    it('', () => {
    })
    
    it('', () => {
    })
    
  })
})