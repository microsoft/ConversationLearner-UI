/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
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
      train.CreateNewTrainDialog()
    })

    it('Type in a user utterance and label some of the text', () => {
      train.TypeYourMessage('My name is Joe Schmo')
      train.LabelTextAsEntity('Joe', 'name')
      train.LabelTextAsEntity('Schmo', 'name')
    })

    it('Verify the warning message in the Entity label panel comes up.', () => {
      train.VerifyDuplicateEntityLabelsWarning('name')
    })

    it('Duplicate label more of the text', () => {
      train.LabelTextAsEntity('My', 'word')
      train.LabelTextAsEntity('name', 'word')
    })

    it('Verify the warning message in the Entity label panel changes.', () => {
      train.VerifyDuplicateEntityLabelsWarning('word, name')
    })

    it('Score Action and save Train Dialog', () => {
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hello Schmo', 'Hello $name')
      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Edit Train Dialog', () => {
    it('Re-edit the same Train Dialog', () => {
      train.EditTraining('My name is Joe Schmo', 'My name is Joe Schmo', 'Hello $name')
    })

    it('Verify warning message under Chat Panel shows up', () => {
      train.VerifyWarningMessage('This Train Dialog has some issues to address')
    })

    it('Select the offensive User turn and verify warning message under chat panel changes', () => {
      train.SelectChatTurnExactMatch('My name is Joe Schmo')
      train.VerifyWarningMessage('Non-multivalue Entity labeled with more than one value: "word"')
    })

    it('Remove one of the erroneous labels', () => {
      train.RemoveEntityLabel('My', 'word')
    })

    it('Verify the warning message in the Entity label panel changed', () => {
      train.VerifyDuplicateEntityLabelsWarning('name')
    })

    it('Submit the change and verify warning message under Chat Panel shows up', () => {
      train.ClickSubmitChangesButton()
      train.VerifyWarningMessage('This Train Dialog has some issues to address')
    })

    it('Select the offensive User turn again and verify warning message under chat panel changed due to correcting 1 of the Entity labels', () => {
      train.SelectChatTurnExactMatch('My name is Joe Schmo')
      train.VerifyWarningMessage('Non-multivalue Entity labeled with more than one value: "name"')
    })

    it('Remove one of the erroneous labels', () => {
      train.RemoveEntityLabel('Schmo', 'name')
    })

    it('Verify the warning message in the Entity label panel goes away', () => {
      train.VerifyNoDuplicateEntityLabelsWarning()
    })

    it('Submit the change and verify warning message under Chat Panel changes', () => {
      train.ClickSubmitChangesButton()
    })
    
    it('Verify the Action uses the corrected value in the name Entity', () => {
      train.VerifyChatTurnIsAnExactMatch('Hello Joe', 2, 1) 
    })
  })
})
