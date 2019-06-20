/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../types'
import { setTipType } from '../actions/displayActions'
import { TipType } from './ToolTips/ToolTips'
import { IconButton } from 'office-ui-fabric-react'

class HelpIcon extends React.Component<Props> {
    render() {
        return (
            <IconButton
                className={`cl-icon cl-icon--short ${this.props.customClass || 'cl-icon-whitebackground'}`}
                iconProps={{ iconName: this.props.iconName || 'Info' }}
                onClick={() => { this.props.setTipType(this.props.tipType) }}
                title="More Information"
            />
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setTipType
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
    }
}

export interface ReceivedProps {
    tipType: TipType,
    iconName?: string
    customClass?: string
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(HelpIcon);