import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import BLISAppsHomepage from '../containers/BLISAppsHomepage';
import { fetchApplications } from '../actions/fetch'
import { setBLISAppDisplay, setWebchatDisplay } from '../actions/update'
import Header from '../components/Header';
import Docs from '../components/otherPages/Docs';
import About from '../components/otherPages/About';
import Support from '../components/otherPages/Support';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';

class RouteObject {
  constructor(public route: string, public routeName: string) {

  }
}
class App extends React.Component<any, any> {
  componentWillMount() {
    this.props.fetchApplications();
    this.makeApiCalls();
  }
  makeApiCalls() {
    let config = {
      headers: {
        "Content-Type": "application/json"
      }
    }
    //method to serve as playground for testing API calls
    const rootUrl: string = "http://localhost:5000/";
    let appId: string = "";
    let entityId: string = "";
    let actionId: string = "";
    let getAppsRoute: RouteObject = new RouteObject("apps", "GET ALL APPS");

    axios.get(rootUrl.concat(getAppsRoute.route), config)
      .then(response => {
        console.log(getAppsRoute.routeName, response.data)
        appId = response.data.apps[1].appId;
        let getEntitiesForAppRoute: RouteObject = new RouteObject(`app/${appId}/entities`, "GET ALL ENTITIES FOR APP")
        let getActionsForAppRoute: RouteObject = new RouteObject(`app/${appId}/actions`, "GET ALL ACTIONS FOR APP")
        axios.get(rootUrl.concat(getEntitiesForAppRoute.route), config)
          .then(response => {
            console.log(getEntitiesForAppRoute.routeName, response.data)
            entityId = response.data.entities[0].entityId;
            axios.get(rootUrl.concat(getActionsForAppRoute.route), config)
              .then(response => {
                console.log(getActionsForAppRoute.routeName, response.data)
                actionId = response.data.actions[0].actionId;

                //App Routes
                let getAppRoute: RouteObject = new RouteObject(`app/${appId}`, "GET APP")
                let addAppRoute: RouteObject = new RouteObject(`app`, "ADD APP")  //takes an app in the body
                let editAppRoute: RouteObject = new RouteObject(`app/${appId}`, "EDIT APP") //takes an app in the body
                let deleteAppRoute: RouteObject = new RouteObject(`app/${appId}`, "DELETE APP") //takes an app in the body
                //Entity Routes
                let getEntityRoute: RouteObject = new RouteObject(`app/${appId}/entity/${entityId}`, "GET APP")
                let addEntityRoute: RouteObject = new RouteObject(`app/${appId}/entity`, "ADD ENTITY") //takes an entity in the body
                let deleteEntityRoute: RouteObject = new RouteObject(`app/${appId}/entity`, "DELETE ENTITY") //takes an entity in the body
                //Action Routes
                let getActionRoute: RouteObject = new RouteObject(`app/${appId}/action/${actionId}`, "GET ACTION")
                let addActionRoute: RouteObject = new RouteObject(`app/${appId}/action`, "ADD ACTION") //takes an action in the body
                let editActionRoute: RouteObject = new RouteObject(`app/${appId}/action/${actionId}`, "EDIT ACTION") //takes an action in the body
                let deleteActionRoute: RouteObject = new RouteObject(`app/${appId}/action/${actionId}`, "DELETE ACTION") //takes an action in the body

                let getRoutes: RouteObject[] = [getAppRoute, getActionRoute, getEntityRoute];
                let fullGetRoutes: RouteObject[] = getRoutes.map((r: RouteObject) => new RouteObject(rootUrl.concat(r.route), r.routeName));
                fullGetRoutes.map((routeObj: RouteObject) => {
                  axios.get(routeObj.route, config)
                    .then((response) => {
                      console.log(routeObj.routeName, response.data)
                    })
                })
              })
          })
      })
      .catch((err) => {
        console.log(err);
      })
  }
  render() {
    return (
      <Router>
        <div className="app">
          <Header setDisplay={this.props.setBLISAppDisplay} setWebchatDisplay={this.props.setWebchatDisplay} />
          <Route exact path="/" component={BLISAppsHomepage} />
          <Route path="/myApps" component={BLISAppsHomepage} />
          <Route path="/about" component={About} />
          <Route path="/support" component={Support} />
          <Route path="/docs" component={Docs} />
        </div>
      </Router>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    fetchApplications: fetchApplications,
    setBLISAppDisplay: setBLISAppDisplay,
    setWebchatDisplay: setWebchatDisplay
  }, dispatch);
}
export default connect(null, mapDispatchToProps)(App);
