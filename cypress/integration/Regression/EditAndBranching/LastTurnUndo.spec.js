/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entityModal from '../../../support/components/EntityModal'
import * as entities from '../../../support/Entities'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Last Turn and Undo - Edit and Branching', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-lastTurnUndo', 'z-expectedEntLabl.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Last Turn and Undo', () => {
    it('Edit user turn, which ends with a Bot turn, then verify expected UI Elements', () => {
      train.EditTraining('Hello', 'David', 'Hello $name')
      train.VerifyScoreActionsButtonIsMissing()
      train.VerifyTypeYourMessageIsPresent()
      train.VerifyTurnUndoButtonIsMissing()
    })
    
    it('', () => {
      train.TypeYourMessage('A message to be undone!')
      
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