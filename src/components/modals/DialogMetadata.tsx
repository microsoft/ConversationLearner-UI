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
import './MergeModal.css'

interface ReceivedProps {
    description: string
    tags: string[]
    allUniqueTags: string[]
    onChangeDescription: (description: string) => void
    onAddTag: (tag: string) => void
    onRemoveTag: (tag: string) => void
}

type Props = ReceivedProps & InjectedIntlProps

const DialogMetadata: React.SFC<Props> = (props: Props) => {

    return (
        <div className={`cl-dialog-metadata ${OF.FontClassNames.mediumPlus}`}>
            <label htmlFor="description">
                <OF.Icon iconName="TextField" className="cl-icon" />
                <span><FormattedMessageId id={FM.DESCRIPTION_LABEL} />:</span>
            </label>
            <BorderlessTextInput
                data-testid="train-dialog-description"
                id="description"
                placeholder={Util.formatMessageId(props.intl, FM.DESCRIPTION_PLACEHOLDER)}
                value={props.description}
                onChange={props.onChangeDescription}
            />
            <label htmlFor="tags"><OF.Icon iconName="Tag" className="cl-icon" /><span><FormattedMessageId id={FM.TAGS_INPUT_LABEL} />:</span></label>
            <TagsInput
                data-testid="train-dialog-tags"
                id="tags"
                // Map to objects because odd Fuse.js behavior on string[]
                // See: https://github.com/krisk/Fuse/issues/287
                allUniqueTags={props.allUniqueTags.map(t => ({ text: t }))}
                tags={props.tags}
                onAdd={props.onAddTag}
                onRemove={props.onRemoveTag}
            />
        </div>
    )
}

export default injectIntl(DialogMetadata)