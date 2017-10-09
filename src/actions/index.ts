import * as create from './createActions'
// delete is a reserved word, so we must use alternative
import * as deleteActions from './deleteActions'
import * as display from './displayActions'
import * as fetch from './fetchActions'
import * as teach from './teachActions'
import * as update from './updateActions'

const actions = {
    create,
    delete: deleteActions,
    display,
    fetch,
    teach,
    update
}

export default actions