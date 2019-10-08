/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as memoryTableComponent from '../../../support/components/MemoryTableComponent'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as train from '../../../support/Train'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('Create many TDs for New Entity Label test - Train Dialog', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Import a model and wait for training to complete', () => {
      models.ImportModel('z-newEntityLabel', 'z-newEntityLabel.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Create many TDs', () => {
    it('', () => {
    })
    
    it('', () => {
    })
    
    it('', () => {
    })
    
    it('', () => {
    })
    
    it('', () => {
    })
    
    it('', () => {
    })
    
    it('', () => {
    })
    

  })
})