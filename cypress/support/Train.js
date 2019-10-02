/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as popupModal from './components/PopupModal'
import * as modelPage from './components/ModelPage'
import * as scorerModal from './components/ScorerModal'
import * as trainDialogsGrid from './components/TrainDialogsGrid'
import * as mergeModal from './components/MergeModal'
import * as helpers from './Helpers'

let currentTrainingSummary
let originalTrainingSummary
let isBranched
let originalChatMessages
let editedChatMessages

function Today() { return Cypress.moment().format("MM/DD/YYYY") }

export const TypeYourMessageSelector = 'input.wc-shellinput[placeholder="Type your message..."]' // data-testid NOT possible
export const ScoreActionsButtonSelector = '[data-testid="score-actions-button"]'
export const TurnUndoButtonSelector = '[data-testid="edit-teach-dialog-undo-button"]'
export const EntityLabelUndoButtonSelector = '[data-testid="undo-changes-button"]'

export function TypeAlternativeInput(trainMessage) { cy.Get('[data-testid="entity-extractor-alternative-input-text"]').type(`${trainMessage}{enter}`) }
export function ClickSetInitialStateButton() { cy.Get('[data-testid="teach-session-set-initial-state"]').Click() }
export function ClickScoreActionsButton() { cy.Get(ScoreActionsButtonSelector).Click() }
export function VerifyEntityMemoryIsEmpty() { cy.Get('[data-testid="memory-table-empty"]').contains('Empty') }
export function ClickAddAlternativeInputButton() { cy.Get('[data-testid="entity-extractor-add-alternative-input-button"]').Click() }
export function ClickEntityDetectionToken(tokenValue) { cy.Get('[data-testid="token-node-entity-value"]').contains(tokenValue).Click() }

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

export function VerifyEntityLabelUndoButtonIsDisabled() { cy.Get(EntityLabelUndoButtonSelector + '.is-disabled') }
export function VerifyEntityLabelUndoButtonIsEnabled() { cy.Get(EntityLabelUndoButtonSelector + ':not(.is-disabled)') }
export function ClickEntityLabelUndoButton() { cy.Get(EntityLabelUndoButtonSelector).Click() }

// expectedEntities is a string segment that you will see in the UI warning message.
export function VerifyDuplicateEntityLabelsWarning(expectedEntities) { cy.Get('[data-testid="entity-extractor-duplicate-entity-warning"]').contains(`Entities that are not multi-value (i.e. ${expectedEntities}) will only store the last labelled utterance`) }
export function VerifyNoDuplicateEntityLabelsWarning() { cy.DoesNotContain('[data-testid="entity-extractor-duplicate-entity-warning"]') }

export function ClickNewEntityButton() { cy.Get('[data-testid="entity-extractor-create-button"]').Click() }

export function ClickConfirmAbandonDialogButton() { return cy.Get('[data-testid="confirm-cancel-modal-accept"]').Click() }
export function ClickReplayButton() { cy.Get('[data-testid="edit-dialog-modal-replay-button"]').Click() }

export function VerifyEntityFilter(entity) { cy.Get('[data-testid="dropdown-filter-by-entity"] > span.ms-Dropdown-title').ExactMatch(entity) }
export function VerifyActionFilter(action) { cy.Get('[data-testid="dropdown-filter-by-action"] > span.ms-Dropdown-title').ExactMatch(action) }
export function ClickClearFilterButton() { cy.Get('[data-testid="train-dialogs-clear-filter-button"]').Click() }

export function GetDescription() { return Cypress.$('[data-testid="train-dialog-description"]').attr('value') }
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

export function VerifyChatPanelIsDisabled() { cy.Get('div.cl-chatmodal_webchat').find('div.cl-overlay') }
export function VerifyChatPanelIsEnabled() { cy.Get('div.cl-chatmodal_webchat').DoesNotContain('div.cl-overlay') }

export function GetAllChatMessageElements() { 
  const elements = Cypress.$('div[data-testid="web-chat-utterances"] > div.wc-message-content > div')
  helpers.DumpElements('GetAllChatMessageElements', elements)
  return elements
}

export function GetChatTurnText(element, retainMarkup = false) {
  let pElements = Cypress.$(element).find('p')
  let text = ''
  for (let ip = 0; ip < pElements.length; ip++) {
    text += retainMarkup ? pElements[ip].innerHTML : helpers.TextContentWithoutNewlines(pElements[ip])
  }
  return text
}

export function GetAllChatMessages(retainMarkup = false) {
  let funcName = `GetAllChatMessages(retainMarkup: ${retainMarkup})`
  let elements = GetAllChatMessageElements()

  helpers.ConLog(funcName, `Number of Chat Elements Found: ${elements.length}`)
  let returnValues = []
  for (let i = 0; i < elements.length; i++)  {
    let text = GetChatTurnText(elements[i], retainMarkup)
    returnValues.push(text)
    helpers.ConLog(funcName, text)
  }
  return returnValues
}

