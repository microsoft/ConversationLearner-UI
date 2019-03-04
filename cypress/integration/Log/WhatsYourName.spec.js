/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as logDialogsGrid from '../../support/components/LogDialogsGrid'
import * as logDialogModal from '../../support/components/LogDialogModal'
import * as common from '../../support/Common'

describe('Log', () => {
  it(common.whatsYourName, () => {
    models.ImportModel('z-logMyName', 'z-nameTrained.cl')

    modelPage.NavigateToLogDialogs()
    cy.WaitForTrainingStatusCompleted()
    logDialogsGrid.CreateNewLogDialogButton()

    logDialogModal.TypeYourMessageValidateResponse("Hello", common.whatsYourName)

    logDialogModal.ClickDoneTestingButton()
  })
})