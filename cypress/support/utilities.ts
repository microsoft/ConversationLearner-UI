import * as helpers from './Helpers'

export function generateUniqueModelName (name: string): string {
    return `z-${name}-${Cypress.moment().format('MMDD-HHmmss')}${helpers.GetBuildKey()}`
}