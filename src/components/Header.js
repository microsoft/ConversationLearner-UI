import React from 'react';
import { Link } from 'react-router-dom';
export default class Header extends React.Component {
    constructor(p) {
        super(p)
    }
    render() {
        return (
            <div>
                <ul>
                    <li><Link to="/">BLIS</Link></li>
                    <li><Link to="/myApps">My Apps</Link></li>
                    <li><Link to="/about">About </Link></li>
                    <li><Link to="/support">Support</Link></li>
                    <li><Link to="/docs">Docs</Link></li>
                </ul>
            </div>
        )
    }
}