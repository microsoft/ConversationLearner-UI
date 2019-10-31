/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as helpers from '../Helpers'

// TODO - REMOVE THIS BEFORE CODE REVIEW
// TODO - REMOVE THIS BEFORE CODE REVIEW
// TODO - REMOVE THIS BEFORE CODE REVIEW
export function XLabelTextAsEntity(text, entity, index = 0, itMustNotBeLabeledYet = true) {
  cy.Get('body').trigger('Test_SelectWord', { detail: { phrase: text, index: index } })
  cy.WaitForStableDOM().then(() => {
    const editorContainerElements = _GetEditorContainerForEntityDetectionPanel(index)
    cy.wrap(editorContainerElements).find('[data-testid="fuse-match-option"]').contains(entity).Click()
  })
}

export function TypeAlternativeInput(trainMessage) { cy.Get('[data-testid="entity-extractor-alternative-input-text"]').type(`${trainMessage}{enter}`) }

export function ClickEntityDetectionToken(tokenValue) { cy.Get('[data-testid="token-node-entity-value"]').contains(tokenValue).Click() }
export function ClickNewEntityButton() { cy.Get('[data-testid="entity-extractor-create-button"]').Click() }

export const EntityLabelUndoButtonSelector = '[data-testid="undo-changes-button"]'
export function VerifyEntityLabelUndoButtonIsDisabled() { cy.Get(EntityLabelUndoButtonSelector + '.is-disabled') }
export function VerifyEntityLabelUndoButtonIsEnabled() { cy.Get(EntityLabelUndoButtonSelector + ':not(.is-disabled)') }
export function ClickEntityLabelUndoButton() { cy.Get(EntityLabelUndoButtonSelector).Click() }

// expectedEntities is a string segment that you will see in the UI warning message.
export function VerifyDuplicateEntityLabelsWarning(expectedEntities) { cy.Get('[data-testid="entity-extractor-duplicate-entity-warning"]').contains(`Entities that are not multi-value (i.e. ${expectedEntities}) will only store the last labelled utterance`) }
export function VerifyNoDuplicateEntityLabelsWarning() { cy.DoesNotContain('[data-testid="entity-extractor-duplicate-entity-warning"]') }

export function VerifyMatchWarning(index = 0) { _VerifyFoundInEntityDetectionPanel(index, '[data-testid="entity-extractor-match-warning"]:contains("Equivalent input must contain the same detected Entities as the original input text.")') }
export function VerifyNoMatchWarning(index = 0) { _VerifyNotFoundInEntityDetectionPanel(index, '[data-testid="entity-extractor-match-warning"]') }

// TODO: The following set of functions need to be used by other functions as well
// TODO: The following set of functions need to be used by other functions as well
// TODO: The following set of functions need to be used by other functions as well
function _VerifyFoundInEntityDetectionPanel(index, selector) {
  cy.wrap(1).should(() => {
    if (_FindInEntityDetectionPanel(index, selector).length == 0) {
      throw new Error(`Expected Element not found in Entity Detection Panel at index ${index} - selector: '${selector}'`)
    }
  })
}

function _VerifyNotFoundInEntityDetectionPanel(index, selector) {
  cy.wrap(1).should(() => {
    if (_FindInEntityDetectionPanel(index, selector).length > 0) {
      throw new Error(`Expected Element should NOT be found in Entity Detection Panel at index ${index} - selector: '${selector}'`)
    }
  })
}

function _FindInEntityDetectionPanel(index, selector) {
  let elements = _GetEditorContainerForEntityDetectionPanel(index)
  return Cypress.$(elements[0]).find(selector)
}

function _GetEditorContainerForEntityDetectionPanel(index) {
  let elements = Cypress.$('div.slate-editor')
  if (index > elements.length - 1) {
    throw new Error(`GetEditorContainerForEntityDetectionPanel - invalid index: ${index} - maximum index is: ${elements.length - 1} `)
  }

  elements = Cypress.$(elements[index]).parents('div.editor-container')
  if (elements.length != 1) {
    throw new Error(`Did not find the single expected "div.editor-container" element.`)
  }
  return elements
}

// These works whether text is a word or a phrase.
// Currently this only works for the primary user input and NOT the alternative inputs, however,
// it could easily be expanded. Search for "Test_SelectWord" in this code file to see an example
// of how that could be done.
export function VerifyCanLabelTextAsEntity(text) { _VerifyLabelTextAsEntity(text, 'be.visible') }
export function VerifyCanNotLabelTextAsEntity(text) { _VerifyLabelTextAsEntity(text, 'be.hidden') }
function _VerifyLabelTextAsEntity(text, verification) {
  cy.Get('body').trigger('Test_SelectWord', { detail: text })
  cy.Get('[data-testid="entity-picker-entity-search"').should(verification)
}

export function VerifyTextIsLabeledAsEntity(text, entity) {
  cy.WaitForStableDOM().then(() => {
    if (!_IsWordLabeledAsEntity(text, entity)) { throw new Error(`Failed to find "${text}" labeled as "${entity}"`) }
  })
}

// index is for the possible alternative inputs, index=0 is for the primary input.
export function VerifyTextIsNotLabeledAsEntity(text, entity, index = 0) {
  cy.WaitForStableDOM().then(() => {
    if (_IsWordLabeledAsEntity(text, entity, index)) { 
      throw new Error(`At index ${index} we found that "${text}" is labeled as "${entity}" - it should have no label`) 
    }
  })
}

