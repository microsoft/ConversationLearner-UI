import * as React from 'react'
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
                    ? <div className="cl-tags-readonly__empty">No tags</div>
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