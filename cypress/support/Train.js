/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as popupModal from './components/PopupModal'
import * as modelPage from './components/ModelPage'
import * as scorerModal from './components/ScorerModal'
import * as chatPanel from './components/ChatPanel'
import * as trainDialogsGrid from './components/TrainDialogsGrid'
import * as mergeModal from './components/MergeModal'
import * as helpers from './Helpers'

let currentTrainingSummary
let originalTrainingSummary
let isBranched

function Today() { return Cypress.moment().format("MM/DD/YYYY") }

export const TypeYourMessageSelector = 'input.wc-shellinput[placeholder="Type your message..."]' // data-testid NOT possible
export const ScoreActionsButtonSelector = '[data-testid="score-actions-button"]'
export const TurnUndoButtonSelector = '[data-testid="edit-teach-dialog-undo-button"]'

export function ClickSetInitialStateButton() { cy.Get('[data-testid="teach-session-set-initial-state"]').Click() }
export function ClickScoreActionsButton() { cy.Get(ScoreActionsButtonSelector).Click() }
export function VerifyEntityMemoryIsEmpty() { cy.Get('[data-testid="memory-table-empty"]').contains('Empty') }
export function ClickAddAlternativeInputButton() { cy.Get('[data-testid="entity-extractor-add-alternative-input-button"]').Click() }

export function VerifyWarningMessage(expectedMessage) { cy.Get('[data-testid="dialog-modal-warning"]').find('span').ExactMatch(expectedMessage) }
export function VerifyNoWarningMessage() { cy.DoesNotContain('[data-testid="dialog-modal-warning"]') }

export function VerifyErrorMessage(expectedMessage) { cy.Get('div.cl-editdialog-error').find('span').ExactMatch(expectedMessage) }
export function VerifyNoErrorMessage() { cy.DoesNotContain('div.cl-editdialog-error') }
export function VerifyErrorPopup(expectedMessage) { cy.Get('p.ms-Dialog-title').ExactMatch(expectedMessage) }

export function ClickPopupConfirmCancelOkButton() { cy.Get('[data-testid="confirm-cancel-modal-ok"]').Click() }
export function ClickDeleteChatTurn() { cy.Get('[data-testid="chat-edit-delete-turn-button"]').Click() }

export function VerifyTypeYourMessageIsPresent() { cy.Get(TypeYourMessageSelector) }
export function VerifyTypeYourMessageIsMissing() { cy.DoesNotContain(TypeYourMessageSelector) }
export function VerifyScoreActionsButtonIsPresent() { cy.Get(ScoreActionsButtonSelector) }
export function VerifyScoreActionsButtonIsMissing() { cy.DoesNotContain(ScoreActionsButtonSelector) }

