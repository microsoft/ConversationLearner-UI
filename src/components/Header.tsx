import * as React from 'react';
import { setDisplayMode, setLoginDisplay } from '../actions/updateActions'
import UserLogin from '../containers/UserLogin'
import UIError from '../containers/Error'
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { State } from '../types'
import { bindActionCreators } from 'redux';
import { DisplayMode } from '../types/const'

class Header extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            myAppsClass: 'selectedHeaderElementDiv',
            docsClass: 'headerElementDiv',
            aboutClass: 'headerElementDiv',
            supportClass: 'headerElementDiv',
        }
        this.tabSelected = this.tabSelected.bind(this)
    }
    tabSelected(tab: string) {
        switch (tab) {
            case "myApps":
                this.setState({
                    myAppsClass: 'selectedHeaderElementDiv',
                    docsClass: 'headerElementDiv',
                    aboutClass: 'headerElementDiv',
                    supportClass: 'headerElementDiv',
                })
                break;
            case "docs":
                this.setState({
                    myAppsClass: 'headerElementDiv',
                    docsClass: 'selectedHeaderElementDiv',
                    aboutClass: 'headerElementDiv',
                    supportClass: 'headerElementDiv',
                })
                break;
            case "about":
                this.setState({
                    myAppsClass: 'headerElementDiv',
                    docsClass: 'headerElementDiv',
                    aboutClass: 'selectedHeaderElementDiv',
                    supportClass: 'headerElementDiv',
                })
                break;
            case "support":
                this.setState({
                    myAppsClass: 'headerElementDiv',
                    docsClass: 'headerElementDiv',
                    aboutClass: 'headerElementDiv',
                    supportClass: 'selectedHeaderElementDiv',
                })
                break;
            case 'default':
                break;
        }
    }
    render() {
        let displayName = this.props.userName ? this.props.userName : "BLIS";
        return (
            <div className='header'>
                <div className="myAppsHeaderContentBlock myAppsButtonsDiv">
                    <UIError/>
                    <UserLogin/>
                </div>
                <div className='headerListDiv'>
                    <div className={this.state.myAppsClass}>
                        <span className="ms-font-m-plus ms-fontColor-themePrimary"><Link onClick={() => {
                            this.props.setDisplayMode(DisplayMode.AppAdmin);
                            this.tabSelected('myApps');
                        }} className='headerLink' to="/myApps">My Apps</Link></span>
                    </div>
                    <div className={this.state.docsClass}>
                        <span className="ms-font-m-plus ms-fontColor-themePrimary"><Link onClick={() => this.tabSelected('docs')} className='headerLink' to="/docs">Docs</Link></span>
                    </div>
                    <div className={this.state.aboutClass}>
                        <span className="ms-font-m-plus ms-fontColor-themePrimary"><Link onClick={() => this.tabSelected('about')} className='headerLink' to="/about">About</Link></span>
                    </div>
                    <div className={this.state.supportClass}>
                        <span className="ms-font-m-plus ms-fontColor-themePrimary"><Link onClick={() => this.tabSelected('support')} className='headerLink' to="/support">Support</Link></span>
                    </div>
                </div>
                <div className='headerTitleDiv'>
                    <div className='headerTitle'>
                        <span className="ms-font-xl ms-fontColor-themePrimary"><Link onClick={() => this.props.setLoginDisplay(true)} className='headerLink' to="/">{displayName}</Link></span>
                    </div>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    setDisplayMode: setDisplayMode,
    setLoginDisplay: setLoginDisplay,
  }, dispatch);
}

const mapStateToProps = (state: State) => {
    return {
        userName: state.user.name
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);