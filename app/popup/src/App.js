import React, { Component } from 'react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import './App.css';

import Welcome from './components/Welcome';
import Import from './components/Import';
import Main from './components/Main';

class App extends Component {
    render() {
        return (
            <MemoryRouter className="app">
                <Switch>
                    <Route exact path="/" component={Welcome} />
                    <Route exact path="/import" component={Import} />
                    <Route path="/main" component={Main} />
                </Switch>
            </MemoryRouter>
        );
    }
}

export default App;
