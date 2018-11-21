/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { FontClassNames } from 'office-ui-fabric-react'
import FormattedMessageId from '../components/FormattedMessageId'
import { NavLink } from 'react-router-dom'
import { FM } from '../react-intl-messages'

const component = () => (
    <div>
        <div className={FontClassNames.superLarge}>
            <FormattedMessageId id={FM.NOMATCH_TITLE} />
        </div>
        <div>
            <NavLink to="/">
                <FormattedMessageId id={FM.NOMATCH_HOME} />
            </NavLink>
        </div>
    </div>
)

export default component