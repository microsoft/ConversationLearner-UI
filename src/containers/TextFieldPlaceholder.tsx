import * as React from 'react';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react';

// Extent props to add placeholder
export interface TextFieldPlacehoderProps extends ITextFieldProps {
    placeholder?: string;
    autoFocus?: boolean
    type?: string;
}

export class TextFieldPlaceholder extends React.Component<TextFieldPlacehoderProps, any>{
    render() {
        return <TextField {...this.props}/>
    }
}