export function VerifyNoChatTurnSelected() { cy.Get('[data-testid="chat-edit-add-user-input-button"], [data-testid="chat-edit-delete-turn-button"]').should('have.length', 0) }
export function VerifySelectedChatTurn(expectedMessage) { 
  cy.Get('[data-testid="chat-edit-add-user-input-button"], [data-testid="chat-edit-delete-turn-button"]')
    .parents('div.wc-message-wrapper')
    .find('div[data-testid="web-chat-utterances"] > div.wc-message-content > div')
    .then(elements => {
      let text = GetChatTurnText(elements[0])
      if (text !== expectedMessage) { throw new Error (`Expecting selected chat turn to be '${expectedMessage}', instead '${text}' was selected.`) }
    })
}

// Verify that the branch button is within the same control group as the message.
export function VerifyBranchButtonGroupContainsMessage(message) {
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', message)
}

export function AbandonBranchChanges() {
  ClickAbandonDeleteButton()
  popupModal.VerifyExactTitleNoContentClickButton('Are you sure you want to abandon this Training Dialog?', '[data-testid="confirm-cancel-modal-accept"]')
}

export function VerifyChatMessageCount(expectedCount) {
  cy.wrap(1, {timeout: 10000}).should(() => {
    let actualCount = GetAllChatMessageElements().length
    if(actualCount != expectedCount) {
      throw new Error(`Expecting the number of chat messages to be ${expectedCount} instead it is ${actualCount}`)
    }
  })
}

// -----------------------------------------------------------------------------
// Selects FROM ALL chat messages, from both Bot and User.
// Once clicked, more UI elements will become visible & enabled.
// OPTIONAL index parameter lets you select other than the 1st 
// instance of a message.
// RETURNS: The index of the selected turn.

export function SelectLastChatTurn() {
  cy.WaitForStableDOM().then(() => {
    const elements = GetAllChatMessageElements()
    cy.wrap(elements[elements.length - 1]).Click()
  })
}

export function SelectChatTurnExactMatch(message, index = 0) { 
  return SelectChatTurnInternal(message, index, (elementText, transformedMessage) => elementText === transformedMessage)}

export function SelectChatTurnStartsWith(message, index = 0) {
  return SelectChatTurnInternal(message, index, (elementText, transformedMessage) => elementText.startsWith(transformedMessage))}

function SelectChatTurnInternal(message, index, matchPredicate) {
  const funcName = `SelectChatTurnInternal('${message}', ${index})`
  cy.ConLog(funcName, `Start`)

  cy.WaitForStableDOM()
  cy.Enqueue(() => {
    const elements = GetAllChatMessageElements()
    helpers.ConLog(funcName, `Chat message count: ${elements.length}`)
    for (let i = 0; i < elements.length; i++) {
      const innerText = helpers.TextContentWithoutNewlines(elements[i])
      helpers.ConLog(funcName, `Chat turn - Text: '${innerText}' - Inner HTML '${elements[i].innerHTML}'`)
      if (matchPredicate(innerText, message)) {
        if (index > 0) index--
        else {
          helpers.ConLog(funcName, `FOUND!`)
          
          // It appears that this does not work all the time, seen it happen once so far.
          // Perhaps because it needs to be scrolled into view.
          elements[i].click()

          return i
        }
      }
      else helpers.ConLog(funcName, `NOT A MATCH`)
      helpers.ConLog(funcName, `NEXT`)
    }
    throw new Error(`${funcName} - Failed to find the message in chat utterances`)
  })
}

// -----------------------------------------------------------------------------

// This is meant to be called after SelectChatTurn for a user message.
// Do NOT use this for bot messages, since they have no branching capabilities.
// Side Effect: '@branchButton' alias is created.
export function VerifyBranchButtonIsInSameControlGroupAsMessage(message) {
  // Verify that the branch button is within the same control group as the originalMessage that was just selected.
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', message)
}

// This depends on the '@branchButton' alias having been created by the VerifyBranchButtonIsInSameControlGroupAsMessage() function.
// *** export function BranchChatTurn(message) {
//   cy.Get('@branchButton').Click()
//   cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${message}{enter}`)
// }

// Creates the '@allChatTurns' alias.
export function CreateAliasForAllChatTurns() {
  cy.Get('[data-testid="web-chat-utterances"]').as('allChatTurns')
}

