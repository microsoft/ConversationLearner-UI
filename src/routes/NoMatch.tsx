import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { NavLink } from 'react-router-dom'

const component = () => (
    <div>
        <div className="ms-font-su">
            <FormattedMessage
                id="NoMatch.title"
                defaultMessage="404 Not Found"
            />
        </div>
        <div>
            <NavLink to="/">
                <FormattedMessage
                    id="NoMatch.home"
                    defaultMessage="Home"
                />
            </NavLink>
        </div>
    </div>
)

export default component