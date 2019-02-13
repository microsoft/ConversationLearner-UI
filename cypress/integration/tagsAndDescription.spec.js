describe('Tags and Description', () => {
    context('Train Dialogs', () => {
        before(() => {
            // import the saved model for tags and description testing
        })

        beforeEach(() => {
            // open model for tags and description testing
        })

        context('Create', () => {
            it('should have no tags are description when creating new dialog', () => {
                // Create new train dialog
                // Verify that tags and description are empty
                expect(true).to.equal(true)
            })

            it('should save the tags and description on the new dialog', () => {
                // Set tags
                // Set description
                // Save
                // Verify tags and description in list
                expect(true).to.equal(true)
            })
        })

        context('Edit', () => {
            it('should open with the tags and description', () => {
                // Find train dialog in list
                // Note the tags and description
                // Open it
                // Verify tags and description are the same as shown in the list
                expect(true).to.equal(true)
            })

            it('should discard the changes made to tags and description when abandoned', () => {
                // Open train dialog
                // Save current tags and description
                // Edit tags
                // Edit description
                // Abandon changes
                // Re-open dialog
                // Verify tags and description are unmodified
                expect(true).to.equal(true)
            })

            it('should save the edited tags and description', () => {
                // Open train dialog
                // Edit tags
                // Edit description
                // Note tags and description
                // reload
                // Verify edited tags and description are still on dialog
                expect(true).to.equal(true)
            })

            it('(advanced edit) should save the edited tags, description, and rounds', () => {
                // Open train dialog
                // Edit tags
                // Edit description
                // Modify dialog to add user input
                // Modify dialog to add bot response
                // Save
                // Reload
                // Re-open dialog
                // Verify edited tags, description, and rounds
                expect(true).to.equal(true)
            })
        })


        context('Continue', () => {
            it('should preserve tags and description when continuing a dialog', () => {
                // Open train dialog
                // Edit the tags
                // Edit the description
                // Type into webchat to continue the dialog
                // Verify the edited tags and description are the same
                // Save the dialog
                // Verify the edited tags and description are in the list
                expect(true).to.equal(true)
            })
        })

        context('Branch', () => {
            it('should preserve tags and description after branching', () => {
                // Open train dialog
                // Edit tags
                // Edit description
                // Click branch on one of the user inputs
                // Enter a new input
                // (Dialog is branched after input is entered)
                // Verify edited tags and description are preserved
                // Save dialog
                // Reload
                // Verify old dialog with original tags and description is still in the list
                // Verify new dialog with edited tags and description is now in the list
                expect(true).to.equal(true)
            })
        })
    })

    context('Log Dialogs', () => {
        before(() => {
            // import model for testing tags and description on log dialogs
        })

        it('should not show tags or description fields on log dialogs', () => {
            // Open log dialog
            // Verify that the tags and description fields do not show up
            // Enter into webchat to continue the dialog
            // Verify that the tags and description fields still do not show up on new window
            expect(true).to.equal(true)
        })
    })
})