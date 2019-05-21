/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as entities from '../../support/Entities'
import * as actions from '../../support/Actions'
import * as helpers from '../../support/Helpers'

describe('aAPITemp - CreateModels', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-ApiCallbacks', 'z-ApiCallbacks.cl')
      //cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Create Actions', () => {
    it('Should create LogicWithArgs Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ 
        responseNameData: 'LogicWithArgs', 
        type: 'API',
        logicArgs: ['$1stArg{enter}', '$2ndArg{enter}'],
        //logicArgs: ['1stArg', '2ndArg'],
        validateApiResponse: 'LogicWithArgslogic(memoryManager, firstArg, secondArg)firstArg:"$1stArg"secondArg:"$2ndArg"' 
      })
    })
  })
})
