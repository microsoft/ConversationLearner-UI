/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as trainDialogsGrid from './TrainDialogsGrid'
import * as popupModal from './PopupModal'
import * as scorerModal from './ScorerModal'
import * as helpers from '../Helpers'

export function VerifyChatPanelIsDisabled() { cy.Get('div.cl-chatmodal_webchat').find('div.cl-overlay') }
export function VerifyChatPanelIsEnabled() { cy.Get('div.cl-chatmodal_webchat').DoesNotContain('div.cl-overlay') }

export function GetAllChatMessageElements() { 
  const elements = Cypress.$('div[data-testid="web-chat-utterances"] > div.wc-message-content > div')
  helpers.DumpElements('GetAllChatMessageElements', elements)
  return elements
}

function GetChatTurnText(element, retainMarkup = false) {
  let pElements = Cypress.$(element).find('p, span.format-plain > span')
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

export function VerifyChatMessageCount(expectedCount) {
  cy.WaitForStableDOM()
  cy.wrap(1, {timeout: 10000}).should(() => {
    let actualCount = GetAllChatMessageElements().length
    if (actualCount != expectedCount) {
      throw new Error(`Expecting the number of chat messages to be ${expectedCount} instead it is ${actualCount}.`)
    }
  })
}

// index is for the chat turn to verify has an error
export function VerifyChatTurnHasError(index) {
  cy.WaitForStableDOM()
  cy.log(`VerifyChatTurnHasError(${index})`)
  cy.wrap(1).should(() => {
    const chatElements = Cypress.$('div[data-testid="web-chat-utterances"]')
    if (index >= chatElements.length) {
      throw new Error(`Expecting there to be at least ${index + 1} chat turns, instead there are only ${chatElements.length}.`)
    }

    if (!Cypress.$(chatElements[index]).attr('class').includes('wc-border-error')) {
      throw new Error(`Expecting the chat turn at index ${index} to be marked with error coloring but it is not.`)
    }
  })
}

export function VerifyChatTurnHasNoError(index) {
  cy.WaitForStableDOM()
  cy.log(`VerifyChatTurnHasNoError(${index})`)
  cy.wrap(1).should(() => {
    const chatElements = Cypress.$('div[data-testid="web-chat-utterances"]')
    if (index >= chatElements.length) {
      throw new Error(`Expecting there to be at least ${index + 1} chat turns, instead there are only ${chatElements.length}.`)
    }

    if (Cypress.$(chatElements[index]).attr('class').includes('wc-border-error')) {
      throw new Error(`Expecting the chat turn at index ${index} to NOT be marked with error coloring but it is marked.`)
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
        if (index > 0) {
          index--
        } else {
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
        throw new Error(`Chat turn ${turnIndex} should be an exact match to: '${expectedTurnText}', however, we found '${chatMessageFound}' instead`) 
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

// Verify that the branch button is within the same control group as the message.
export function VerifyBranchButtonGroupContainsMessage(message) {
  cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
    .parents('div.wc-message-selected').contains('p', message)
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

    // Verify that the Branch Button is in the same control group as the chat message that was just selected.
    cy.Get('[data-testid="edit-dialog-modal-branch-button"]').as('branchButton')
      .parents('div.wc-message-selected').contains('p', originalMessage)

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
      trainDialogsGrid.TdGrid.BranchTrainDialog()
      VerifyAllChatMessages(branchedChatMessages)
    })
  })
}

export function SelectAndVerifyEachChatTurnHasExpectedButtons() { SelectAndVerifyEachChatTurn(VerifyChatTurnControlButtons) }
export function SelectAndVerifyEachChatTurnHasNoButtons() { SelectAndVerifyEachChatTurn(VerifyThereAreNoChatEditControls) }
export function SelectAndVerifyEachBotChatTurnHasNoSelectActionButtons() { SelectAndVerifyEachChatTurn( scorerModal.VerifyNoEnabledSelectActionButtons, 1, 2) }

function SelectAndVerifyEachChatTurn(verificationFunction, index = 0, increment = 1, initialized = false) {
  if (!initialized) { 
    // Create an alias for all chat turns
    cy.Get('[data-testid="web-chat-utterances"]').as('allChatTurns') 
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

// To verify the last chat utterance leave expectedIndexOfMessage undefined.
export function VerifyTextChatMessage(expectedMessage, expectedIndexOfMessage) {
  cy.Get('[data-testid="web-chat-utterances"]').then(allChatElements => {
    if (!expectedIndexOfMessage) expectedIndexOfMessage = allChatElements.length - 1
    const elements = Cypress.$(allChatElements[expectedIndexOfMessage]).find('div.format-markdown > p')
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

export function PreSaveDataUsedToVerifyTdGrid(description, tagList) {
  let funcName = `PreSaveDataUsedToVerifyTdGrid("${description}", "${tagList}")`
  helpers.ConLog(funcName, 'start')
  cy.WaitForStableDOM().then(() => {
    // When the TD ends with a user turn, the lastResponse needs to be an empty string.
    let lastResponse = ''
    
    let elements = GetAllChatMessageElements()
    const lastBotElement = Cypress.$(elements[elements.length - 1]).parents('div.wc-message-from-bot')
    if (lastBotElement.length == 1) {
      // The last chat turn was a Bot response, so capture the text with entity names.
      cy.wrap(elements[elements.length - 1]).Click()
      cy.Enqueue(() => { return scorerModal.GetTextWithEntityNamesFromSelectedAction() }).then(actionText => {
        lastResponse = actionText
      })
    }

    // If there is no second user turn, then the first and last user turn are the same.
    elements = Cypress.$('div.wc-message-from-me[data-testid="web-chat-utterances"] > div.wc-message-content > div')
    const firstInput = GetChatTurnText(elements[0])
    const lastInput = GetChatTurnText(elements[elements.length - 1])
    
    cy.Enqueue(() => { trainDialogsGrid.TdGrid.SaveTrainDialog(firstInput, lastInput, lastResponse, description, tagList) })
  })
}

