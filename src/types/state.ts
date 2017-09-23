import { BlisAppBase } from 'blis-models'

export type AppState =
{
    list: BlisAppBase[]
}

export type CounterState =
{
    value: number
}

export type State = {
    apps: AppState,
    counter: CounterState
}