export function VerifyChatTurnControlButtons(element, index) {
  let turnIsUserTurn
  if (element.classList.contains('wc-message-from-me')) turnIsUserTurn = true
  else if (element.classList.contains('wc-message-from-bot')) turnIsUserTurn = false
  else {
    helpers.ConLog(`VerifyChatTurnControlButtons()`, element.outerHTML)
    throw new Error('Expecting element to contain class with either "wc-message-from-me" or "wc-message-from-bot" (see console output for element dump)')
  }

  if (index > 0) cy.Contains('[data-testid="chat-edit-delete-turn-button"]', 'Delete Turn')
  else cy.DoesNotContain('[data-testid="chat-edit-delete-turn-button"]')

  cy.Contains('[data-testid="chat-edit-add-bot-response-button"]', '+')

  if (turnIsUserTurn) cy.Get('[data-testid="edit-dialog-modal-branch-button"]').Contains('Branch').ConLog(`VerifyChatTurnControlButtons()`, 'Branch Found')
  else cy.DoesNotContain('[data-testid="edit-dialog-modal-branch-button"]')

  cy.Contains('[data-testid="chat-edit-add-user-input-button"]', '+')
}

// Verify that there are NO Chat Edit Controls at all on this page.
export function VerifyThereAreNoChatEditControls() {
  cy.DoesNotContain('[data-testid="chat-edit-delete-turn-button"]')
  cy.DoesNotContain('[data-testid="chat-edit-add-bot-response-button"]', '+')
  cy.DoesNotContain('[data-testid="edit-dialog-modal-branch-button"]')
  cy.DoesNotContain('[data-testid="chat-edit-add-user-input-button"]', '+')
}

export function VerifyEndSessionChatTurnControls() {
  cy.Contains('[data-testid="chat-edit-delete-turn-button"]', 'Delete Turn')
  cy.DoesNotContain('[data-testid="chat-edit-add-bot-response-button"]')
  cy.DoesNotContain('[data-testid="edit-dialog-modal-branch-button"]')
  cy.DoesNotContain('[data-testid="chat-edit-add-user-input-button"]')
}


// This is an odd verification function in that it is validating test code that we
// had wrong at one point. We need to do this because if the cy.DoesNotContain fails
// to find the selector, it could mean that cy.DoesNotContain method has a bug in it.
export function VerifyCyDoesNotContainMethodWorksWithSpecialChatSelector(userMessage, botMessage) {
  cy.log('EXPECTED FAILURE Comming Next')
  cy.DoesNotContain('[data-testid="chat-edit-add-bot-response-button"]', '+', true).then(expectedFailureOccurred => {
    expect(expectedFailureOccurred).to.be.true
  })
}

// This works whether text is a word or a phrase.
export function VerifyCanLabelTextAsEntity(text) { _VerifyLabelTextAsEntity(text, 'be.visible') }
export function VerifyCanNotLabelTextAsEntity(text) { _VerifyLabelTextAsEntity(text, 'be.hidden') }
function _VerifyLabelTextAsEntity(text, verification) {
  cy.Get('body').trigger('Test_SelectWord', { detail: text })
  cy.Get('[data-testid="entity-picker-entity-search"').should(verification)
}

export function VerifyTextIsLabeledAsEntity(text, entity) {
  cy.WaitForStableDOM().then(() => {
    if (!IsTextLabeledAsEntity(text, entity)) { throw new Error(`Failed to find "${text}" labeled as "${entity}"`) }
  })
}

export function VerifyTextIsNotLabeledAsEntity(text, entity) {
  cy.WaitForStableDOM().then(() => {
    if (IsTextLabeledAsEntity(text, entity)) { throw new Error(`We found that "${text}" is labeled as "${entity}" - it should have no label`) }
  })
}

function IsTextLabeledAsEntity(text, entity) {
  let isLabeled = false
  const elements = Cypress.$('[data-testid="token-node-entity-value"] > span > span')

  // If you need to find a phrase, this part of the code will fail, 
  // you will need to upgrade this code in that case.
  for (let i = 0; i < elements.length; i++) {
    if (helpers.TextContentWithoutNewlines(elements[i]) === text) {
      isLabeled = Cypress.$(elements[i]).parents('.cl-entity-node--custom')
                        .find(`[data-testid="custom-entity-name-button"]:contains('${entity}')`)
                        .length > 0
      break;
    }
  }
  return isLabeled
}

export function LabelTextAsEntity(text, entity, itMustNotBeLabeledYet = true) {
  function LabelIt() {
    // This works whether text is a word or a phrase.
    cy.Get('body').trigger('Test_SelectWord', { detail: text })
    cy.Get('[data-testid="fuse-match-option"]').contains(entity).Click()
  }

  if (itMustNotBeLabeledYet) {
    LabelIt()
  } else {
    // First make sure it is not already labeled before trying to label it.
    cy.WaitForStableDOM().then(() => { if (!IsTextLabeledAsEntity(text, entity)) LabelIt() })
  }
}

