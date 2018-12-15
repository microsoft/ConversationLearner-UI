/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const testLog = require('../utils/testlog')

/** Chat: Types a new user's message */
function typeYourMessage(trainmessage) {
  testLog.logStart("Submit message to WebChat");
  cy.server()
  cy.route('PUT', '/sdk/app/*/teach/*/extractor').as('putExtractor')
  cy.get('input[class="wc-shellinput"]').type(trainmessage)
  cy.get('label[class="wc-send"]')
    .then(function (response) {
      testLog.logStep("type new user message")
    })
    .click()
    .wait('@putExtractor');
  testLog.logEnd();
}

function highlightWord(word) {
  cy.get('span[class="cl-token-node"]')
    .contains(word)
    .trigger('keydown')
    .click(10, 10)
    .wait(1000);
  cy.get('.custom-toolbar.custom-toolbar--visible')
    .invoke('show')
    .wait();
}

function verifyTokenNodeExists() {
  cy.get('.cl-token-node')
    .should('exists');
}

/** Click on 'Score Action' button */
function clickScoreActions() {
  testLog.logStart("Click on Score Actions");
  cy.server()
  cy.route('PUT', '/sdk/app/*/teach/*/scorer').as('putScorer')
  cy.get('[data-testid="button-proceedto-scoreactions"]')
    .then(function (response) {
      testLog.logStep("proceed to score actions")
    })
    .click()
    .wait('@putScorer');
  testLog.logEnd();
}

/** Finalize the training by clicking the Click done Teaching button*/
function clickDoneTeaching() {
  cy.get('[data-testid="teachsession-footer-button-done"]')
    .then(function (response) {
      testLog.logStep("Click Done Teaching button")
    })
    .click();
}

function getPhraseStartEndIndicies(containingPhrase, phrase) {
  const start = containingPhrase.search(phrase)
  if (start === -1) {
    throw new Error(`Text: ${containingPhrase} did not contain phrase: ${phrase}`)
  }

  return [start, start + phrase.length]
}

function labelWords(phrase, entityName) {
  /**
   * Attempt to get words start / end indicies
   */
  cy.get('.slate-editor')
    .then(element => {
      const text = element[0].textContent
      const [startIndex, endIndex] = getPhraseStartEndIndicies(text, phrase)
      console.log(`startIndex: `, startIndex)
      console.log(`endIndex: `, endIndex)

      // setSelection(element, startIndex, endIndex)
    })


  /**
   * Attempt #1 use cy.type to automatically submit browser events
   * Begin with right arrow which selects first word
   * Skip to next word by holding Cntrl and then select by holding Shift
   */
  // TODO: Fix to select adjacent words specified instead of HardCoding
  cy.get('.slate-editor')
    .focus()
    .type('{rightarrow}{ctrl}{rightarrow}{shift}{rightarrow}{rightarrow}')
    .get('.custom-toolbar__new-entity-button')
    .click()
    .wait(3000)

  /**
   * Attempt #2 - Use trigger to emit mouse events
   * 
   * Doesn't seem to have any affect
   */
  cy.get('.slate-editor')
    .get('.cl-token-node')
    .contains('hovercraft')
    .trigger('mousedown')
    .trigger('mousemove')

  cy.get('.slate-editor')
    .get('.cl-token-node')
    .contains('is')
    .trigger('mousemove')
    .trigger('mouseup')

  /**
   * Attempt #3 - Use native browser selection
   * 
   * Seems to highlight text but doesn't activate the SlateEditor
   * The EntityPicker menu never shows up
   */
  cy.get('.slate-editor')
    .then(element => {
      selectTextInElement(element[0])
    })
    .wait(2000)

  cy.get('.custom-toolbar__new-entity-button')
    .click()
    .wait(3000)
}

function selectTextInElement(element) {
  const range = document.createRange();
  range.selectNodeContents(element)
  var selection = window.getSelection();
  selection.removeAllRanges(); 
  selection.addRange(range);
}

export {
  typeYourMessage,
  clickScoreActions,
  clickDoneTeaching,
  highlightWord,
  verifyTokenNodeExists,
  labelWords
};