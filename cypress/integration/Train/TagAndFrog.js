/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const train = require('../../support/Train')
const editDialogModal = require('../../support/components/EditDialogModal')
const common = require('../../support/Common')

export function TagAndFrog()
{
  // TODO: Need to add another test case or expand this one so that tagging something
  //       that was NOT tagged in another instance causes the UI to complain.
  let textEntityPairs = [{ text: 'Tag', entity: 'multi' }, { text: 'Frog', entity: 'multi' }]

  models.ImportModel('z-tagAndFrog', 'z-tagAndFrog.cl')
  modelPage.NavigateToTrainDialogs()

  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  train.TypeYourMessage('This is Tag.')
  editDialogModal.RemoveEntityLabel('Tag', 'multi')
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose({ text: 'Tag', entity: 'multi' })
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept({ text: 'Tag', entity: 'multi' })
  train.SelectAction('Hello')

  train.TypeYourMessage('This is Frog and Tag.')
  editDialogModal.RemoveEntityLabel('Frog', 'multi')
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
  train.SelectAction('Hi')

  train.TypeYourMessage('This is Tag and Frog.')
  editDialogModal.RemoveEntityLabel('Tag', 'multi')
  editDialogModal.RemoveEntityLabel('Frog', 'multi')
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
  train.SelectAction('Hi')

  train.AbandonDialog()

  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  train.TypeYourMessage('This is Tag.')
  editDialogModal.TypeAlternativeInput('This is Frog and Tag.')
  editDialogModal.TypeAlternativeInput('This is Tag and Frog.')

  editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs[0], 0)
  editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 1)
  editDialogModal.VerifyEntityLabelWithinSpecificInput(textEntityPairs, 2)

  editDialogModal.RemoveEntityLabel('Tag', 'multi', 1)
  editDialogModal.RemoveEntityLabel('Frog', 'multi', 2)

  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)

  editDialogModal.VerifyEntityLabeledDifferentPopupAndClose(textEntityPairs)
  editDialogModal.ClickScoreActionsButton()
  editDialogModal.VerifyEntityLabeledDifferentPopupAndAccept(textEntityPairs)
  train.SelectAction('Hi')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-tagAndFrog2.cl'
}