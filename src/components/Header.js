import React from 'react';
import { Link } from 'react-router-dom';
export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myAppsClass: 'selectedHeaderElementDiv',
            docsClass: 'headerElementDiv',
            aboutClass: 'headerElementDiv',
            supportClass: 'headerElementDiv',
        }
        this.tabSelected = this.tabSelected.bind(this)
    }
    tabSelected(tab){
        switch(tab){
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
        return (
            <div className='header'>
                <div className='headerListDiv'>
                    <div className={this.state.myAppsClass}>
                        <span className="ms-font-m-plus ms-fontColor-themePrimary"><Link onClick={() =>{
                            this.props.setDisplay("Home")
                            this.tabSelected('myApps') 
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
                        <span className="ms-font-xl ms-fontColor-themePrimary"><Link onClick={() =>{
                            this.props.setDisplay("Home")
                            this.tabSelected('myApps')
                        }} className='headerLink' to="/">BLIS</Link></span>
                    </div>
                </div>
            </div>
        )
    }
}