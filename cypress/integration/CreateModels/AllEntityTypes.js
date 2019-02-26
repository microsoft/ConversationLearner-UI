/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const entities = require('../support/Entities')

export function AllEntityTypes()
{
  models.CreateNewModel('z-allEntityTypes')

  entities.CreateNewEntity({ name: 'multiValuedEntity', multiValued: true })
  entities.CreateNewEntity({ name: 'negatableEntity', negatable: true })
  entities.CreateNewEntity({ name: `my-Programmatic`, type: "Programmatic" })
  entities.pretrainedEntityTypes.forEach(entityType => { entities.CreateNewEntity({ type: entityType }) })

  // Manually EXPORT this to fixtures folder and name it 'z-allEntityTypes'
}
