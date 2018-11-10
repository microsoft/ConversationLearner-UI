/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { FM } from '../../react-intl-messages'
import { FormattedMessage } from 'react-intl'
import './AddButton.css'

interface Props {
    onClick: () => void,
}

class AddButtonScore extends React.Component<Props, {}> {
    render() {
        return (
            <div
                role="button"
                className={`cl-addbutton-add cl-addbutton-addscore`}
                onClick={this.props.onClick}
                data-testid="chat-edit-add-score-button"
            >
                <TooltipHost
                    directionalHint={DirectionalHint.topCenter}
                    tooltipProps={{
                        onRenderContent: () =>
                            <FormattedMessage
                                id={FM.TOOLTIP_ADD_BOT_RESONSE_BUTTON}
                                defaultMessage="Add a new bot response"
                            />
                    }}
                >
                    <svg 
                        className="cl-addbutton-svg cl-addbutton-svg-score"
                    >
                        <polygon 
                            points="0,2 19,2 19,6 24,10 19,13 19,17 0,17"
                            transform="rotate(180) translate(-24, -19)"
                        />
                        <text className="cl-addbutton-addscore-text" x="10" y="14">+</text>
                    </svg>
                </TooltipHost>
            </div>
        )
    }
}

export default AddButtonScore