import * as React from 'react'
import {
    Route,
    Switch
} from 'react-router-dom'
import App from './Home/App'
import Apps from './Home/Apps'

const component = ({ match }: any) => (
    <Switch>
        <Route path={`${match.url}/:appid`} component={App} />
        <Route
            exact={true}
            path={match.url}
            component={Apps}
        />
    </Switch>
)

export default component