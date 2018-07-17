import React, { Component } from 'react';
import './MainContent.css';

import AccountView from './AccountView/AccountView.js';

class MainContent extends Component {
    render() {
        return (
            <div className="mainContent">
                <AccountView />
            </div>
        );
    }
}

export default MainContent;
