import * as React from 'react';
import { TagPicker, ITagPickerProps, ITag } from 'office-ui-fabric-react'
import './BlisTagPicker.css'

export interface IBlisTagPickerProps extends ITagPickerProps {
    nonRemovableTags: ITag[]
}
export const component = (props: IBlisTagPickerProps) => {
    const { nonRemovableTags, ...tagPickerProps } = props
    return (
    <div className="blis-tagpicker">
        <div className="ms-BasePicker-text ms-BasePicker-text--static pickerText_4c4c5cb3" role="list">
            {nonRemovableTags.map(tag => (
                <div className="ms-TagItem ms-TagItem-text--highlight" tabIndex={0} key={tag.key}>
                    <span className="ms-TagItem-text ms-TagItem-text--strike" aria-label="name">{tag.name}</span>
                </div>
            ))}
        </div>
        <TagPicker {...tagPickerProps} />
    </div>
    )
}

export default component