// index is for the possible alternative inputs, index=0 is for the primary input.
function _IsWordLabeledAsEntity(word, entity, index = 0) {
  let elements = Cypress.$('div.slate-editor')
  if (index > elements.length - 1) {
    throw new Error(`IsWordLabeledAsEntity - invalid index: ${index} - maximum index is: ${elements.length - 1} `)
  }

  let wordWasFound = false
  elements = Cypress.$(elements[index]).find('[data-testid="token-node-entity-value"] > span > span')
  helpers.ConLog('IsWordLabeledAsEntity', `Number of elements found: ${elements.length}`)

  // If you need to find a phrase, this part of the code will fail, 
  // you will need to upgrade this code in that case.
  for (let i = 0; i < elements.length; i++) {
    if (helpers.TextContentWithoutNewlines(elements[i]) === word) {
      wordWasFound = true
      if (Cypress.$(elements[i])
                 .parents('.cl-entity-node--custom')
                 .find(`[data-testid="custom-entity-name-button"]:contains('${entity}')`)
                 .length > 0) {
        return true
      }
    }
  }
  
  if (!wordWasFound) {
    throw new Error(`We could not find '${word}' in the phrase.`)
  }
  return false
}

// index is for the possible alternative inputs, index=0 is for the primary input.
export function LabelTextAsEntity(text, entity, index = 0, itMustNotBeLabeledYet = true) {
  function LabelIt() {
    // This works whether text is a word or a phrase.
    cy.Get('body').trigger('Test_SelectWord', { detail: { phrase: text, index: index } })
    cy.WaitForStableDOM().then(() => {
      const editorContainerElements = _GetEditorContainerForEntityDetectionPanel(index)
      cy.wrap(editorContainerElements).find('[data-testid="fuse-match-option"]').contains(entity).Click()
    })
  }

  if (itMustNotBeLabeledYet) {
    LabelIt()
  } else {
    // First make sure it is not already labeled before trying to label it.
    cy.WaitForStableDOM().then(() => { 
      if (!_IsWordLabeledAsEntity(text, entity, index)) {
        LabelIt()
      }
    })
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
    expect(elements.length).to.be.at.least(index + 1)
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

export function VerifyWordNotLabeledAsEntity(word, entity) { 
  cy.wrap(1).should(() => {
    if (_IsWordLabeledAsEntity(word, entity)) {
      throw new Error(`The word '${word}' was found, it should NOT be labeled as '${entity}'`)
    }
  })
}

// Verifies that the user input at index (0=primary, 1-n=alternative) has the
// expected text labeled as entities.
export function VerifyEntityLabelWithinSpecificInput(textEntityPairs, index) {
  cy.Get('div.slate-editor').then(elements => {
    expect(elements.length).to.be.at.least(index - 1)
    cy.wrap(elements[index]).within(() => {
      textEntityPairs.forEach(textEntityPair => VerifyEntityLabel(textEntityPair.text, textEntityPair.entity))
    })
  })
}



const entityLabelConflictPopupSelector = '[data-testid="entity-conflict-cancel"], [data-testid="entity-conflict-accept"]'
export function VerifyEntityLabelConflictPopup() { cy.Get(entityLabelConflictPopupSelector).should('have.length', 2) }
export function VerifyNoEntityLabelConflictPopup() { cy.Get(entityLabelConflictPopupSelector).should('have.length', 0) }

// textEntityPairs is an array of objects contains these two variables:
//  text = a word within the utterance that should already be labeled
//  entity = name of entity to label the word with
export function VerifyEntityLabelConflictPopupAndClose(previousTextEntityPairs, attemptedTextEntityPairs) { _VerifyEntityLabelConflictPopupAndClickButton(previousTextEntityPairs, attemptedTextEntityPairs, '[data-testid="entity-conflict-cancel"]') }
export function VerifyEntityLabelConflictPopupAndChangeToPevious(previousTextEntityPairs, attemptedTextEntityPairs) { _VerifyEntityLabelConflictPopupAndClickButton(previousTextEntityPairs, attemptedTextEntityPairs, '[data-testid="entity-conflict-accept"]') }
export function VerifyEntityLabelConflictPopupAndChangeToAttempted(previousTextEntityPairs, attemptedTextEntityPairs) { _VerifyEntityLabelConflictPopupAndClickButton(previousTextEntityPairs, attemptedTextEntityPairs, '[data-testid="entity-conflict-accept"]', true) }

function _VerifyEntityLabelConflictPopupAndClickButton(previousTextEntityPairs, attemptedTextEntityPairs, buttonSelector, selectAttempted = false) {
  helpers.ConLog('VerifyEntityLabelConflictPopupAndClickButton', 'start')
  
  if (previousTextEntityPairs) {
    cy.Get('[data-testid="extract-conflict-modal-previously-submitted-labels"]')
      .siblings('[data-testid="extractor-response-editor-entity-labeler"]')
      .within(() => { previousTextEntityPairs.forEach(textEntityPair => VerifyEntityLabel(textEntityPair.text, textEntityPair.entity)) })
  }

  if (attemptedTextEntityPairs) {
    cy.Get('[data-testid="extract-conflict-modal-conflicting-labels"]')
      .siblings('[data-testid="extractor-response-editor-entity-labeler"]')
      .within(() => { attemptedTextEntityPairs.forEach(textEntityPair => VerifyEntityLabel(textEntityPair.text, textEntityPair.entity)) })
  }
  
  if (selectAttempted) {
    cy.Get('[data-testid="extract-conflict-modal-conflicting-labels"]').click()
  }

  cy.get(buttonSelector).Click()
  helpers.ConLog('VerifyEntityLabelConflictPopupAndClickButton', 'end')
}
