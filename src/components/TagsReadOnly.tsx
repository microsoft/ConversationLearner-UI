import * as React from 'react'
import './TagsReadOnly.css'

interface Props extends React.HTMLProps<HTMLDivElement> {
    tags: string[]
}

class component extends React.Component<Props> {
    render() {
        const { tags } = this.props
        return (
            <div className={`cl-tags-readonly ${this.props.className}`}>
                {tags.length === 0
                    ? `0 tags`
                    : tags.map((tag, i) =>
                    <div className="cl-tags-readonly__tag" key={i}>
                        {tag}
                    </div>
                )}
                <span className="cl-tags-readonly__clearfix"></span>
            </div>
        )
    }
}

export default component