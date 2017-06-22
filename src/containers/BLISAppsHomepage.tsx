import * as React from 'react';
import TrainingGround from './TrainingGround';
import BLISAppsList from './BLISAppsList';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class BLISAppsHomepage extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
    }
    render() {
        return (
            <div className="fluidCont">
                {this.props.display.myAppsDisplay == 'Home' ?
                    <BLISAppsList  />
                    : <TrainingGround />
                }
            </div>
        );
    }
}
const mapStateToProps = (state: any) => {
    return {
        display: state.display
    }
}
export default connect(mapStateToProps, null)(BLISAppsHomepage);