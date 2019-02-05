import * as React from 'react'
import './TagsDisplay.css'

interface Props extends React.HTMLProps<HTMLDivElement> {
    tags: string[]
}

class component extends React.Component<Props> {
    render() {
        const { tags } = this.props
        return (
            <div className={`cl-tags-display ${this.props.className}`}>
                {tags.length === 0
                    ? `0 tags`
                    : tags.map((tag, i) =>
                    <div className="cl-tags-display__tag" key={i}>
                        {tag}
                    </div>
                )}
                <span className="cl-tags-display__clearfix"></span>
            </div>
        )
    }
}

export default component