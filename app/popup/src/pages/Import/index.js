import React, { Component } from 'react';
import { NavLink, Route } from 'react-router-dom';

import Button from 'components/Button';

import './Import.css';

class Import extends Component {
    state = {
        privateKey: ''
    }

    handlePrivateKeyChange({ target: { value: privateKey }}) {
        this.setState({ privateKey });
    }

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
                    onChange={ event => this.handlePrivateKeyChange(event) }
                />
                <NavLink to="/main/transactions">
                    <Button type={ 'black' } style={{ marginTop: '20px' }}>
                        Import
                    </Button>
                </NavLink>
            </div>
        );
    }
}

export default Import;