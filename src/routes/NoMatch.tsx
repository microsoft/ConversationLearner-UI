import * as React from 'react'
import { FontClassNames } from 'office-ui-fabric-react'
import { FormattedMessage } from 'react-intl'
import { NavLink } from 'react-router-dom'
import { FM } from '../react-intl-messages'

const component = () => (
    <div>
        <div className={FontClassNames.superLarge}>
            <FormattedMessage
                id={FM.NOMATCH_TITLE}
                defaultMessage="404 Not Found"
            />
        </div>
        <div>
            <NavLink to="/">
                <FormattedMessage
                    id={FM.NOMATCH_HOME}
                    defaultMessage="Home"
                />
            </NavLink>
        </div>
    </div>
)

export default component