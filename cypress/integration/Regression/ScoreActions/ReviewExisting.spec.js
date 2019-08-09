/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as actions from '../../../support/Actions'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Review Existing - Score Actions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-reviewExisting', 'z-scoreActions.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Review Existing Score Actions', () => {
    it('Should edit an existing Train Dialog', () => {
      train.EditTraining('Hello', 'I love oranges!', 'Oranges are petty amazing!')
    })
    
    it('Should Verify Scored Actions', () => {
      train.SelectChatTurnExactMatch('What fruits do you like?')
      scorerModal.VerifyScoreActions( [
          {
            response: 'What fruits do you like?',
            type: 'TEXT',
            state: scorerModal.stateEnum.selected,
            entities: [],
            wait: true,
          },
          {
            response: 'Something extra',
            type: 'TEXT',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: true,
          },
          {
            response: 'Can be deleted - not used in a Train Dialog',
            type: 'TEXT',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: true,
          },
          {
            response: 'LogicWithNoArgslogic(memoryManager)',
            type: 'API',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: true,
          },
          {
            response: 'promptquestion:Do you like being questioned?button1:Yesbutton2:No',
            type: 'CARD',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: true,
          },
          {
            response: 'fruits: STRAWBERRY',
            type: 'SET_ENTITY',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: false,
          },
          {
            response: 'promptWithPicturetitle:Do you like flowers?image:https://cdn.pixabay.com/photo/2018/10/30/16/06/water-lily-3784022__340.jpgline1:Flowers make life beautifulline2:Flower Powerline3:Bees Like Flowersbutton1:I Like Flowersbutton2:Flowers are for the birds and bees',
            type: 'CARD',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: true,
          },
          {
            response: 'This is your data: hidden here',
            type: 'TEXT',
            state: scorerModal.stateEnum.qualified,
            entities: [
              { name: 'required1', qualifierState: scorerModal.entityQualifierStateEnum.green },
            ],
            wait: false,
          },
          {
            response: 'fruits: BANANA',
            type: 'SET_ENTITY',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: false,
          },
          {
            response: 'Do you also like oranges?',
            type: 'TEXT',
            state: scorerModal.stateEnum.qualified,
            entities: [
              { name: 'fruits = ORANGE', qualifierState: scorerModal.entityQualifierStateEnum.greenStrikeout },
            ],
            wait: true,
          },
          {
            response: 'fruits: ORANGE',
            type: 'SET_ENTITY',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: false,
          },
          {
            response: 'Oranges are petty amazing!',
            type: 'TEXT',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: true,
          },
          {
            response: 'fruits: APPLE',
            type: 'MISSING ACTION',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: false,
          },
          {
            response: 'fruits: PEACH',
            type: 'MISSING ACTION',
            state: scorerModal.stateEnum.qualified,
            entities: [],
            wait: false,
          },
          {
            response: 'Goodbye',
            type: 'END_SESSION',
            state: scorerModal.stateEnum.disqualified,
            entities: [],
            wait: true,
          },
          {
            response: 'Your entity contains: $entity',
            type: 'TEXT',
            state: scorerModal.stateEnum.disqualified,
            entities: [
              { name: 'entity', qualifierState: scorerModal.entityQualifierStateEnum.red },
            ],
            wait: true,
          },
          {
            response: 'You are required to provide some data',
            type: 'TEXT',
            state: scorerModal.stateEnum.disqualified,
            entities: [
              { name: 'required1', qualifierState: scorerModal.entityQualifierStateEnum.redStrikeout },
            ],
            wait: true,
          },
          {
            response: 'Are you qualified?',
            type: 'TEXT',
            state: scorerModal.stateEnum.disqualified,
            entities: [
              { name: 'disqualifying1', qualifierState: scorerModal.entityQualifierStateEnum.redStrikeout },
            ],
            wait: true,
          },
          {
            response: 'So, you like bananas, me too',
            type: 'TEXT',
            state: scorerModal.stateEnum.disqualified,
            entities: [
              { name: 'fruits = BANANA', qualifierState: scorerModal.entityQualifierStateEnum.red },
            ],
            wait: false,
          },
          {
            response: 'Required and Disqualifying',
            type: 'TEXT',
            state: scorerModal.stateEnum.disqualified,
            entities: [
              { name: 'required1', qualifierState: scorerModal.entityQualifierStateEnum.green },
              { name: 'required2', qualifierState: scorerModal.entityQualifierStateEnum.red },
              { name: 'disqualifying1', qualifierState: scorerModal.entityQualifierStateEnum.redStrikeout },
              { name: 'disqualifying2', qualifierState: scorerModal.entityQualifierStateEnum.greenStrikeout },
            ],
            wait: true,
          },
        ])
        

      // [
      //   {
      //     response: 'promptWithPicturetitle:Do you like flowers?image:https://cdn.pixabay.com/photo/2018/10/30/16/06/water-lily-3784022__340.jpgline1:Flowers make life beautifulline2:Flower Powerline3:Bees Like Flowersbutton1:I Like Flowersbutton2:Flowers are for the birds and bees',
      //     type: 'CARD',
      //     state: scorerModal.stateEnum.qualified,
      //     entities: [],
      //     wait: true,
      //   },
      //   {
      //     response: 'Required and Disqualifying',
      //     type: 'TEXT',
      //     state: scorerModal.stateEnum.disqualified,
      //     entities: [
      //       { name: 'required1', qualifierState: scorerModal.entityQualifierStateEnum.green },
      //       { name: 'required2', qualifierState: scorerModal.entityQualifierStateEnum.red },
      //       { name: 'disqualifying1', qualifierState: scorerModal.entityQualifierStateEnum.redStrikeout },
      //       { name: 'disqualifying2', qualifierState: scorerModal.entityQualifierStateEnum.greenStrikeout },
      //     ],
      //     wait: true,
      //   },
      // ])
    })
  })
})
