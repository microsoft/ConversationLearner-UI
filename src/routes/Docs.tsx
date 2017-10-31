import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'

const component = () => (
    <div className="blis-page">
        <div className="ms-font-su">
            <FormattedMessage
                id={FM.DOCS_TITLE}
                defaultMessage="Docs"
            />
        </div>
        <div className="ms-font-m-plus">
            <FormattedMessage
                id={FM.PAGE_COMINGSOON}
                defaultMessage="Coming Soon..."
            />
        </div>
    </div>
)

export default component