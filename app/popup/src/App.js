import React, { Component } from 'react';
import './App.css';

import Header from './components/Header/Header.js';
import MainContent from './components/MainContent/MainContent.js';

class App extends Component {
    render() {
        return (
            <div className="app">
                <Header />
                <MainContent />
            </div>
        );
    }
}

export default App;
