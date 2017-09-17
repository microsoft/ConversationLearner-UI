import * as React from 'react'
import {
    NavLink
} from 'react-router-dom'

const apps = [
    {
        id: 'app-id-1',
        name: 'App 1',
        description: 'App 1 description'
    },
    {
        id: 'app-id-2',
        name: 'App 2',
        description: 'App 2 description'
    }
]

const component = ({ match }: any) => (
    <div>
        <h2>Index</h2>
        <ul>
            {apps.map(app => (
                <li key={app.id}>
                    <NavLink to={{ pathname: `${match.url}/${app.id}`, state: { app } }}>App: {app.id}</NavLink>
                </li>
            ))}
        </ul>
    </div>
)

export default component