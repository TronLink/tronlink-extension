import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import './Content.css';

class Content extends Component {
    render() {
        return (
            <div className="mainContent">
                { this.props.children }
            </div>
        );
    }
}

export default Content;