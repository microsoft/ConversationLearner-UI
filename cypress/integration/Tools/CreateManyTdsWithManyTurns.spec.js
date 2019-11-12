/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as memoryTableComponent from '../../support/components/MemoryTableComponent'
import * as scorerModal from '../../support/components/ScorerModal'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as train from '../../support/Train'
import * as common from '../../support/Common'
import * as helpers from '../../support/Helpers'

class UserTurns {
  constructor() {
    this.userTurns = UserTurns.userTurns.slice(0)
  }
  
  GetNext() {
    if (this.userTurns.length <= 0) { helpers.ConLog('GetNext', 'Reset userTurns')
      this.userTurns = UserTurns.userTurns.slice(0)}
    return this.userTurns.splice(Math.floor(Math.random() * this.userTurns.length), 1)
  }
}

UserTurns.userTurns = [
  'Focus on what you want from life rather than on what is going wrong.',
  'Sincere kindness is always appreciated.',
  'Being thankful for what you have is the secret to happiness.',
  'Slowing down is often the fastest way to acomplish a goal.',
  'There are no coincedences in life.',
  'If you are going to repeat something many times, make it a good thought.'
]

describe('Create many TDs for New Entity Label test - Train Dialog', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  // context('Verify UserTurns Class', () => {
  //   let userTurns = new UserTurns()
  //   it('Verification', () => {
  //     const numberOfRounds = 10
  //     for (let iUT = 0; iUT < numberOfRounds; iUT++) {    
  //       helpers.ConLog('temp', `User Turn: '${userTurns.GetNext()}'`)  
  //     }
  //   })
  // })

  context('Setup', () => {
    it('Import a model and wait for training to complete', () => {
      models.ImportModel('z-newEntityLabelX', 'z-newEntityLabelX.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })
  
  let userTurns = new UserTurns()

  context('Create many TDs', () => {
    for (let iTD = 0; iTD < 33; iTD++) {
      context(`Create Train Dialog #${iTD}`, () => {
        it('New Train Dialog', () => {
          trainDialogsGrid.TdGrid.CreateNewTrainDialog()
          train.TypeDescription(`Train Dialog ${iTD}`)
        })
        
        const numberOfRounds = Math.floor(Math.random() * 8) + 3
        const indexSpecialTurn = Math.floor(Math.random() * numberOfRounds)
        for (let iUT = 0; iUT < numberOfRounds; iUT++) {    
          it('Add a new round of turns', () => {
            train.TypeYourMessage(iUT != indexSpecialTurn ? userTurns.GetNext() : "Pearls of wisdom are useless unless diligently applied to one's own life.")
            train.ClickScoreActionsButton()
            train.SelectTextAction('The only response')
          })
        }
          
        it('Save Train Dialog', () => {
          train.SaveAsIs()
        })
      })
    }    
  })
})