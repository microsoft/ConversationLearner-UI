/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import { connect } from 'react-redux'
import { State } from '../../types'
import './SpinnerWindow.css'

// Enable to see what API calls I'm waiting for
const debug = false;

class SpinnerWindow extends React.Component<Props> {
    render() {
        return (
            <React.Fragment>
                <OF.Modal
                    isOpen={this.props.displaySpinner.length > 0}
                    isBlocking={true}
                    containerClassName='cl-spinner'
                    scrollableContentClassName='cl-spinner_scrollable'
                >
                    <OF.Spinner size={OF.SpinnerSize.large} />
                    {debug &&
                        <div>
                            {this.props.displaySpinner.join("\n\n")}
                        </div>
                    }
                </OF.Modal>
                <div role="alert" aria-live="assertive" className="cl-spinner-aria">
                    {this.props.displaySpinner.length > 0 && <span className="cl-screen-reader" data-testid="spinner">Loading</span>}
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: State) => {
    return {
        displaySpinner: state.display.displaySpinner
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>
type Props = stateProps

export default connect<stateProps>(mapStateToProps)(SpinnerWindow)