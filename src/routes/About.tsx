import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import { FontClassNames } from 'office-ui-fabric-react'

const component = () => (
    <div className="blis-page">
        <div className={FontClassNames.superLarge}>
            <FormattedMessage
                id={FM.ABOUT_TITLE}
                defaultMessage="About"
            />
        </div>
        <div className={FontClassNames.mediumPlus}>
            <FormattedMessage
                id={FM.PAGE_COMINGSOON}
                defaultMessage="Coming Soon..."
            />
        </div>
    </div>
)

export default component