// SelectEntityLabel and RemoveEntityLabel
// word = a word within the utterance that should already be labeled
// entity = name of entity the word was labeled with
// index = into one of the alternative inputs
// *** This does work for multiple word labels, but you must pass in only one
// *** word that uniquely identifies the labeled text
export function SelectEntityLabel(word, entity, index = 0) {
  cy.Get('div.slate-editor').then(elements => {
    expect(elements.length).to.be.at.least(index - 1)
    cy.wrap(elements[index]).within(() => {
      cy.Get('[data-testid="token-node-entity-value"] > span > span')
        .ExactMatch(word)
        .parents('.cl-entity-node--custom')
        .find('[data-testid="custom-entity-name-button"]')
        .contains(entity)
        .Click()
    })
  })
}
export function RemoveEntityLabel(word, entity, index = 0) {
  SelectEntityLabel(word, entity, index)
  cy.Get('button[title="Unselect Entity"]').Click() 
}



// Verify that a specific word of a user utterance has been labeled as an entity.
//  word = a word within the utterance that should already be labeled
//  entity = name of entity the word should be labeled with
// *** This does NOT work for multiple words. ***
export function VerifyEntityLabel(word, entity) {
  cy.log(`Verify that '${word}' is labeled as entity '${entity}'`)
  cy.Get('[data-testid="token-node-entity-value"] > span > span')
    .ExactMatch(word)
    .parents('.cl-entity-node--custom')
    .find('[data-testid="custom-entity-name-button"]')
    .contains(entity)
}

const entityLabelConflictPopupSelector = '[data-testid="entity-conflict-cancel"], [data-testid="entity-conflict-accept"]'
export function VerifyEntityLabelConflictPopup() { cy.Get(entityLabelConflictPopupSelector).should('have.length', 2) }
export function VerifyNoEntityLabelConflictPopup() { cy.Get(entityLabelConflictPopupSelector).should('have.length', 0) }

// textEntityPairs is an array of objects contains these two variables:
//  text = a word within the utterance that should already be labeled
//  entity = name of entity to label the word with
export function VerifyEntityLabelConflictPopupAndClose(textEntityPairs) { VerifyEntityLabelConflictPopupAndClickButton(textEntityPairs, '[data-testid="entity-conflict-cancel"]') }
export function VerifyEntityLabelConflictPopupAndAccept(textEntityPairs) { VerifyEntityLabelConflictPopupAndClickButton(textEntityPairs, '[data-testid="entity-conflict-accept"]') }

function VerifyEntityLabelConflictPopupAndClickButton(textEntityPairs, buttonSelector) {
  cy.Get('[data-testid="extract-conflict-modal-previously-submitted-labels"]')
    .siblings('[data-testid="extractor-response-editor-entity-labeler"]')
    .within(() => { textEntityPairs.forEach(textEntityPair => VerifyEntityLabel(textEntityPair.text, textEntityPair.entity)) })
  
  cy.get(buttonSelector).Click()  
}

export function VerifyEntityLabelWithinSpecificInput(textEntityPairs, index) {
  cy.Get('div.slate-editor').then(elements => {
    expect(elements.length).to.be.at.least(index - 1)
    cy.wrap(elements[index]).within(() => {
      textEntityPairs.forEach(textEntityPair => VerifyEntityLabel(textEntityPair.text, textEntityPair.entity))
    })
  })
}

