/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as entities from '../../../support/Entities'
import * as actions from '../../../support/Actions'
import * as helpers from '../../../support/Helpers'

// We need to skip this test until the Bug 2132 is fixed.
describe('API Callbacks - CreateModels', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should create a model to test against', () => {
      models.CreateNewModel('z-ApiCallbacks')
    })
  })

  context('Create Entities', () => {
    it('Should create custom trained entities that will be used by the API Callbacks', () => {
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: '1stArg'})
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: '2ndArg'})
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: 'entityError', negatable: true})
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: 'logicError', negatable: true})
      entities.CreateNewEntityThenVerifyInGrid({ type: 'Custom Trained', name: 'renderError', negatable: true})
    })
  })

  context('Create Actions', () => {
    it('Should create BadCard Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ 
        responseNameData: 'BadCard',
        type: 'API',
        validateApiResponse: 'BadCardrender(result, memoryManager)'
      })
    })

    it('Should create ExceptionAPI Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ 
        responseNameData: 'ExceptionAPI', 
        type: 'API',
        validateApiResponse: 'ExceptionAPIlogic(memoryManager)render(result, memoryManager)' 
      })
    })

    it('Should create LogicWithNoArgs Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ 
        responseNameData: 'LogicWithNoArgs', 
        type: 'API',
        validateApiResponse: 'LogicWithNoArgslogic(memoryManager)'
      })
    })

    it('Should create LogicWithArgs Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ 
        responseNameData: 'LogicWithArgs', 
        type: 'API',
        logicArgs: ['$1stArg{enter}', '$2ndArg{enter}'],
        validateApiResponse: 'LogicWithArgslogic(memoryManager, firstArg, secondArg)firstArg:$1stArgsecondArg:$2ndArg'
      })
    })

    it('Should create Malformed Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ 
        responseNameData: 'Malformed', 
        type: 'API',
        validateApiResponse: 'Malformedlogic(memoryManager)'
      })
    })
    
    it('Should create RenderTheArgs Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ 
        responseNameData: 'RenderTheArgs',
        type: 'API',
        logicArgs: ['$1stArg{enter}', '$2ndArg{enter}', '333', '4444', 'five', 'six', 'seven'],                                          
        renderArgs: ['$1stArg{enter}', '$2ndArg{enter}', 'three', 'four', '55555', '666666', '7777777'],
        validateApiResponse: 'RenderTheArgslogic(memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:$1stArgsecondArg:$2ndArgthirdArg:333fourthArg:4444fifthArg:fivesixthArg:sixseventhArg:sevenrender(result, memoryManager, firstArg, secondArg, thirdArg, fourthArg, fifthArg, sixthArg, seventhArg)firstArg:$1stArgsecondArg:$2ndArgthirdArg:threefourthArg:fourfifthArg:55555sixthArg:666666seventhArg:7777777'
      })
    })

    it('Should create TextCard Action', () => {
      actions.CreateNewActionThenVerifyInGrid({ 
        responseNameData: 'TextCard', 
        type: 'API', 
        renderArgs: ['Greetings', 'Have a great day!'], 
        validateApiResponse: 'TextCardrender(result, memoryManager, cardTitle, cardText)cardTitle:GreetingscardText:Have a great day!'
      })
    })
  })
})