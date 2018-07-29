import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import './Warning.css';

class Warning extends Component {
    constructor(props) {
        super(props);

        this.state = {
            checked: false,
        };
    }

    render() {
        return (
            <div className="warning">
                <div className="warningHeader">WARNING</div>
                <div className="warningBody">TronLink is currently only able to support <span>Tron's TestNet</span>.</div>
                <div className="warningBody">This is an <span>alternate version</span> of the main Tron Network.</div>
                <div className="warningBody">Only continue if you understand this.</div>
                <div className="warningBody">We take no responsibility for any loss of funds.</div>
                <NavLink to="/welcome">
                    <div className="warningBtn button black">Continue</div>
                </NavLink>
            </div>
        );
    }
}

export default Warning;
