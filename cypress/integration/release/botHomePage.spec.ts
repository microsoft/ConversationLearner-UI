import constants from '../../support/constants'
import selectors from '../../support/selectors'

/**
 * These tests run against the UI from samples repo. The baseUrl is different than normal tests.
 */
describe('Bot Home Page', () => {
    it('should load and display link to the ui', () => {
        cy.visit('/')
        cy.get(selectors.homePage.link)
            .should('have.attr', 'href', '/ui')
    })

    /**
     * There have been caching issues where the UI will fail to load due to
     * the browser interpreting javascript file as cached HTML and having syntax error
     * This should ensure it loads properly, having 200 response isn't good enough, we need to get an element
     */
    it('should be able to load the ui directly', () => {
        cy.visit(`/ui`)
        cy.get(selectors.app.container)
    })
})