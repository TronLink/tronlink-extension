import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './Main.css';

import Account from './Account.js';
import Settings from './Settings.js';
import Give from './Give.js';
import Send from './Send.js';


/*

send tron
send token
vote
freeze tron
unfreeze tron

*/

class Main extends Component {
    render() {
        return (
            <div className="mainContainer">
                <Switch>
                    <Route path="/main/confirm" component={Send} />
                    <Route path="/main/give" component={Give} />
                    <Route path="/main/settings" component={Settings} />
                    <Route path="/main" component={Account} />
                </Switch>
            </div>
        );
    }
}

export default Main;
