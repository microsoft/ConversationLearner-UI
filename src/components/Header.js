import React from 'react';
import { Link } from 'react-router-dom';
export default class Header extends React.Component {
    constructor(p) {
        super(p)
    }
    render() {
        return (
            <div className='header'>
                <div className='headerTitleDiv'>
                    <span className="ms-font-xxl ms-fontColor-themePrimary"><Link className='headerLink' to="/">BLIS</Link></span>
                </div>
                <div className='headerListDiv'>
                    <span className="ms-font-xxl ms-fontColor-themePrimary"><Link className='headerLink' to="/myApps">My Apps</Link></span>
                    <span className="ms-font-xxl ms-fontColor-themePrimary"><Link className='headerLink' to="/docs">Docs</Link></span>
                    <span className="ms-font-xxl ms-fontColor-themePrimary"><Link className='headerLink' to="/about">About</Link></span>
                    <span className="ms-font-xxl ms-fontColor-themePrimary"><Link className='headerLink' to="/support">Support</Link></span>
                </div>
            </div>
        )
    }
}