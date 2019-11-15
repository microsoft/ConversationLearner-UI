/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Duplicate Entity Labels - ErrorHandling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-dupEntLabel', 'z-dupEntLabel.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Create Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })

    it('Type in a user utterance and label some of the text', () => {
      train.TypeYourMessage('My name is Joe Schmo')
      entityDetectionPanel.LabelTextAsEntity('Joe', 'name')
      entityDetectionPanel.LabelTextAsEntity('Schmo', 'name')
    })

    it('Verify the warning message in the Entity label panel comes up.', () => {
      entityDetectionPanel.VerifyDuplicateEntityLabelsWarning('name')
    })

    it('Duplicate label more of the text', () => {
      entityDetectionPanel.LabelTextAsEntity('My', 'word')
      entityDetectionPanel.LabelTextAsEntity('name', 'word')
    })

    it('Verify the warning message in the Entity label panel changes.', () => {
      entityDetectionPanel.VerifyDuplicateEntityLabelsWarning('word, name')
    })

    it('Score Action and save Train Dialog', () => {
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hello Schmo')
      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Edit Train Dialog', () => {
    it('Re-edit the same Train Dialog', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('My name is Joe Schmo', 'My name is Joe Schmo', 'Hello $name')
    })

    it('Verify warning message under Chat Panel shows up', () => {
      train.VerifyWarningMessage('This Train Dialog has some issues to address')
    })

    it('Select the offensive User turn and verify warning message under chat panel changes', () => {
      chatPanel.SelectChatTurnExactMatch('My name is Joe Schmo')
      train.VerifyWarningMessage('Non-multivalue Entity labeled with more than one value: "word"')
    })

    it('Remove one of the erroneous labels', () => {
      entityDetectionPanel.RemoveEntityLabel('My', 'word')
    })

    it('Verify the warning message in the Entity label panel changed', () => {
      entityDetectionPanel.VerifyDuplicateEntityLabelsWarning('name')
    })

    it('Submit the change and verify warning message under Chat Panel shows up', () => {
      train.ClickSubmitChangesButton()
      train.VerifyWarningMessage('This Train Dialog has some issues to address')
    })

    it('Select the offensive User turn again and verify warning message under chat panel changed due to correcting 1 of the Entity labels', () => {
      chatPanel.SelectChatTurnExactMatch('My name is Joe Schmo')
      train.VerifyWarningMessage('Non-multivalue Entity labeled with more than one value: "name"')
    })

    it('Remove one of the erroneous labels', () => {
      entityDetectionPanel.RemoveEntityLabel('Schmo', 'name')
    })

    it('Verify the warning message in the Entity label panel goes away', () => {
      entityDetectionPanel.VerifyNoDuplicateEntityLabelsWarning()
    })

    it('Submit the change and verify warning message under Chat Panel changes', () => {
      train.ClickSubmitChangesButton()
    })
    
    it('Verify the Action uses the corrected value in the name Entity', () => {
      chatPanel.VerifyChatTurnIsAnExactMatch('Hello Joe', 2, 1) 
    })
  })
})
