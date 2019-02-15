import * as React from 'react'
import { FM } from '../react-intl-messages'
import FormattedMessageId from './FormattedMessageId'
import './TagsReadOnly.css'

interface Props extends React.HTMLProps<HTMLDivElement> {
    tags: string[]
}

class component extends React.Component<Props> {
    render() {
        const { tags, className } = this.props
        return (
            <div className={`cl-tags-readonly ${className}`}>
                {tags.length === 0
                    ? <div className="cl-tags-readonly__empty"><FormattedMessageId id={FM.TAGS_READONLY_EMPTY} /></div>
                    : tags.map((tag, i) =>
                    <div className="cl-tags-readonly__tag" key={i}>
                        {tag}
                    </div>
                )}
            </div>
        )
    }
}

export default component