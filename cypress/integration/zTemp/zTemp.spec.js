/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as helpers from '../../support/Helpers'
import * as homePage from '../../support/components/HomePage'
import * as modelPage from '../../support/components/ModelPage'
import * as models from '../../support/Models'
import * as train from '../../support/Train'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as editDialogModal from '../../support/components/EditDialogModal'

describe('zTemp', () => {
  it('Temporary Experimental Test', () => {
    let botDomainAndPort = Cypress.env('BOT_DOMAIN_PORT')
    helpers.ConLog('zTemp', botDomainAndPort)
  })

  it.skip('Should NOT allow more than 20 Train Dialog Tags', () => {
    // TODO: Turn this into a full test case since there is a 20 tag 
    // limit and produces a bug when saving the Train Dialog.
    // Bug 1930: Train Dialog - Tag Editor should prevent user from entering more than 20 tags.
    models.CreateNewModel('z-foods')
    modelPage.NavigateToTrainDialogs()
    train.CreateNewTrainDialog()

    editDialogModal.AddTags(['Apple', 'Banana', 'Carrot', 'Duck', 'Egg', 'Food', 'Green Chilli', 'Habanero','Ice Cream', 'Jalapeno', 'Kale', 'Letuce', 'Mango', 'Necterine', 'Orange', 'Plum', 'QQQ', 'Raisin', 'Salt', 'Tangerine', 'UUUuuu', 'VVV', 'WwWwWwW', 'X', 'YYYyy', 'ZzZzZ'])
  })
})
