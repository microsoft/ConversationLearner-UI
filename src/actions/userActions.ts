import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'

export const logout = (): ActionObject =>
    ({
        type: AT.USER_LOGOUT
    })

export const login = (id: string, name: string): ActionObject =>
    ({
        type: AT.USER_LOGIN,
        name,
        id,
    })