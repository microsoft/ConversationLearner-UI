/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const entities = require('../support/Entities')
const actions = require('../support/Actions')
const editDialogModal = require('../support/components/EditDialogModal')
const train = require('../support/Train')
const memoryTableComponent = require('../support/components/MemoryTableComponent')
const common = require('../support/Common')

Cypress.TestCase('CreateModels', 'All Entity Types', AllEntityTypes)
export function AllEntityTypes()
{
  models.CreateNewModel('z-allEntityTypes')

  entities.CreateNewEntity({ name: 'multiValuedEntity', multiValued: true })
  entities.CreateNewEntity({ name: 'negatableEntity', negatable: true })
  entities.CreateNewEntity({ name: `my-Programmatic`, type: "Programmatic" })
  entities.pretrainedEntityTypes.forEach(entityType => { entities.CreateNewEntity({ type: entityType }) })

  // Manually EXPORT this to fixtures folder and name it 'z-allEntityTypes'
}

Cypress.TestCase('CreateModels', 'Disqualifying Entities', DisqualifyingEntities)
export function DisqualifyingEntities()
{
  models.CreateNewModel('z-disqualifyngEnt')

  entities.CreateNewEntity({ name: 'name' })
  entities.CreateNewEntity({ name: 'want' })
  entities.CreateNewEntity({ name: 'sweets' })

  // NOTE: the {enter} in these strings are necessary to triger the entity detection.
  actions.CreateNewActionThenVerifyInGrid({ response: common.whatsYourName, expectedEntities: 'name', disqualifyingEntities: 'name' })
  actions.CreateNewActionThenVerifyInGrid({ response: 'Hey $name{enter}', disqualifyingEntities: ['sweets', 'want'] })
  actions.CreateNewActionThenVerifyInGrid({ response: 'Hey $name{enter}, what do you really want?', expectedEntities: 'want', disqualifyingEntities: ['sweets', 'want'] })
  actions.CreateNewActionThenVerifyInGrid({ response: "Sorry $name{enter}, I can't help you get $want{enter}" })

  // Manually EXPORT this to fixtures folder and name it 'z-disqualifyngEnt'
}

Cypress.TestCase('CreateModels', 'Wait vs Non-Wait Actions', WaitVsNoWaitActions)
export function WaitVsNoWaitActions()
{
  models.CreateNewModel('z-waitNoWait')

  // NOTE: the {enter} in these strings are necessary to triger the entity detection.
  actions.CreateNewActionThenVerifyInGrid({ response: 'Which animal would you like?' })
  actions.CreateNewActionThenVerifyInGrid({ response: 'Cows say moo!', uncheckWaitForResponse: true })
  actions.CreateNewActionThenVerifyInGrid({ response: 'Ducks say quack!', uncheckWaitForResponse: true })
  actions.CreateNewActionThenVerifyInGrid({ response: 'Fish just swim.', uncheckWaitForResponse: true })
  actions.CreateNewActionThenVerifyInGrid({ type: 'END_SESSION', response: "That's All Folks.", uncheckWaitForResponse: true })

  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  train.TypeYourMessage('Duck')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Ducks say quack!')
  train.SelectAction('Which animal would you like?')

  train.TypeYourMessage('Fish')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Fish just swim.')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-waitNoWait.cl'
}

Cypress.TestCase('CreateModels', "What's Your Name", WhatsYourName)
export function WhatsYourName()
{
  models.CreateNewModel('z-whatsYourName')
  entities.CreateNewEntity({ name: 'name' })
  actions.CreateNewActionThenVerifyInGrid({ response: common.whatsYourName, expectedEntities: 'name' })

  // NOTE: the {enter} in this call is necessary to triger the entity detection.
  actions.CreateNewActionThenVerifyInGrid({ response: 'Hello $name{enter}' })

  // Manually EXPORT this to fixtures folder and name it 'z-whatsYourName.cl'
}

