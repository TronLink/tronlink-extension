import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import './Content.css';

import AccountView from './AccountView';
import Transaction from './AccountView/Transactions';

class Content extends Component {
    render() {
        return (
            <div className="mainContent">
                <AccountView />
            </div>
        );
    }
}

export default Content;
