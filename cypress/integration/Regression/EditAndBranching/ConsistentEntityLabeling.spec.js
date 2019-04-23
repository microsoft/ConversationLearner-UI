/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'
import * as helpers from '../../support/Helpers'

describe('Consistent Entity Labeling - Edit And Branching', () => {
  const textEntityPairs = [{text: 'Tag', entity: 'multi'}, {text: 'Frog', entity: 'multi'}]

  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-cnstntEntLabel', 'z-cnstntEntLabel.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Edit Train Dialog', () => {
    it('Should edit the training and verify the entities are labeled', () => {
      train.EditTraining('This is Tag.', 'This is Tag.', 'Hi')
      train.SelectChatTurnExactMatch('This is Tag.')

      train.VerifyEntityLabelWithinSpecificInput([textEntityPairs[0]], 0)
      train.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
      train.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)
    })

    it('Should remove two entity labels from alternative input', () => {
      train.RemoveEntityLabel('Tag', 'multi', 1)
      train.RemoveEntityLabel('Frog', 'multi', 2)
    })
    
    it('Should verify user cannot submit changes without accepting auto-re-labling of the 1st alternative input that we changed', () => {
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
    })

    it('Should verify user cannot submit changes without accepting auto-re-labling of the 2nd alternative input that we changed', () => {
      train.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
    })

    it('Should abandon the changes', () => {
      train.AbandonDialog()
    })
  })
})