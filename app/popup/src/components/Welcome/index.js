import React, { Component } from 'react';
import './Welcome.css';

class Welcome extends Component {
    render() {
        return (
            <div className="welcome">
                <div className="logo"></div>
                <div className="decryptContainer">
                    <input 
                        placeholder="Enter Password to decrypt wallet..."
                        className="textInput"
                        type="password"

                    />
                    <div className="loginBtn">Login</div>
                </div>
                <div className="restoreWallet">Restore from seed phrase</div>
            </div>
        );
    }
}

export default Welcome;
