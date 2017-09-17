import * as React from 'react'
import {
    NavLink
} from 'react-router-dom'

const component = () => (
    <div>
        <div>404 Not Found</div>
        <div>
            <NavLink to="/">Home</NavLink>
        </div>
    </div>
)

export default component