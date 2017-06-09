import React, { Component } from 'react';
import TrainingGround from './TrainingGround';
import BLISAppsList from './BLISAppsList';

class BLISAppsHomepage extends Component {
    constructor(p){
        super(p);
        this.state = {
            display: "Home"
        }
    }
    displayList(){
        this.setState({
            display: "Home"
        });
    }
    displayTrainingGround(){
        this.setState({
            display: "Training Ground"
        });
    }
    render() {
        return (
            <div>
                {this.state.display == 'Home' ?
                    <BLISAppsList displayTrainingGround={this.displayTrainingGround.bind(this)}/>
                : <TrainingGround displayList={this.displayList.bind(this)}/>
                }
            </div>
        );
    }
}
export default BLISAppsHomepage