import React, { Component } from 'react';
import { NavLink, Route } from 'react-router-dom';
import './Import.css';

class Import extends Component {
    constructor(props) {
        super(props);

        this.state = {
            privateKey: ''
        };
    }

    handlePrivateKeyChange = (e) => this.setState({ privateKey: e.target.value });

    render() {
        return (
            <div className="import">
                <div className="importHeader">Welcome!</div>
                <div className="importText">You currently have no wallet imported. Please import a wallet using its private key below. Wallet Generation will be added at an upcoming date.</div>
                <input 
                    placeholder="Enter Private Key to Import a Wallet..."
                    className="textInput"
                    type="text"
                    value={this.state.privateKey}
                    onChange={this.handlePrivateKeyChange}
                />
                <NavLink to="/main/transactions">
                    <div className="loginBtn">Import</div>
                </NavLink>
            </div>
        );
    }
}

export default Import;