export function InsertUserInputAfter(existingMessage, newMessage) {
  SelectChatTurnExactMatch(existingMessage)

  // This ODD way of clicking is to avoid the "Illegal Invocation" error that
  // happens with this specific UI element.
  cy.RunAndExpectDomChange(() => { Cypress.$('[data-testid="chat-edit-add-user-input-button"]')[0].click() })

  cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${newMessage}{enter}`)
}

// OPTIONAL newMessage parameter if provided will replace the autoselected Bot response
// OPTIONAL index parameter lets you select other than the 1st 
// instance of a message as the point of insertion.
export function InsertBotResponseAfter(existingMessage, newMessage, index = 0) {
  cy.ConLog(`InsertBotResponseAfter(${existingMessage}, ${newMessage})`, `Start`)
  cy.Enqueue(() => { return SelectChatTurnExactMatch(existingMessage, index) }).then(indexOfSelectedChatTurn => {
    helpers.ConLog(`InsertBotResponseAfter(${existingMessage}, ${newMessage})`, `indexOfSelectedChatTurn: ${indexOfSelectedChatTurn}`)
    
    // This ODD way of clicking is to avoid the "Illegal Invocation" error that
    // happens with this specific UI element.
    cy.RunAndExpectDomChange(() => { Cypress.$('[data-testid="chat-edit-add-bot-response-button"]')[0].click() })
    
    if (newMessage) {
      cy.WaitForStableDOM()
      
      cy.Enqueue(() => { 
        // Sometimes the UI has already automaticly selected the Bot response we want
        // so we need to confirm that we actually need to click on the action, 
        // otherwise an unnecessary message box pops up that we don't want to deal with.

        const chatMessages = GetAllChatMessages()
        const indexOfInsertedBotResponse = indexOfSelectedChatTurn + 1
        if (chatMessages[indexOfInsertedBotResponse] != newMessage) {
          scorerModal.ClickTextAction(newMessage)
          VerifyTextChatMessage(newMessage, indexOfInsertedBotResponse)
        }
      })
    }
    cy.ConLog(`InsertBotResponseAfter(${existingMessage}, ${newMessage})`, `End`)
  })
}

export function VerifyChatTurnIsNotAnExactMatch(turnTextThatShouldNotMatch, expectedTurnCount, turnIndex) {
  VerifyChatTurnInternal(expectedTurnCount, turnIndex, chatMessageFound => {
    if (chatMessageFound === turnTextThatShouldNotMatch) { 
      throw new Error(`Chat turn ${turnIndex} should NOT be an exact match to: ${turnTextThatShouldNotMatch}, but it is`) 
    }
  })
}

export function VerifyChatTurnIsAnExactMatch(expectedTurnText, expectedTurnCount, turnIndex) { 
  VerifyChatTurnInternal(expectedTurnCount, turnIndex, chatMessageFound => {
    if (chatMessageFound !== expectedTurnText) { 
      if (chatMessageFound !== expectedTurnText) {
        throw new Error(`Chat turn ${turnIndex} should be an exact match to: ${expectedTurnText}, however, we found ${chatMessageFound} instead`) 
      }
    }
  })
}

export function VerifyChatTurnIsAnExactMatchWithMarkup(expectedTurnText, expectedTurnCount, turnIndex) { 
  VerifyChatTurnInternal(expectedTurnCount, turnIndex, chatMessageFound => {
    if (chatMessageFound !== expectedTurnText) { 
      if (chatMessageFound !== expectedTurnText) {
        throw new Error(`Chat turn ${turnIndex} should be an exact match to: ${expectedTurnText}, however, we found ${chatMessageFound} instead`) 
      }
    }
  }, true)
}

// This function does the hard work of retrying until the chat message count is what we expect
// before it verifies a specific chat turn with a custom verification.
function VerifyChatTurnInternal(expectedTurnCount, turnIndex, verificationFunc, retainMarkup = false) {
  cy.WaitForStableDOM()
  let chatMessages
  cy.wrap(1).should(() => { 
    chatMessages = GetAllChatMessages(retainMarkup)
    if (chatMessages.length != expectedTurnCount) { 
      throw new Error(`${chatMessages.length} chat turns were found, however we were expecting ${expectedTurnCount}`)
    }
  }).then(() => {
    if(chatMessages.length < turnIndex) { 
      throw new Error(`VerifyChatTurnInternal(${expectedTurnCount}, ${turnIndex}): ${chatMessages.length} is not enough chat turns to find the requested turnIndex`) 
    }
    
    verificationFunc(chatMessages[turnIndex])
  })
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

export function EditTraining(firstInput, lastInput, lastResponse) {
  const funcName = `EditTraining(${firstInput}, ${lastInput}, ${lastResponse})`
  let trainDialogIndex
  cy.WaitForStableDOM().then(() => {
    const turns = trainDialogsGrid.GetTurns()
    const firstInputs = trainDialogsGrid.GetFirstInputs()
    const lastInputs = trainDialogsGrid.GetLastInputs()
    const lastResponses = trainDialogsGrid.GetLastResponses()
    const lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
    const createdDates = trainDialogsGrid.GetCreatedDates()

    helpers.ConLog(funcName, `${turns.length}, ${lastInputs[0]}, ${lastInputs[1]}, ${lastInputs[2]}`)

    for (let i = 0; i < firstInputs.length; i++) {
      if (firstInputs[i] == firstInput && lastInputs[i] == lastInput && lastResponses[i] == lastResponse) {
        currentTrainingSummary = {
          FirstInput: firstInputs[i],
          LastInput: lastInputs[i],
          LastResponse: lastResponses[i],
          Turns: turns[i],
          // FUDGING on the time - subtract 25 seconds because the time is set by the server
          // which is not exactly the same as our test machine.
          MomentTrainingStarted: Cypress.moment().subtract(25, 'seconds'),
          MomentTrainingEnded: undefined,
          LastModifiedDate: lastModifiedDates[i],
          CreatedDate: createdDates[i],
          TrainGridRowCount: (turns ? turns.length : 0)
        }
        originalTrainingSummary = Object.create(currentTrainingSummary)
        isBranched = false

        helpers.ConLog(funcName, `ClickTraining for Train Dialog Row #${i} - ${turns[i]}, ${firstInputs[i]}, ${lastInputs[i]}, ${lastResponses[i]}`)
        trainDialogsGrid.ClickTraining(i)
        trainDialogIndex = i
        return
      }
    }
    throw new Error(`Can't Find Training to Edit. The grid should, but does not, contain a row with this data in it: FirstInput: ${firstInput} -- LastInput: ${lastInput} -- LastResponse: ${lastResponse}`)
  })
  .then(() => {
    // Sometimes the first click on the grid row does not work, so we implemented this logic to watch and see
    // if it loaded, and if not to re-click on the row. So far we've never seen it require a 3rd click.
    cy.WaitForStableDOM()

    const funcName2 = funcName + ' - VALIDATION PHASE'
    let retryCount = 0

    helpers.ConLog(funcName2, `Row #${trainDialogIndex}`)

    cy.wrap(1, {timeout: 8000}).should(() => {
      const allChatMessageElements = GetAllChatMessageElements()
      if (allChatMessageElements.length > 0) {
        helpers.ConLog(funcName2, `The expected Train Dialog from row #${trainDialogIndex} has loaded`)
        return
      }
      
      helpers.ConLog(funcName2, `We are still waiting for the Train Dialog to load`)
      retryCount++
      if (retryCount % 5 == 0) {
        helpers.ConLog(funcName2, `Going to click on Train Dialog Row #${trainDialogIndex} again.`)
        
        // The problem with calling ClickTraining is that it causes the cy.wrap timeout to be canceled.
        // CANNOT USE THIS - trainDialogsGrid.ClickTraining(trainDialogIndex)
        Cypress.$('[data-testid="train-dialogs-description"]')[trainDialogIndex].click({force: true})

        throw new Error(`Retry - We just finished clicking on Train Dialog Row #${trainDialogIndex} again.`)
      }
      throw new Error('Retry - We have not yet achieved our goal')
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
    cy.wrap(1, {timeout: 10000}).should(() => {
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

  let renderingShouldBeCompleteTime = new Date().getTime()
  cy.Get('[data-testid="train-dialogs-turns"]', {timeout: 10000})
    .should(elements => { 
      if (modelPage.IsOverlaid()) {
        helpers.ConLog(funcName, 'modalPage.IsOverlaid')
        renderingShouldBeCompleteTime = new Date().getTime() + 1000
        throw new Error('Overlay found thus Train Dialog Grid is not stable...retry until it is')
      } else if (new Date().getTime() < renderingShouldBeCompleteTime) {
        helpers.ConLog(funcName, 'Wait for no overlays for at least 1 second')
        throw new Error(`Waiting till no overlays show up for at least 1 second...retry '${funcName}'`)
      }

      if (elements.length != trainingSummary.TrainGridRowCount) { 
        helpers.ConLog(funcName, `Did NOT find the expected row count: ${elements.length}.`)
        throw new Error(`${elements.length} rows found in the training grid, however we were expecting ${trainingSummary.TrainGridRowCount}`)
      }

      helpers.ConLog(funcName, `Found the expected row count: ${elements.length}`)

      const turns = trainDialogsGrid.GetTurns()
      const firstInputs = trainDialogsGrid.GetFirstInputs()
      const lastInputs = trainDialogsGrid.GetLastInputs()
      const lastResponses = trainDialogsGrid.GetLastResponses()
      const lastModifiedDates = trainDialogsGrid.GetLastModifiedDates()
      const createdDates = trainDialogsGrid.GetCreatedDates()
  
      for (let i = 0; i < trainingSummary.TrainGridRowCount; i++) {
        // Keep these lines of logging code in this method, they come in handy when things go bad.
        helpers.ConLog(funcName, `CreatedDates[${i}]: ${createdDates[i]} --- ${helpers.Moment(createdDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)}`)
        helpers.ConLog(funcName, `LastModifiedDates[${i}]: ${lastModifiedDates[i]} --- ${helpers.Moment(lastModifiedDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)}`)
        helpers.ConLog(funcName, `Turns[${i}]: ${turns[i]}`)
  
        if (((trainingSummary.LastModifiedDate && lastModifiedDates[i] == trainingSummary.LastModifiedDate) ||
            helpers.Moment(lastModifiedDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)) &&
            turns[i] == trainingSummary.Turns &&
            ((trainingSummary.CreatedDate && createdDates[i] == trainingSummary.CreatedDate) ||
              helpers.Moment(createdDates[i]).isBetween(trainingSummary.MomentTrainingStarted, trainingSummary.MomentTrainingEnded)) &&
            firstInputs[i] == trainingSummary.FirstInput &&
            lastInputs[i] == trainingSummary.LastInput &&
            lastResponses[i] == trainingSummary.LastResponse) {

          helpers.ConLog(funcName, 'Found all of the expected data. Validation PASSES!')
          return; // Fully VALIDATED! We found what we expected.
        }
      }
      throw new Error(`The grid should, but does not, contain a row with this data in it: FirstInput: ${trainingSummary.FirstInput} -- LastInput: ${trainingSummary.LastInput} -- LastResponse: ${trainingSummary.LastResponse} -- Turns: ${trainingSummary.Turns} -- LastModifiedDate: ${trainingSummary.LastModifiedDate} -- CreatedDate: ${trainingSummary.CreatedDate}`)
    })
}

export function VerifyAllChatMessages(chatMessagesToBeVerified) {
  cy.WaitForStableDOM().then(() => {
    let errorMessage = ''
    const allChatMessages = GetAllChatMessages()

    if (allChatMessages.length != chatMessagesToBeVerified.length)
      errorMessage += `Original chat message count was ${chatMessagesToBeVerified.length}, current chat message count is ${allChatMessages.length}.`

    const length = Math.max(allChatMessages.length, chatMessagesToBeVerified.length)
    for (let i = 0; i < length; i++) {
      if (i >= allChatMessages.length)
        errorMessage += `-- [${i}] - Original: '${chatMessagesToBeVerified[i]}' is extra'`
      else if (i >= chatMessagesToBeVerified.length)
        errorMessage += `-- [${i}] - Current: '${allChatMessages[i]}' is extra'`
      else if (allChatMessages[i] != chatMessagesToBeVerified[i])
        errorMessage += `-- [${i}] - Original: '${chatMessagesToBeVerified[i]}' does not match current: '${allChatMessages[i]}'`
    }
    if (errorMessage.length > 0) throw errorMessage
  })
}

export function BranchChatTurn(originalMessage, newMessage, originalIndex = 0) {
  cy.Enqueue(() => {
    originalMessage = originalMessage

    SelectChatTurnExactMatch(originalMessage, originalIndex)

    VerifyBranchButtonIsInSameControlGroupAsMessage(originalMessage)

    // Capture the list of messages currently in the chat, truncate it at the point of branching, then add the new message to it.
    // This array will be used later to validate that the changed chat is persisted.
    let branchedChatMessages
    cy.WaitForStableDOM().then(() => {
      branchedChatMessages = GetAllChatMessages()
      for (let i = 0; i < branchedChatMessages.length; i++) {
        if (branchedChatMessages[i] == originalMessage) {
          branchedChatMessages.length = i + 1
          branchedChatMessages[i] = newMessage
        }
      }
    })

    cy.Get('@branchButton').Click()
    cy.Get('[data-testid="user-input-modal-new-message-input"]').type(`${newMessage}{enter}`)
  
    cy.WaitForStableDOM().then(() => {
      isBranched = true
      originalTrainingSummary.TrainGridRowCount++
      currentTrainingSummary.TrainGridRowCount++

      VerifyAllChatMessages(branchedChatMessages)
    })
  })
}

export function SelectAndVerifyEachChatTurnHasExpectedButtons() { SelectAndVerifyEachChatTurn(VerifyChatTurnControlButtons) }
export function SelectAndVerifyEachChatTurnHasNoButtons() { SelectAndVerifyEachChatTurn(VerifyThereAreNoChatEditControls) }
export function SelectAndVerifyEachBotChatTurnHasNoSelectActionButtons() { SelectAndVerifyEachChatTurn( scorerModal.VerifyNoEnabledSelectActionButtons, 1, 2) }

function SelectAndVerifyEachChatTurn(verificationFunction, index = 0, increment = 1, initialized = false) {
  if (!initialized) { 
    CreateAliasForAllChatTurns() 
  }

  cy.Get('@allChatTurns').then(elements => {
    if (index < elements.length) {
      cy.wrap(elements[index]).Click().then(() => {
        verificationFunction(elements[index], index)
        SelectAndVerifyEachChatTurn(verificationFunction, index + increment, increment, true)
      })
    }
  })
}

export function SelectAndVerifyScoreActionsForEachBotChatTurn(expectedScoreActionsForEachBotTurn) { 
  function VerificationFunction(element, index) { scorerModal.VerifyScoreActions(expectedScoreActionsForEachBotTurn[index / 2]) }
  SelectAndVerifyEachChatTurn( VerificationFunction, 1, 2) 
}

export function AbandonDialog() {
  ClickAbandonDeleteButton()
  ClickConfirmAbandonDialogButton()
}

export function EditTrainingByDescriptionAndTags(desctiption, tags) {
  const funcName = `EditTrainingByDescriptionAndTags(${desctiption}, ${tags})`
  cy.Enqueue(() => {
    const tagsFromGrid = trainDialogsGrid.GetTags()
    const scenarios = trainDialogsGrid.GetDescription()

    helpers.ConLog(funcName, `Row Count: ${scenarios.length}`)

    for (let i = 0; i < scenarios.length; i++) {
      if (scenarios[i] === desctiption && tagsFromGrid[i] == tags) {
        helpers.ConLog(funcName, `ClickTraining for row: ${i}`)
        trainDialogsGrid.ClickTraining(i)
        return
      }
    }
    throw new Error(`Can't Find Training to Edit. The grid should, but does not, contain a row with this data in it: scenario: '${desctiption}' -- tags: ${tags}`)
  })
}

export function VerifyCloseIsTheOnlyEnabledButton() {
  cy.Get('[data-testid="edit-dialog-modal-replay-button"]').should('be.disabled')
  cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').should('be.disabled')
  cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').should('be.enabled')
}

export function VerifyListOfTrainDialogs(expectedTrainDialogs) {
  const expectedRowCount = expectedTrainDialogs.length
  const funcName = `VerifyListOfTrainDialogs(expectedRowCount: ${expectedRowCount})`
  cy.log('Verify List of Train Dialogs', expectedRowCount)

  cy.Get('[data-testid="train-dialogs-turns"]').should('have.length', expectedRowCount).then(() => {
    const firstInputs = trainDialogsGrid.GetFirstInputs()
    const lastInputs = trainDialogsGrid.GetLastInputs()
    const lastResponses = trainDialogsGrid.GetLastResponses()

    let errors = false
    expectedTrainDialogs.forEach(trainDialog => {
      helpers.ConLog(funcName, `Find - "${trainDialog.firstInput}", "${trainDialog.lastInput}", "${trainDialog.lastResponse}"`)
      let found = false
      for (let i = 0; i < firstInputs.length; i++) {
        if (firstInputs[i] == trainDialog.firstInput && lastInputs[i] == trainDialog.lastInput && lastResponses[i] == trainDialog.lastResponse) {
          found = true
          helpers.ConLog(funcName, `Found on row ${i}`)
          break;
        }
      }
      
      if (!found) {
        helpers.ConLog(funcName, 'ERROR - NOT Found')
        errors = true
      }
    })
    
    if (errors) {
      throw new Error('Did not find 1 or more of the expected Train Dialogs in the grid. Refer to the log file for details.')
    }
  })
}

export function GetAllTrainDialogGridRows() { 
  helpers.ConLog('GetAllTrainDialogGridRows', 'start')

  const firstInputs = trainDialogsGrid.GetFirstInputs()
  const lastInputs = trainDialogsGrid.GetLastInputs()
  const lastResponses = trainDialogsGrid.GetLastResponses()

  let allRowData = []

  for (let i = 0; i < firstInputs.length; i++) {
    allRowData.push({
      firstInput: firstInputs[i],
      lastInput: lastInputs[i],
      lastResponse: lastResponses[i],
    })

    helpers.ConLog('GetAllTrainDialogGridRows', `${allRowData.firstInput}, ${allRowData.lastInput}, ${allRowData.lastResponse}`)
  }
  
  return allRowData
}

export class BotChatElements {
  constructor() {
    this.botChatElements = Cypress.$('div.wc-message-from-bot[data-testid="web-chat-utterances"]')
    this.index = this.botChatElements.length > 0 ? 0 : undefined
  }
  
  SelectNext() {
    if (!this.index) { return undefined }

    const chatText = helpers.TextContentWithoutNewlines(botChatElements[i])
    it(`Select Bot Response: ${chatText.substring(0,32)}`, () => {
      Cypress.$(botChatElements[i]).Click()
    })

    return this.botChatElements.length >= ++this.index ? 0 : undefined
  }
}

export function VerifyEachBotChatTurn(verificationFunction) {
  cy.Get('div.wc-message-from-bot[data-testid="web-chat-utterances"]').then(botChatElements => {
    for (let i = 0; i < botChatElements.length; i++) {
      const chatText = helpers.TextContentWithoutNewlines(botChatElements[i])
      cy.log(`Select Bot Response: ${chatText.substring(0,32)}`)
      cy.wrap(botChatElements[i]).Click()
      verificationFunction()
    }
  })
}
