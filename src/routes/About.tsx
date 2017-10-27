import * as React from 'react'
import { FormattedMessage } from 'react-intl'

const component = () => (
    <div className="blis-page">
        <div className="ms-font-su">
            <FormattedMessage
                id="About.title"
                defaultMessage="About"
            />
        </div>
        <div className="ms-font-m-plus">
            <FormattedMessage
                id="page.comingsoon"
                defaultMessage="Coming Soon..."
            />
        </div>
    </div>
)

export default component