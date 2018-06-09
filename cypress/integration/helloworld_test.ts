describe('Hello world e2e', function () {
    const newModelName = `e2e-HelloWorld-${new Date().getTime() - 1528151000000}`
    const entity01 = `UserName`
    const entity02 = `City`
    const action01 = 'Hello World!'
    const trainmessage01 = 'Hello'
    const trainmessage02 = 'Hi'

    /** FEATURE: New Model */
    it('CREATE NEW MODEL with random name and verify name on application page', function () {
      
      cy.launch_ConversationLearnerApp()

      cy.cl_model_createnew(newModelName)
  
      // Verify: Ensure app page displays new application title
      cy.get('[data-testid="app-index-title"]')
        .should(el => {
          expect(el).to.contain(newModelName)
        })
    })
  
    /** FEATURE:  New Identity */
    it('should create a NEW ENTITY', () => {

      cy.navigateTo_Entities()

      cy.entity_createNew(entity01)

      cy.entity_clickOnMultivalue()

      cy.entity_savechanges()

      cy.entity_createNew(entity02)

      cy.entity_savechanges()

      // Verify: new row is added to entities list with new entity name
      cy.get('.ms-DetailsRow-cell')
        .contains(entity01)
        .contains(entity02)
    })
  
    /** FEATURE: New Action */
    it('should be able to ADD AN ACTION', () => {
  
      cy.navigateTo_ActionsPage()
  
      cy.cl_Action_CreateNew()

      cy.cl_Action_SelectTypeText()

      cy.cl_Action_Phrase(action01)  //Hello World!
  
      cy.cl_Action_Create()
      
      // Verify that the action has been added
      cy.get('.ms-DetailsRow-cell')
        .contains(action01)
    })
  
    /** FEATURE: New Train Dialog */
    it('should add a new TRAIN DIALOG', () => {
      // error handling
      cy.on('uncaught:exception', (err, runnable) => {
        return false
      })

      cy.cl_navigateTo_TrainDialogsPage()

      // verify: the Train Dialog page is rendered
      cy.get('div[data-testid="train-dialogs-title"]')
        .contains('Train Dialogs')

      // first training
      cy.cl_traindialog_createnew()

      cy.cl_Webchat_NewUserMessage(trainmessage01)

      cy.cl_traindialog_proceedToScoreAction()

      cy.cl_ScoredAction_Select()

      // Perform chat entries validation
      cy.get('[id="botchat"]').contains(trainmessage01)
        .get('[id="botchat"]').contains(action01)
      
      // finalize first training
      cy.cl_TrainingSession_Done()

      // second trainig
      cy.cl_traindialog_createnew()

      cy.cl_Webchat_NewUserMessage(trainmessage02)

      cy.cl_traindialog_proceedToScoreAction()

      cy.cl_ScoredAction_Select()

      // Perform chat entries validation
      cy.get('[id="botchat"]').contains(trainmessage02)
      cy.get('[id="botchat"]').contains(action01)
      
      // finilize second training
      cy.cl_TrainingSession_Done()
    })

    /** FEATURE: Delete a Model */
    it('should delete an existent model', () => {

      // error handling
      cy.on('uncaught:exception', (err, runnable) => {
        return false
      })

      // Navigating back to home page.
      cy.get('.cl-nav_section')
      .find('a[href="/home"]')
      .click()
  
      cy.contains(newModelName)
        .parents('.ms-DetailsRow-fields')
        .find('i[data-icon-name="Delete"]')
        .click()
  
      cy.get('.ms-Dialog-main')
        .contains('Confirm')
        .click()
  
      cy.end()
    })
  })  