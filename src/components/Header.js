import React from 'react';
import { Link } from 'react-router-dom';
export default class Header extends React.Component {
    constructor(p) {
        super(p)
    }
    render() {
        return (
            <div className='header'>
                <div className='headerListDiv'>
                    <div className='headerElementDiv'>
                        <span className="ms-font-m-plus ms-fontColor-themePrimary"><Link className='headerLink' to="/myApps">My Apps</Link></span>
                    </div>
                    <div className='headerElementDiv'>
                        <span className="ms-font-m-plus ms-fontColor-themePrimary"><Link className='headerLink' to="/docs">Docs</Link></span>
                    </div>
                    <div className='headerElementDiv'>
                        <span className="ms-font-m-plus ms-fontColor-themePrimary"><Link className='headerLink' to="/about">About</Link></span>
                    </div>
                    <div className='headerElementDiv'>
                        <span className="ms-font-m-plus ms-fontColor-themePrimary"><Link className='headerLink' to="/support">Support</Link></span>
                    </div>
                </div>
                <div className='headerTitleDiv'>
                    <div className='headerTitle'>
                        <span className="ms-font-xl ms-fontColor-themePrimary"><Link className='headerLink' to="/">BLIS</Link></span>
                    </div>
                </div>
            </div>
        )
    }
}