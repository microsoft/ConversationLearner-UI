import * as React from 'react'
import {
    NavLink,
    Route,
    Switch
} from 'react-router-dom'
import Index from './App/Index'
import Settings from './App/Settings'
import Actions from './App/Actions'
import Entities from './App/Entities'
import TrainDialogs from './App/TrainDialogs'
import LogDialogs from './App/LogDialogs'
import './App.css'

const component = ({ match, location }: any) => {
    const { app } = location.state
    return (
        <div className="blis-app-page">
            <div>
                <h1 className="blis-app-title ms-font-xxl">{app.name}</h1>
                <div className="blis-nav ms-font-m-plus">
                    <div className="blis-nav_section">
                        <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/settings`, state: { app } }}><span className="ms-Icon ms-Icon--Settings"></span>&nbsp;&nbsp;Settings</NavLink>
                    </div>
                    <div className="blis-nav_section">
                        <NavLink className="blis-nav-link" exact to={{ pathname: `${match.url}`, state: { app } }}>Dashboard</NavLink>
                        <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/entities`, state: { app } }}>Entities</NavLink>
                        <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/actions`, state: { app } }}>Actions</NavLink>
                        <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/train`, state: { app } }}>Train Dialogs</NavLink>
                        <NavLink className="blis-nav-link" to={{ pathname: `${match.url}/logs`, state: { app } }}>Log Dialogs</NavLink>
                    </div>
                    <div className="blis-nav_section">
                        <NavLink className="blis-nav-link" exact={true} to="/home"><span className="ms-Icon ms-Icon--Back"></span>&nbsp;&nbsp;App List</NavLink>
                    </div>
                </div>
            </div>
            <Switch>
                <Route path={`${match.url}/settings`} render={props => <Settings {...props} app={app} />} />
                <Route path={`${match.url}/entities`} render={props => <Entities {...props} app={app} />} />
                <Route path={`${match.url}/actions`} render={props => <Actions {...props} app={app} />} />
                <Route path={`${match.url}/train`} render={props => <TrainDialogs {...props} app={app} />} />
                <Route path={`${match.url}/logs`} render={props => <LogDialogs {...props} app={app} />} />
                <Route
                    exact={true}
                    path={match.url}
                    render={props => <Index {...props} app={app} />}
                />
            </Switch>
        </div>
    )
}

export default component