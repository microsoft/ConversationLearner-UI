import { func } from 'prop-types';

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

export function AllEntityTypes()
{
  models.CreateNewModel('z-allEntityTypes')

  entities.CreateNewEntity({name: 'multiValuedEntity', multiValued: true})
  entities.CreateNewEntity({name: 'negatableEntity', negatable: true})
  entities.CreateNewEntity({name: `my-Programmatic`, type: "Programmatic"})
  entities.pretrainedEntityTypes.forEach(entityType => { entities.CreateNewEntity({type: entityType}) })

  // Manually EXPORT this to fixtures folder and name it 'z-allEntityTypes'
}

export function DisqualifyingEntities()
{
  models.CreateNewModel('z-disqualifyngEnt')
  
  entities.CreateNewEntity({name: 'name'})
  entities.CreateNewEntity({name: 'want'})
  entities.CreateNewEntity({name: 'sweets'})

  // NOTE: the {enter} in these strings are necessary to triger the entity detection.
  actions.CreateNewAction({response: "What's your name?", expectedEntities: 'name', disqualifyingEntities: 'name'})
  actions.CreateNewAction({response: 'Hey $name{enter}', disqualifyingEntities: ['sweets', 'want']})
  actions.CreateNewAction({response: 'Hey $name{enter}, what do you really want?', expectedEntities: 'want', disqualifyingEntities: ['sweets', 'want']})
  actions.CreateNewAction({response: "Sorry $name{enter}, I can't help you get $want{enter}"})

  // Manually EXPORT this to fixtures folder and name it 'z-disqualifyngEnt'
}

export function WaitVsNoWaitActions()
{
  models.CreateNewModel('z-waitNoWait')
  
  // NOTE: the {enter} in these strings are necessary to triger the entity detection.
  actions.CreateNewAction({response: 'Which animal would you like?'})
  actions.CreateNewAction({response: 'Cows say moo!', uncheckWaitForResponse: true})
  actions.CreateNewAction({response: 'Ducks say quack!', uncheckWaitForResponse: true})

  // Manually EXPORT this to fixtures folder and name it 'z-waitNoWait.cl'
}

export function WhatsYourName()
{
  models.CreateNewModel('z-whatsYourName')
  entities.CreateNewEntity({name: 'name'})
  actions.CreateNewAction({response: "What's your name?", expectedEntities: 'name'})
  
  // NOTE: the {enter} in this call is necessary to triger the entity detection.
  actions.CreateNewAction({response: 'Hello $name{enter}'})

  // Manually EXPORT this to fixtures folder and name it 'z-whatsYourName.cl'
}

// TODO: Postpone getting this to work due to issue in LabelTextAsEntity()
export function TagAndFrog()
{
  models.ImportModel('z-tagAndFrog', 'z-tagAndFrog.cl')
  // models.CreateNewModel('z-tagAndFrog')
  // entities.CreateNewEntity({name: 'multi'})
  // actions.CreateNewAction({response: "Hello"})
  // actions.CreateNewAction({response: "Hi"})

  modelPage.NavigateToTrainDialogs()
  cy.WaitForTrainingStatusCompleted()

  train.CreateNewTrainDialog()

  train.TypeYourMessage('This is Tag.')
  editDialogModal.LabelTextAsEntity('Tag', 'multi')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hello')

  train.TypeYourMessage('This is Frog and Tag.')
  editDialogModal.VerifyDetectedEntity('multi', 'Frog')
  editDialogModal.LabelTextAsEntity('Tag', 'multi')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hi')

  train.TypeYourMessage('This is Tag and Frog.')
  editDialogModal.VerifyDetectedEntity('multi', 'Tag')
  editDialogModal.LabelTextAsEntity('Frog', 'multi')
  editDialogModal.ClickScoreActionsButton()
  train.SelectAction('Hi')

  train.Save()

  // Manually EXPORT this to fixtures folder and name it 'z-tagAndFrog.cl'
}
