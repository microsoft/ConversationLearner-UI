/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as train from '../../support/Train'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
import * as helpers from '../../support/Helpers'

describe('Consistent Entity Labeling', () => {
  const textEntityPairs = [{ text: 'Tag', entity: 'multi' }, { text: 'Frog', entity: 'multi' }]

  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Import a model, wait for training to complete and start a new Train Dialog', () => {
      models.ImportModel('z-temp', 'temp-cnstntEntLabel.cl')
      modelPage.NavigateToTrainDialogs()
      //cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Edit and Preserve Attempted Labels', () => {
    it('Edit the Train Dialog that got changed', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('This is Tag.', 'This is Tag.', 'Hi')
      cy.wait(5000)
    })

    it('Select the user turn and verify there is an error message', () => {
      chatPanel.SelectChatTurnExactMatch('This is Tag.')
    })

    it('Re-lable the entities to set things right in this Train Dialog', () => {
      entityDetectionPanel.LabelTextAsEntity('Frog', 'multi', 1)
      entityDetectionPanel.LabelTextAsEntity('Tag', 'multi', 1)
    })

    it('', () => {
    })

    it('', () => {
    })
  })
})