// This model is created with a Training in it as well as Entities and Actions because
// this model is intended to test features of using a trained model.
Cypress.TestCase('CreateModels', 'Tag And Frog', TagAndFrog)
export function TagAndFrog()
{
  // models.ImportModel('z-tagAndFrog', 'z-tagAndFrog.cl')
  models.CreateNewModel('z-tagAndFrog')
  entities.CreateNewEntity({ name: 'multi', multiValued: true })
  actions.CreateNewActionThenVerifyInGrid({ response: "Hello" })
  actions.CreateNewActionThenVerifyInGrid({ response: "Hi" })

  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  // ------------------------------------------------------------------------
  // This block of code should be removed once we determine and fix the cause
  // of: Bug 1901-Automatic Entity Labeling Is NOT Consistent
  // ------------------------------------------------------------------------

  train.TypeYourMessage('This is Tag.')
  editDialogModal.LabelTextAsEntity('Tag', 'multi')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hello')

  train.Save()

  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  // ------------------------------------------------------------------------

  train.TypeYourMessage('This is Tag.')
  editDialogModal.LabelTextAsEntity('Tag', 'multi', false)
  editDialogModal.ClickScoreActionsButton()
  // TODO: Verify that the entity was labeled and now in memory.
  train.SelectAction('Hello')
  cy.WaitForTrainingStatusCompleted()

  train.TypeYourMessage('This is Frog and Tag.')
  memoryTableComponent.VerifyEntityInMemory('multi', 'Tag')
  editDialogModal.VerifyEntityLabel('Tag', 'multi')
  editDialogModal.LabelTextAsEntity('Frog', 'multi')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hi')
  cy.WaitForTrainingStatusCompleted()

  train.TypeYourMessage('This is Tag and Frog.')
  memoryTableComponent.VerifyEntityInMemory('multi', ['Tag', 'Frog'])
  editDialogModal.VerifyEntityLabel('Tag', 'multi')
  editDialogModal.VerifyEntityLabel('Frog', 'multi', 1)
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hi')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-tagAndFrog.cl'
}

Cypress.TestCase('CreateModels', 'Endless Loop', EndlessLoop)
export function EndlessLoop()
{
  // models.ImportModel('z-endlessLoop', 'z-endlessLoop.cl')
  models.CreateNewModel('z-endlessLoop')
  actions.CreateNewActionThenVerifyInGrid({ response: "Action One", uncheckWaitForResponse: true })
  actions.CreateNewActionThenVerifyInGrid({ response: "Action Two", uncheckWaitForResponse: true })
  actions.CreateNewActionThenVerifyInGrid({ response: "Action Three", uncheckWaitForResponse: true })

  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()
  train.CreateNewTrainDialog()

  train.TypeYourMessage('hi')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Action One')
  cy.WaitForTrainingStatusCompleted()
  train.SelectAction('Action Two')
  cy.WaitForTrainingStatusCompleted()
  train.SelectAction('Action Three')

  train.Save()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('howdy')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Action Two')
  cy.WaitForTrainingStatusCompleted()
  train.SelectAction('Action Three')
  cy.WaitForTrainingStatusCompleted()
  train.SelectAction('Action One')

  train.Save()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('namaste')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Action Three')
  cy.WaitForTrainingStatusCompleted()
  train.SelectAction('Action Two')
  cy.WaitForTrainingStatusCompleted()
  train.SelectAction('Action One')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-endlessLoop.cl'
}

Cypress.TestCase('CreateModels', 'Travel', Travel)
export function Travel()
{
  models.CreateNewModel('z-travel')
  entities.CreateNewEntity({ name: 'departure', resolverType: 'datetimeV2', expectPopup: true })
  entities.CreateNewEntity({ name: 'return', resolverType: 'datetimeV2' })
  actions.CreateNewActionThenVerifyInGrid({ response: 'You are leaving on $departure{enter} and returning on $return{enter}', requiredEntities: ['departure', 'return'] })
  actions.CreateNewActionThenVerifyInGrid({ response: 'When are you planning to travel?', disqualifyingEntities: ['departure', 'return'] })

  // Manually EXPORT this to fixtures folder and name it 'z-travel.cl'
}