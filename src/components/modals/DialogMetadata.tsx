/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as Util from '../../Utils/util'
import * as OF from 'office-ui-fabric-react'
import TagsInput from '../TagsInput'
import BorderlessTextInput from '../BorderlessTextInput'
import FormattedMessageId from '../FormattedMessageId'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './DialogMetadata.css'

interface ReceivedProps {
    description: string
    tags: string[]
    userInput?: string
    altInput?: string
    allUniqueTags: string[]
    onChangeDescription?: (description: string) => void
    onAddTag?: (tag: string) => void
    onRemoveTag?: (tag: string) => void
    readOnly?: boolean
}

type Props = ReceivedProps & InjectedIntlProps

const DialogMetadata: React.SFC<Props> = (props: Props) => {

    return (
        <div className={`cl-dialog-metadata ${OF.FontClassNames.mediumPlus}`}>
            {!props.userInput ? null :
                <>
                    <label>
                        <OF.Icon iconName="Chat" className="cl-icon" />
                        <span><FormattedMessageId id={FM.DIALOGMETADATA_USERINPUT_LABEL} />:</span>
                    </label>
                    <div className="cl-dialog-metadata__user-input">{props.userInput || ''}</div>
                </>
            }
            {!props.altInput ? null :
                <>
                    <label>
                        <OF.Icon iconName="Chat" className="cl-icon" />
                        <span><FormattedMessageId id={FM.DIALOGMETADATA_ALTINPUT_LABEL} />:</span>
                    </label>
                    <div className="cl-dialog-metadata__user-input">{props.altInput || ''}</div>
                </>
            }
            <label htmlFor="description">
                <OF.Icon iconName="TextField" className="cl-icon" />
                <span><FormattedMessageId id={FM.DIALOGMETADATA_DESCRIPTION_LABEL} />:</span>
            </label>
            <BorderlessTextInput
                data-testid="train-dialog-description"
                id="description"
                placeholder={props.readOnly ? "" : Util.formatMessageId(props.intl, FM.DIALOGMETADATA_DESCRIPTION_PLACEHOLDER)}
                value={props.description}
                onChange={props.onChangeDescription ? props.onChangeDescription : () => { }}
                readOnly={props.readOnly}
            />
            <label htmlFor="tags">
                <OF.Icon iconName="Tag" className="cl-icon" />
                <span><FormattedMessageId id={FM.DIALOGMETADATA_TAGS_LABEL} />:</span>
            </label>
            <TagsInput
                data-testid="train-dialog-tags"
                id="tags"
                // Map to objects because odd Fuse.js behavior on string[]
                // See: https://github.com/krisk/Fuse/issues/287
                allUniqueTags={props.allUniqueTags.map(t => ({ text: t }))}
                tags={props.tags}
                onAdd={props.onAddTag ? props.onAddTag : () => { }}
                onRemove={props.onRemoveTag ? props.onRemoveTag : () => { }}
                readOnly={props.readOnly}
            />
        </div>
    )
}

export default injectIntl(DialogMetadata)