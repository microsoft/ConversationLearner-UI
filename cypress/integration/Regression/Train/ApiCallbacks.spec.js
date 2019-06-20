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

describe('API Callbacks - Train', () => {
  afterEach(() => helpers.SkipRemainingTestsOfSuiteIfFailed())

  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-ApiCallbacks', 'z-ApiCallbacks.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
    })

    it('Should invoke "LogicWithNoArgs" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('LogicWithNoArgs')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('LogicWithNoArgs', 'API Call:', 'LogicWithNoArgs()')
    })

    it('Should invoke "LogicWithArgs" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('LogicWithArgs ThingOne and ThingTwo')
      train.LabelTextAsEntity('ThingOne', '1stArg')
      train.LabelTextAsEntity('ThingTwo', '2ndArg')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('LogicWithArgs', 'API Call:', 'LogicWithArgs(ThingOne,ThingTwo)')
    })

    it('Should invoke "RenderTheArgs" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('RenderTheArgs')
      train.ClickScoreActionsButton()
      train.SelectApiTextAction('RenderTheArgs', 'The Logic Args: ‘ThingOne’, ‘ThingTwo’, ‘333’, ‘4444’, ‘five’, ‘six’, ‘seven’The Render Args: ‘ThingOne’, ‘ThingTwo’, ‘three’, ‘four’, ‘55555’, ‘666666’, ‘7777777’')
    })

    it('Should invoke "TextCard" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('TextCard')
      train.ClickScoreActionsButton()
      train.SelectApiCardAction('TextCard', 'Greetings', 'Have a great day!')
    })

    it('Should invoke "PhotoCard" API Callback and verify it is in the chat pane', () => {
      train.TypeYourMessage('PhotoCard')
      train.ClickScoreActionsButton()
      train.SelectApiPhotoCardAction('PhotoCard', 'Photo Card', 'Here is a photo for you to enjoy', 'https://picsum.photos/380/220')
    })


    it('Should save the training and verify it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Edit Train Dialog', () => {
    it('Should edit the Train Dialog', () => {
      train.EditTraining('LogicWithNoArgs', 'PhotoCard', 'PhotoCard')
    })

    it('Should verify that all of the Bot responses were persisted and re-renders correctly', () => {
      train.VerifyCardChatMessage('API Call:', 'LogicWithNoArgs()', 1)
      train.VerifyCardChatMessage('API Call:', 'LogicWithArgs(ThingOne,ThingTwo)', 3)
      train.VerifyTextChatMessage('The Logic Args: ‘ThingOne’, ‘ThingTwo’, ‘333’, ‘4444’, ‘five’, ‘six’, ‘seven’The Render Args: ‘ThingOne’, ‘ThingTwo’, ‘three’, ‘four’, ‘55555’, ‘666666’, ‘7777777’', 5)
      train.VerifyCardChatMessage('Greetings', 'Have a great day!', 7)
      train.ClickSaveCloseButton()
    })    
  })
})
