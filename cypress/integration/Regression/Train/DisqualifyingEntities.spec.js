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

describe('Disqualifying Entities - Train', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  const generateScoreActionsData = Cypress.env('GENERATE_SCORE_ACTIONS_DATA')
  helpers.ConLog('GENERATE_SCORE_ACTIONS_DATA', `${generateScoreActionsData}`)
  let scoreActionsVerificationData = {}

  context('Setup', () => {
    if (!generateScoreActionsData) {
      it('Write the generated Score Actions data to a JSON file', () => {
        cy.readFile('cypress/fixtures/scoreActions/disqualifyingEntities.json').then(scoreActionsData => scoreActionsVerificationData = scoreActionsData)
      })
    }

    it('Should import a model to test against, navigate to Train Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-disqualifyngEnt', 'z-disqualifyngEnt.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('1st Train Dialog', () => {
    context('1st Round', () => {
      it('Should create a new Train Dialog', () => {
        train.CreateNewTrainDialog()
      })

      it('Should type in a user utterance and click Score Actions button', () => {
        train.TypeYourMessage('Hey')
        train.ClickScoreActionsButton()
      })

      if (generateScoreActionsData) {
        it('Should generate the Score Actions list', () => {
          cy.WaitForStableDOM().then(() => { scoreActionsVerificationData.hey1 = scorerModal.GenerateScoreActionsDataFromGrid() })
        })
      } else {
        it('Should verify the Score Actions list', () => {
          scorerModal.VerifyScoreActions(scoreActionsVerificationData.hey1)
        })
      }

      // it('Should verify the Action list contains 1 enabled Action and 3 disabled Actions', () => {
      //   scorerModal.VerifyContainsEnabledAction(common.whatsYourName)
      //   scorerModal.VerifyContainsDisabledAction('Hey $name')
      //   scorerModal.VerifyContainsDisabledAction('Hey $name, what do you really want?')
      //   scorerModal.VerifyContainsDisabledAction("Sorry $name, I can't help you get $want")
      // })

      it('Should select an action', () => {
        train.SelectTextAction(common.whatsYourName)
      })
    })

    context('2nd Round', () => {
      it('Should type in another user utterance, verify it is labled as the "name" Entity and click Score Actions button', () => {
        train.TypeYourMessage('Sam')
        train.VerifyEntityLabel('Sam', 'name')
        train.ClickScoreActionsButton()
      })

      it('Should verify the labeled Entity appears in the Memory pane', () => {
        memoryTableComponent.VerifyEntityValues('name', ['Sam'])
      })

      if (generateScoreActionsData) {
        it('Should generate the Score Actions list', () => {
          cy.WaitForStableDOM().then(() => { scoreActionsVerificationData.sam = scorerModal.GenerateScoreActionsDataFromGrid() })
        })
      } else {
        it('Should verify the Score Actions list', () => {
          scorerModal.VerifyScoreActions(scoreActionsVerificationData.sam)
        })
      }

      // it('Should verify the Action list contains 2 enabled and 2 disabled Actions', () => {
      //   scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
      //   scorerModal.VerifyContainsEnabledAction('Hey Sam')
      //   scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
      //   scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
      // })

      it('Should select an action', () => {
        train.SelectTextAction('Hey Sam', 'Hey $name')
      })
    })

    context('3rd Round', () => {
      it('Should type in another user utterance and click Score Actions button', () => {
        train.TypeYourMessage('Hey')
        train.ClickScoreActionsButton()
      })

      it('Should verify the labeled Entity still appears in the Memory pane', () => {
        memoryTableComponent.VerifyEntityValues('name', ['Sam'])
      })
    
      if (generateScoreActionsData) {
        it('Should generate the Score Actions list', () => {
          cy.WaitForStableDOM().then(() => { scoreActionsVerificationData.hey2 = scorerModal.GenerateScoreActionsDataFromGrid() })
        })
      } else {
        it('Should verify the Score Actions list', () => {
          scorerModal.VerifyScoreActions(scoreActionsVerificationData.hey2)
        })
      }

      // it('Should verify the Action list contains 2 enabled and 2 disabled Actions', () => {
      //   scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
      //   scorerModal.VerifyContainsEnabledAction('Hey Sam')
      //   scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
      //   scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
      // })

      it('Should select an action', () => {
        train.SelectTextAction('Hey Sam, what do you really want?', 'Hey $name, what do you really want?')
      })
    })

    context('4th Round', () => {
      it('Should type in the last user utterance and click Score Actions button', () => {
        train.TypeYourMessage('world peace')
        train.ClickScoreActionsButton()
      })

      it('Should verify the 1st labeled Entity still appears in the Memory pane', () => {
        memoryTableComponent.VerifyEntityValues('name', ['Sam'])
      })

      it('Should verify that a 2nd labeled Entity also appears in the Memory pane', () => {
        memoryTableComponent.VerifyEntityValues('want', ['world peace'])
      })

      if (generateScoreActionsData) {
        it('Should generate the Score Actions list', () => {
          cy.WaitForStableDOM().then(() => { scoreActionsVerificationData.worldPeace = scorerModal.GenerateScoreActionsDataFromGrid() })
        })
      } else {
        it('Should verify the Score Actions list', () => {
          scorerModal.VerifyScoreActions(scoreActionsVerificationData.worldPeace)
        })
      }

      // it('Should verify the Action list contains 1 enabled Action and 3 disabled Actions', () => {
      //   scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
      //   scorerModal.VerifyContainsDisabledAction('Hey Sam')
      //   scorerModal.VerifyContainsDisabledAction('Hey Sam, what do you really want?')
      //   scorerModal.VerifyContainsEnabledAction("Sorry Sam, I can't help you get world peace")
      // })

      it('Should select an action', () => {
        train.SelectTextAction("Sorry Sam, I can't help you get world peace", "Sorry $name, I can't help you get $want")
      })

      it('Should save the Train Dialog and verify that it shows up in the grid', () => {
        train.SaveAsIsVerifyInGrid()
      })
    })
  })

  context('2nd Train Dialog', () => {
    context('1st Round', () => {
      it('Should create a new Train Dialog', () => {
        train.CreateNewTrainDialog()
      })

      it('Should type in a user utterance and click Score Actions button', () => {
        train.TypeYourMessage('I want a million dollars')
        train.LabelTextAsEntity('a million dollars', 'want')
        train.ClickScoreActionsButton()
      })

      if (generateScoreActionsData) {
        it('Should generate the Score Actions list', () => {
          cy.WaitForStableDOM().then(() => { scoreActionsVerificationData.million = scorerModal.GenerateScoreActionsDataFromGrid() })
        })
      } else {
        it('Should verify the Score Actions list', () => {
          scorerModal.VerifyScoreActions(scoreActionsVerificationData.million)
        })
      }
      
      // it('Should verify the Action list contains 1 enabled Action and 3 disabled Actions', () => {
      //   scorerModal.VerifyContainsEnabledAction(common.whatsYourName)
      //   scorerModal.VerifyContainsDisabledAction('Hey $name')
      //   scorerModal.VerifyContainsDisabledAction('Hey $name, what do you really want?')
      //   scorerModal.VerifyContainsDisabledAction("Sorry $name, I can't help you get a million dollars")
      // })

      it('Should select an action', () => {
        train.SelectTextAction(common.whatsYourName)
      })
    })

    context('2nd Round', () => {
      it('Should type in a user utterance and click Score Actions button', () => {
        train.TypeYourMessage('Sandeep')
        train.VerifyEntityLabel('Sandeep', 'name')
        train.ClickScoreActionsButton()
      })

      if (generateScoreActionsData) {
        it('Should generate the Score Actions list', () => {
          cy.WaitForStableDOM().then(() => { scoreActionsVerificationData.sandeep = scorerModal.GenerateScoreActionsDataFromGrid() })
        })
      } else {
        it('Should verify the Score Actions list', () => {
          scorerModal.VerifyScoreActions(scoreActionsVerificationData.sandeep)
        })
      }

      // it('Should verify the Action list contains 1 enabled Action and 3 disabled Actions', () => {
      //   scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
      //   scorerModal.VerifyContainsDisabledAction('Hey Sandeep')
      //   scorerModal.VerifyContainsDisabledAction('Hey Sandeep, what do you really want?')
      //   scorerModal.VerifyContainsEnabledAction("Sorry Sandeep, I can't help you get a million dollars")
      // })

      it('Should select an action', () => {
        train.SelectTextAction("Sorry Sandeep, I can't help you get a million dollars", "Sorry $name, I can't help you get $want")
      })

      it('Should save the Train Dialog and verify the contents show up in the grid', () => {
        train.SaveAsIsVerifyInGrid()
      })
    })

    if (generateScoreActionsData) {
      context('PERSIST GENERATED DATA', () => {
        it('Write the generated Score Actions data to a JSON file', () => {
          cy.writeFile('cypress/fixtures/scoreActions/disqualifyingEntities.json', scoreActionsVerificationData)
        })
      })
    }
  })

  // Manually EXPORT this to fixtures folder and name it 'z-disqualifyngEnt.Trained.cl'
})