import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { FontClassNames } from 'office-ui-fabric-react'
import { FM } from '../react-intl-messages'

const component = () => (
    <div className="blis-page">
        <div className={FontClassNames.superLarge}>
            <FormattedMessage
                id={FM.DOCS_TITLE}
                defaultMessage="Docs"
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