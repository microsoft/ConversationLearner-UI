/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../../support/helpers.js')
const homePage = require('../../support/components/HomePage')
const scorerModal = require('../../support/components/ScorerModal')
const actions = require('../../support/Actions')
const actionsGrid = require('../../support/components/ActionsGrid')
const memoryTableComponent = require('../../support/components/MemoryTableComponent')
const trainDialogPage = require('../../support/components/TrainDialogsPage')
const editDialogModal = require('../../support/components/EditDialogModal')

describe('zzTemp test', () =>
{
  it('zzTemp test', () => 
  {
    homePage.Visit()

    cy.pause()

    trainDialogPage.CreateNewTrainDialog()

    editDialogModal.TypeYourMessage('Hey')
    editDialogModal.ClickScoreActionsButton()
    ClickAction("What's your name?")

    editDialogModal.TypeYourMessage('Sam')
    editDialogModal.VerifyDetectedEntity('name', 'Sam')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
    ClickAction('Hey Sam,')
  })
})

function ClickAction(expectedResponse)
{
  //var expectedResponseRegex = new RegExp(`>${expectedResponse}<`) // Need to make sure it is an exact match.
  cy.Get('[data-testid="action-scorer-text-response"]').ExactContent(expectedResponse)
    .parents('div.ms-DetailsRow-fields').find('[data-testid="action-scorer-button-clickable"]')
    .Click()

  var expectedUtterance = expectedResponse.replace(/'/g, "’")
  cy.Get('[data-testid="web-chat-utterances"]').then(elements => {
    cy.wrap(elements[elements.length - 1]).within(e => {
      cy.get('div.format-markdown > p').should('have.text', expectedUtterance)
    })})
}
