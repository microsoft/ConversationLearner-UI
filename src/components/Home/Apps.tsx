import * as React from 'react'
import {
    NavLink
} from 'react-router-dom'
import './Apps.css'

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
    <div className="blis-page">
        <h1>Apps</h1>
        <div>
            <button type="button">Create New App</button>
        </div>
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