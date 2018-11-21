/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { getDefaultText } from '../Utils/util'
import { FM } from '../react-intl-messages'

interface Props {
    id: FM,
}

class FormattedMessageId extends React.Component<Props, {}> {
    render() {
        return (
            <FormattedMessage
                id={this.props.id}
                defaultMessage={getDefaultText(this.props.id)}
            />
        )
    }
}

export default FormattedMessageId