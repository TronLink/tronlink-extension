import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './Main.css';

import Account from './Account.js';
import Settings from './Settings.js';

class Main extends Component {
    render() {
        return (
            <div className="mainContainer">
                <Switch>
                    <Route path="/main/settings" component={Settings} />
                    <Route path="/main" component={Account} />
                </Switch>
            </div>
        );
    }
}

export default Main;
