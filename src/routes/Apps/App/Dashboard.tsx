import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { connect } from 'react-redux';
import { State } from '../../../types'
import { BlisAppBase } from 'blis-models'
import { FormattedMessage } from 'react-intl'
import { FM } from '../../../react-intl-messages'

class Dashboard extends React.Component<Props, {}> {
    render() {
        return (
            <div className="blis-page">
                <span className="ms-font-xxl">
                    <FormattedMessage
                        id={FM.DASHBOARD_TITLE}
                        defaultMessage="Overview"
                    />
                </span>
                <span className="ms-font-m-plus">
                    <FormattedMessage
                        id={FM.DASHBOARD_SUBTITLE}
                        defaultMessage="Facts & statistics about the app's data at any period of time..."
                    />
                </span>
            </div>
        );
    }
}

const mapStateToProps = (state: State) => {
    return {
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps & ReceivedProps;

export default connect<typeof stateProps, {}, ReceivedProps>(mapStateToProps, null)(Dashboard)
