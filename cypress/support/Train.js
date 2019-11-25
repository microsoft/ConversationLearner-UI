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

export function TypeYourMessage(message) { cy.Get(TypeYourMessageSelector).type(`${message}{enter}`) }
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

export function GetDescription() { return Cypress.$('[data-testid="train-dialog-description"]').attr('value') }
export function VerifyDescription(expectedDescription) { cy.Get(`[data-testid="train-dialog-description"][value="${expectedDescription}"]`) }
export function TypeDescription(description) { cy.Get('[data-testid="train-dialog-description"]').clear().type(`${description}{enter}`) }

export function GetAllTags() { return helpers.ArrayOfTextContentWithoutNewlines('[data-testid="train-dialog-tags"] > div.cl-tags__tag > span') }
export function ClickAddTagButton() { cy.Get('[data-testid="tags-input-add-tag-button"]').Click() }
export function VerifyNoTags() { cy.Get('[data-testid="train-dialog-tags"] > div.cl-tags__tag > button > i [data-icon-name="Clear"]').should('have.length', 0) }

export function AbandonBranchChanges() {
  ClickAbandonDeleteButton()
  popupModal.VerifyExactTitleNoContentClickButton('Are you sure you want to abandon this Training Dialog?', '[data-testid="confirm-cancel-modal-accept"]')
}

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

export function SelectTextAction(expectedResponse) {
  scorerModal.ClickTextAction(expectedResponse)
  chatPanel.VerifyTextChatMessage(expectedResponse)
}

export function SelectApiCardAction(apiName, expectedCardTitle, expectedCardText) {
  scorerModal.ClickApiAction(apiName)
  chatPanel.VerifyCardChatMessage(expectedCardTitle, expectedCardText)
}

export function SelectApiPhotoCardAction(apiName, expectedCardTitle, expectedCardText, expectedCardImage) {
  scorerModal.ClickApiAction(apiName)
  chatPanel.VerifyPhotoCardChatMessage(expectedCardTitle, expectedCardText, expectedCardImage)
}

export function SelectApiTextAction(apiName, expectedResponse) {
  scorerModal.ClickApiAction(apiName)
  chatPanel.VerifyTextChatMessage(expectedResponse)
}

export function SelectEndSessionAction(expectedData) {
  scorerModal.ClickEndSessionAction(expectedData);
  chatPanel.VerifyEndSessionChatMessage(expectedData)
}

export function PreSaveDataUsedToVerifyTdGrid() {
  cy.WaitForStableDOM().then(() => {
    const description = GetDescription()
    const tagList = GetAllTags().join('')
    chatPanel.PreSaveDataUsedToVerifyTdGrid(description, tagList)
  })
}

export function SaveAsIsVerifyInGrid() { 
  PreSaveDataUsedToVerifyTdGrid()
  cy.Enqueue(() => { SaveAsIs() }).then(() => {
    trainDialogsGrid.TdGrid.VerifySavedTrainDialogIsInGridAlongWithAllOtherExpectedTDs()
  })
}

export function SaveAsIs() {
  const funcName = 'SaveAsIs'

  ClickSaveCloseButton()
  cy.Enqueue(() => {
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
    })
  })
}

export function SaveVerifyNoMergePopup() {
  const funcName = 'SaveAsIs'

  let mergeModalIsVisible = false

  ClickSaveCloseButton()
  cy.Enqueue(() => {
    cy.WaitForStableDOM()
    let renderingShouldBeCompleteTime = new Date().getTime() + 1000
    cy.wrap(1, {timeout: 60000}).should(() => {
      if (mergeModal.IsVisible()) {
        helpers.ConLog(funcName, 'mergeModal.IsVisible')
        mergeModalIsVisible = true
        return
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
      if (mergeModalIsVisible) {
        throw new Error('The "Merge?" modal popup is showing but it is not expected to be there.')
      }
    })
  })
}

export function AbandonDialog() {
  ClickAbandonDeleteButton()
  ClickConfirmAbandonDialogButton()
}

export function VerifyCloseIsTheOnlyEnabledButton() {
  cy.Get('[data-testid="edit-dialog-modal-replay-button"]').should('be.disabled')
  cy.Get('[data-testid="edit-dialog-modal-abandon-delete-button"]').should('be.disabled')
  cy.Get('[data-testid="edit-teach-dialog-close-save-button"]').should('be.enabled')
}

