/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../Utils/util'
import { FM } from '../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './IndexButtons.css'

export const component = (props: Props) => {
    return (
        <>
            <OF.DefaultButton
                onClick={props.onPrevious}
                iconProps={{ iconName: 
                    props.curIndex === 0
                        ? 'ChevronLeftEnd6' 
                        : 'ChevronLeftSmall'
                }}
                ariaDescription={Util.formatMessageId(props.intl, FM.BUTTON_PREVIOUS)}
                text={Util.formatMessageId(props.intl, FM.BUTTON_PREVIOUS)}
            />
            <div className="cl-index-buttons__count">
                {`${props.curIndex + 1} of ${props.total}`}
            </div>
            <OF.DefaultButton
                onClick={props.onNext}
                iconProps={{ iconName: 
                    props.curIndex === props.total - 1
                    ? 'ChevronRightEnd6'
                    : 'ChevronRightSmall' 
                }}
                ariaDescription={Util.formatMessageId(props.intl, FM.BUTTON_NEXT)}
                text={Util.formatMessageId(props.intl, FM.BUTTON_NEXT)}
            />
        </>
    )
}

export interface ReceivedProps {
    curIndex: number
    total: number
    onPrevious: () => void
    onNext: () => void
}

type Props = ReceivedProps & InjectedIntlProps

export default injectIntl(component)