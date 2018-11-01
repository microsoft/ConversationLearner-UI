/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../../support/Helpers')
const homePage = require('../../support/components/HomePage')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const trainDialogsGrid = require('../../support/components/TrainDialogsGrid')
const editDialogsModal = require('../../support/components/EditDialogModal')

/// Description: A temporary workspace for experimental code
describe('zTemp test', () =>
{
  it('zTemp test', () => 
  {
    ArrayTester(['one', 'two', 'three'], ['4444', '55555', '666666'])
    ArrayTester('one', 'two')

    ArrayTester(undefined, ['4444', '55555', '666666'])
    ArrayTester(['one', 'two', 'three'])
    ArrayTester()
    // homePage.Visit()
    // homePage.NavigateToModelPage("BigTrain")
    // modelPage.NavigateToTrainDialogs()
    // cy.pause()

    // editDialogsModal.SelectChatTurn('Hello Paul', 4)
    //cy.Get('div.wc-message-wrapper.list.clickable').contains('Paul is not here').Click()
  })
})

function ArrayTester(entities1, entities2)
{ 
  if (!entities1 && !entities2) helpers.ConLog(`ValidateEntities`, 'IS EMPTY')
  else
  {
    var entities = new Array()
    if (entities1)
    {
      if(!Array.isArray(entities1)) entities1 = [entities1]
      entities = entities1
    }
    if (entities2)
    {
      if(!Array.isArray(entities2)) entities2 = [entities2]
      entities = [...entities, ...entities2]
    }
    entities.forEach(entity => { helpers.ConLog(`ValidateEntities`, `entity: "${entity}" -- typeof entity: [${typeof entity}]`)})
  }
}