export function ClickSaveCloseButton() { cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').Click() }
export function MergeSaveAsIs() { cy.Get('[data-testid="merge-modal-save-as-is-button"').Click() }
export function VerifyCloseButtonLabel() { cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').contains('Close') }
export function VerifySaveBranchButtonLabel() { cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').contains('Save Branch') }

export function ClickAbandonDeleteButton() { cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').Click() }
export function ClickConfirmAbandonButton() { popupModal.VerifyExactTitleNoContentClickButton('Are you sure you want to abandon your edits?', '[data-testid="confirm-cancel-modal-accept"]')}
export function ClickConfirmDeleteLogDialogButton() { popupModal.VerifyExactTitleNoContentClickButton('Are you sure you want to delete this Log Dialog?', '[data-testid="confirm-cancel-modal-accept"]')}
export function VerifyDeleteButtonLabel() { cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').contains('Delete') }
export function VerifyAbandonBranchButtonLabel() { cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').contains('Abandon Branch') }

export function VerifyTurnUndoButtonIsPresent() { cy.Get(TurnUndoButtonSelector) }
export function VerifyTurnUndoButtonIsMissing() { cy.DoesNotContain(TurnUndoButtonSelector) }
export function ClickTurnUndoButton() { cy.Get(TurnUndoButtonSelector).Click() }

export function VerifySubmitChangesButtonIsDisabled() { cy.Get('[data-testid="submit-changes-button"].is-disabled') }
export function VerifySubmitChangesButtonIsEnabled() { cy.Get('[data-testid="submit-changes-button"]:not(.is-disabled)') }
export function ClickSubmitChangesButton() { cy.Get('[data-testid="submit-changes-button"]').Click() }

export function ClickConfirmAbandonDialogButton() { return cy.Get('[data-testid="confirm-cancel-modal-accept"]').Click() }
export function ClickReplayButton() { cy.Get('[data-testid="edit-dialog-modal-replay-button"]').Click() }

export function VerifyEntityFilter(entity) { cy.Get('[data-testid="dropdown-filter-by-entity"] > span.ms-Dropdown-title').ExactMatch(entity) }
export function VerifyActionFilter(action) { cy.Get('[data-testid="dropdown-filter-by-action"] > span.ms-Dropdown-title').ExactMatch(action) }
export function ClickClearFilterButton() { cy.Get('[data-testid="train-dialogs-clear-filter-button"]').Click() }

export function GetDescriptions() { return Cypress.$('[data-testid="train-dialog-description"]').attr('value') }
export function VerifyDescription(expectedDescription) { cy.Get(`[data-testid="train-dialog-description"][value="${expectedDescription}"]`) }
export function TypeDescription(description) { cy.Get('[data-testid="train-dialog-description"]').clear().type(`${description}{enter}`) }

export function GetAllTags() { return helpers.ArrayOfTextContentWithoutNewlines('[data-testid="train-dialog-tags"] > div.cl-tags__tag > span') }
export function ClickAddTagButton() { cy.Get('[data-testid="tags-input-add-tag-button"]').Click() }
export function VerifyNoTags() { cy.Get('[data-testid="train-dialog-tags"] > div.cl-tags__tag > button > i [data-icon-name="Clear"]').should('have.length', 0) }

export function VerifyTags(tags) { 
  cy.Enqueue(() => {
    helpers.ConLog('VerifyTags', 'Start')
    const tagsOnPage = helpers.StringArrayFromElementText('[data-testid="train-dialog-tags"] > div.cl-tags__tag > span')
    let missingTags = []
    tags.forEach(tag => {
      if (!tagsOnPage.find(tagOnPage => tag === tagOnPage)) missingTags.push(tag)
    })
    if (missingTags.length > 0) throw new Error(`Failed to find these tags: ${missingTags}`)
  })
}

// Pass in an array of tag strings.
// If you try to call this twice in a row, it will fail to find the "Add Tag Button"
// so don't do it, this was designed to take multiple tags.
export function AddTags(tags) { 
  ClickAddTagButton()
  let tagList = ''
  tags.forEach(tag => { tagList += `${tag}{enter}` })
  cy.Get('[data-testid="tags-input-tag-input"]').type(tagList)
}


export function CreateNewTrainDialog() {
  cy.Enqueue(() => {
    const turns = trainDialogsGrid.GetTurns()
    currentTrainingSummary = {
      FirstInput: undefined,
      LastInput: undefined,
      LastResponse: undefined,
      Turns: 0,
      // FUDGING on the time - subtract 25 seconds because the time is set by the server
      // which is not exactly the same as our test machine.
      MomentTrainingStarted: Cypress.moment().subtract(25, 'seconds'),
      MomentTrainingEnded: undefined,
      LastModifiedDate: undefined,
      CreatedDate: undefined,
      TrainGridRowCount: (turns ? turns.length : 0) + 1
    }
    isBranched = false
  })
  trainDialogsGrid.ClickNewTrainDialogButton()
}

export function EditTraining(firstInput, lastInput, lastResponse, expectedRowCount = -1) {
  const funcName = `EditTraining(${firstInput}, ${lastInput}, ${lastResponse})`
  let iRow
  
  let tdGrid
  cy.wrap(1).should(() => {
    tdGrid = trainDialogsGrid.TdGrid.GetTdGrid(expectedRowCount)
  }).then(() => {
    
    iRow = tdGrid.FindGridRowByChatInputs(firstInput, lastInput, lastResponse)
    if (iRow >= 0) { 
      const turns = trainDialogsGrid.GetTurns()
      const lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
      const createdDates = trainDialogsGrid.GetCreatedDates()

      currentTrainingSummary = {
        FirstInput: tdGrid.firstInputs[iRow],
        LastInput: tdGrid.lastInputs[iRow],
        LastResponse: tdGrid.lastResponses[iRow],
        Turns: turns[iRow],
        // FUDGING on the time - subtract 25 seconds because the time is set by the server
        // which is not exactly the same as our test machine.
        MomentTrainingStarted: Cypress.moment().subtract(25, 'seconds'),
        MomentTrainingEnded: undefined,
        LastModifiedDate: lastModifiedDates[iRow],
        CreatedDate: createdDates[iRow],
        TrainGridRowCount: turns.length // It used to be this but I can't figure out why ---> (turns ? turns.length : 0)
      }
      originalTrainingSummary = Object.create(currentTrainingSummary)
      isBranched = false

      helpers.ConLog(funcName, `ClickTraining for Train Dialog Row #${iRow} - ${turns[iRow]}, ${firstInput}, ${lastInput}, ${lastResponse}`)
      trainDialogsGrid.ClickTraining(iRow)
      return
    }
    throw new Error(`Can't Find Training to Edit. The grid should, but does not, contain a row with this data in it: FirstInput: ${firstInput} -- LastInput: ${lastInput} -- LastResponse: ${lastResponse}`)
  })
  .then(() => {
    // Sometimes the first click on the grid row does not work, so we implemented this logic to watch and see
    // if it loaded, and if not to re-click on the row. So far we've never seen it require a 3rd click.
    cy.WaitForStableDOM()

    const funcName2 = funcName + ' - VALIDATION PHASE'
    let retryCount = 0

    helpers.ConLog(funcName2, `Row #${iRow}`)

    cy.wrap(1, {timeout: 8000}).should(() => {
      const allChatMessageElements = chatPanel.GetAllChatMessageElements()
      if (allChatMessageElements.length > 0) {
        helpers.ConLog(funcName2, `The expected Train Dialog from row #${iRow} has loaded`)
        return
      }
      
      helpers.ConLog(funcName2, `We are still waiting for the Train Dialog to load`)
      retryCount++
      if (retryCount % 5 == 0) {
        helpers.ConLog(funcName2, `Going to click on Train Dialog Row #${iRow} again.`)
        
        // The problem with calling ClickTraining is that it causes the cy.wrap timeout to be canceled.
        // CANNOT USE THIS - trainDialogsGrid.ClickTraining(trainDialogIndex)
        Cypress.$('[data-testid="train-dialogs-description"]')[iRow].click({force: true})

        throw new Error(`Retry - We just finished clicking on Train Dialog Row #${iRow} again.`)
      }
      throw new Error('Retry - The Train Dialog has not yet loaded')
    })
  })
}

// The optional 'dontCountThisTurn' parameter is intended for the rare cases where 
// we know the user turn will be discarded by the UI.
export function TypeYourMessage(message, dontCountThisTurn = false) {
  cy.Get(TypeYourMessageSelector).type(`${message}{enter}`)
  cy.Enqueue(() => {
    if (!currentTrainingSummary.FirstInput) currentTrainingSummary.FirstInput = message
    currentTrainingSummary.LastInput = message
    if (!dontCountThisTurn) {
      currentTrainingSummary.Turns++
    }
  })
}

// lastResponse parameter is optional. It is necessary only when there are $entities
// in the Action that produced the Bot's last response.
export function SelectTextAction(expectedResponse, lastResponse) {
  scorerModal.ClickTextAction(expectedResponse)
  VerifyTextChatMessage(expectedResponse)
  cy.Enqueue(() => {
    if (lastResponse) currentTrainingSummary.LastResponse = lastResponse
    else currentTrainingSummary.LastResponse = expectedResponse
  })
}

export function SelectApiCardAction(apiName, expectedCardTitle, expectedCardText) {
  scorerModal.ClickApiAction(apiName)
  VerifyCardChatMessage(expectedCardTitle, expectedCardText)
  cy.Enqueue(() => { currentTrainingSummary.LastResponse = apiName })
}

export function SelectApiPhotoCardAction(apiName, expectedCardTitle, expectedCardText, expectedCardImage) {
  scorerModal.ClickApiAction(apiName)
  VerifyPhotoCardChatMessage(expectedCardTitle, expectedCardText, expectedCardImage)
  cy.Enqueue(() => { currentTrainingSummary.LastResponse = apiName })
}

export function SelectApiTextAction(apiName, expectedResponse) {
  scorerModal.ClickApiAction(apiName)
  VerifyTextChatMessage(expectedResponse)
  cy.Enqueue(() => { currentTrainingSummary.LastResponse = apiName })
}

export function SelectEndSessionAction(expectedData) {
  scorerModal.ClickEndSessionAction(expectedData);
  VerifyEndSessionChatMessage(expectedData)
  cy.Enqueue(() => { currentTrainingSummary.LastResponse = expectedData })
}

// To verify the last chat utterance leave expectedIndexOfMessage undefined.
export function VerifyTextChatMessage(expectedMessage, expectedIndexOfMessage) {
  cy.Get('[data-testid="web-chat-utterances"]').then(allChatElements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = allChatElements.length - 1
    let elements = Cypress.$(allChatElements[expectedIndexOfMessage]).find('div.format-markdown > p')
    if (elements.length == 0) {
      throw new Error(`Did not find expected Text Chat Message '${expectedMessage}' at index: ${expectedIndexOfMessage}`)
    }
    
    let textContentWithoutNewlines = helpers.TextContentWithoutNewlines(elements[0])
    helpers.ConLog('VerifyTextChatMessage', textContentWithoutNewlines)

    if (helpers.TextContentWithoutNewlines(elements[0]) !== expectedMessage) {
      throw new Error(`Expected to find '${expectedMessage}' in the text chat pane, instead we found '${textContentWithoutNewlines}' at index: ${expectedIndexOfMessage}`)
    }
  })
}

// To verify the last chat utterance leave expectedIndexOfMessage undefined.
// Leave expectedMessage temporarily undefined so that you can copy the text
// output from the screen or log to paste into your code.
export function VerifyCardChatMessage(expectedCardTitle, expectedCardText, expectedIndexOfMessage) {
  cy.Get('[data-testid="web-chat-utterances"]').then(allChatElements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = allChatElements.length - 1
    let elements = Cypress.$(allChatElements[expectedIndexOfMessage]).find(`div.format-markdown > p:contains('${expectedCardTitle}')`).parent()
    if (elements.length == 0) {
      throw new Error(`Did not find expected '${expectedCardTitle}' card with '${expectedCardText}' at index: ${expectedIndexOfMessage}`)
    }
    elements = Cypress.$(elements[0]).next('div.wc-list').find('div.wc-adaptive-card > div.ac-container > div.ac-container > div > p')
    if (elements.length == 0) {
      throw new Error(`Did not find expected content element for API Call card that should contain '${expectedCardText}' at index: ${expectedIndexOfMessage}`)
    }
    
    // Log the contents of the API Call card so that we can copy the exact string into the .spec.js file.
    let textContentWithoutNewlines = helpers.TextContentWithoutNewlines(elements[0])
    helpers.ConLog('VerifyCardChatMessage', textContentWithoutNewlines)
    
    if (!textContentWithoutNewlines.includes(expectedCardText)) {
      throw new Error(`Expected to find '${expectedCardTitle}' card with '${expectedCardText}', instead we found '${textContentWithoutNewlines}' at index: ${expectedIndexOfMessage}`)
    }
  })
}

// To verify the last chat utterance leave expectedIndexOfMessage undefined.
export function VerifyPhotoCardChatMessage(expectedCardTitle, expectedCardText, expectedCardImage, expectedIndexOfMessage) {
  const funcName = `VerifyPhotoCardChatMessage("${expectedCardTitle}", "${expectedCardText}", "${expectedCardImage}", ${expectedIndexOfMessage})`
  cy.Get('[data-testid="web-chat-utterances"]').then(allChatElements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = allChatElements.length - 1
    let errorMessage = ''
    
    if (Cypress.$(allChatElements[expectedIndexOfMessage]).find(`p:contains('${expectedCardTitle}')`).length == 0) {
      errorMessage += `Did not find expected card title: '${expectedCardTitle}' - `
    }
    
    if (Cypress.$(allChatElements[expectedIndexOfMessage]).find(`p:contains('${expectedCardText}')`).length == 0) {
      errorMessage += `Did not find expected card text: '${expectedCardText}' - `
    }
    
    if (Cypress.$(allChatElements[expectedIndexOfMessage]).find(`img[src="${expectedCardImage}"]`).length == 0) {
      errorMessage += `Did not find expected image: '${expectedCardImage}' - `
    }

    if (errorMessage.length > 0)  {
      helpers.ConLog(`VerifyPhotoCardChatMessage("${expectedCardTitle}", "${expectedCardText}", "${expectedCardImage}", ${expectedIndexOfMessage})`, `Chat Element at index ${expectedIndexOfMessage}: ${allChatElements[expectedIndexOfMessage].outerHTML}`)
      throw new Error(`${errorMessage}at chat turn index ${expectedIndexOfMessage}`)
    }
  })
}

export function VerifyEndSessionChatMessage(expectedData, expectedIndexOfMessage) {
  const expectedUtterance = 'EndSession: ' + expectedData
  cy.Get('[data-testid="web-chat-utterances"]').then(elements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = elements.length - 1
    const element = Cypress.$(elements[expectedIndexOfMessage]).find('div.wc-adaptive-card > div > div > p')[0]
    expect(helpers.TextContentWithoutNewlines(element)).to.equal(expectedUtterance)
  })
}

// This method is used to score AND AUTO-SELECT the action after branching.
export function ClickScoreActionsButtonAfterBranching(lastResponse) {
  ClickScoreActionsButton()
  cy.Enqueue(() => {
    currentTrainingSummary.LastResponse = lastResponse
  })
}

export function SaveAsIsVerifyInGrid() { 
  SaveAsIs(() => { 
    if (isBranched) VerifyTrainingSummaryIsInGrid(originalTrainingSummary)
    VerifyTrainingSummaryIsInGrid(currentTrainingSummary)
  })
}

// The verificationFunction is optional, without it this function will just save the Train Dialog.
export function SaveAsIs(verificationFunction) {
  const funcName = 'SaveAsIsVerifyInGrid'

  cy.DumpHtmlOnDomChange(true)

  ClickSaveCloseButton()
  cy.Enqueue(() => {
    // FUDGING on the time - adding 25 seconds because the time is set by the server
    // which is not exactly the same as our test machine.
    currentTrainingSummary.MomentTrainingEnded = Cypress.moment().add(25, 'seconds')

    cy.WaitForStableDOM()
    let renderingShouldBeCompleteTime = new Date().getTime() + 1000
    cy.wrap(1, {timeout: 60000}).should(() => {
      if (mergeModal.IsVisible()) {
        helpers.ConLog(funcName, 'mergeModal.IsVisible')

        mergeModal.$ClickSaveAsButton()
        renderingShouldBeCompleteTime = new Date().getTime() + 1000
        throw new Error('The Merge Modal popped up, and we clicked the Save As Is button...need to retry and wait for the grid to become visible')
      }

      if (modelPage.IsOverlaid() && !helpers.HasErrorMessage()) {
        helpers.ConLog(funcName, 'modalPage.IsOverlaid')
        renderingShouldBeCompleteTime = new Date().getTime() + 1000
        throw new Error('Overlay found thus Train Dialog Grid is not stable...retry until it is')
      } else if (new Date().getTime() < renderingShouldBeCompleteTime) {
        // There is no overlay, but we will still wait until we've seen this condition for 
        // at least 1 full second before we call it good.
        helpers.ConLog(funcName, 'Wait for no overlays for at least 1 second')
        throw new Error(`Waiting till no overlays show up for at least 1 second...retry '${funcName}'`)
      }
      helpers.ConLog(funcName, 'No overlays for at least 1 second')
    }).then(() => {
      if (verificationFunction) { verificationFunction() }
    })
  })
  cy.DumpHtmlOnDomChange(false)
}

function VerifyTrainingSummaryIsInGrid(trainingSummary) {
  const funcName = 'VerifyTrainingSummaryIsInGrid'
  // Keep these lines of logging code in this method, they come in handy when things go bad.
  helpers.ConLog(funcName, `FirstInput: ${trainingSummary.FirstInput}`)
  helpers.ConLog(funcName, `LastInput: ${trainingSummary.LastInput}`)
  helpers.ConLog(funcName, `LastResponse: ${trainingSummary.LastResponse}`)
  helpers.ConLog(funcName, `CreatedDate: ${trainingSummary.CreatedDate}`)
  helpers.ConLog(funcName, `LastModifiedDate: ${trainingSummary.LastModifiedDate}`)
  helpers.ConLog(funcName, `MomentTrainingStarted: ${trainingSummary.MomentTrainingStarted.format()}`)
  helpers.ConLog(funcName, `MomentTrainingEnded: ${trainingSummary.MomentTrainingEnded.format()}`)

  let tdGrid
  cy.wrap(1, {timeout: 60000}).should(() => {
    tdGrid = trainDialogsGrid.TdGrid.GetTdGrid(trainingSummary.TrainGridRowCount)
  }).then(() => {
    let iRow = tdGrid.FindGridRowByChatInputs(trainingSummary.FirstInput, trainingSummary.LastInput, trainingSummary.LastResponse)
    if (iRow >= 0) {
      const turns = trainDialogsGrid.GetTurns()
      const lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
      const createdDates = trainDialogsGrid.GetCreatedDates()
      
      // Keep these lines of logging code in this method, they come in handy when things go bad.
      helpers.ConLog(funcName, `CreatedDates[${iRow}]: ${createdDates[iRow]} --- ${helpers.Moment(createdDates[iRow]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)}`)
      helpers.ConLog(funcName, `LastModifiedDates[${iRow}]: ${lastModifiedDates[iRow]} --- ${helpers.Moment(lastModifiedDates[iRow]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)}`)
      helpers.ConLog(funcName, `Turns[${iRow}]: ${turns[iRow]}`)

      if (((trainingSummary.LastModifiedDate && lastModifiedDates[iRow] == trainingSummary.LastModifiedDate) ||
          helpers.Moment(lastModifiedDates[iRow]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)) &&
          turns[iRow] == trainingSummary.Turns &&
          ((trainingSummary.CreatedDate && createdDates[iRow] == trainingSummary.CreatedDate) ||
            helpers.Moment(createdDates[iRow]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded))) {

        helpers.ConLog(funcName, 'Found all of the expected data. Validation PASSES!')
        return // Fully VALIDATED! We found what we expected.
      }
    }
    throw new Error(`The grid should, but does not, contain a row with this data in it: FirstInput: ${trainingSummary.FirstInput} -- LastInput: ${trainingSummary.LastInput} -- LastResponse: ${trainingSummary.LastResponse} -- Turns: ${trainingSummary.Turns} -- LastModifiedDate: ${trainingSummary.LastModifiedDate} -- CreatedDate: ${trainingSummary.CreatedDate}`)
  })
}

export function AbandonDialog() {
  ClickAbandonDeleteButton()
  ClickConfirmAbandonDialogButton()
}

// You may provide both description and tags or just one of them.
export function EditTrainingByDescriptionAndOrTags(description, tags, expectedRowCount = -1) {
  const funcName = `EditTrainingByDescriptionAndOrTags(${description}, ${tags})`
  
  let tdGrid
  cy.wrap(1).should(() => {
    tdGrid = trainDialogsGrid.TdGrid.GetTdGrid(expectedRowCount)
  }).then(() => {
    let iRow = tdGrid.FindGridRowByDescriptionAndOrTags(description, tags)
    if (iRow >= 0) { 
      helpers.ConLog(funcName, `ClickTraining for row: ${iRow}`)
      trainDialogsGrid.ClickTraining(iRow)
      return
    }
    throw new Error(`Can't Find Training to Edit. The grid should, but does not, contain a row with this data in it: scenario: '${description}' -- tags: ${tags}`)
  })
}

export function VerifyCloseIsTheOnlyEnabledButton() {
  cy.Get('[data-testid="edit-dialog-modal-replay-button"]').should('be.disabled')
  cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').should('be.disabled')
  cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').should('be.enabled')
}

