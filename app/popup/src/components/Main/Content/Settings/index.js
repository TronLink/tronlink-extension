import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import './Settings.css';

class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    handlePrivateKeyChange = (e) => this.setState({ privateKey: e.target.value });
    /*
    <input 
        placeholder="Enter Private Key to Import a Wallet..."
        className="textInput"
        type="text"
        value={this.state.privateKey}
        onChange={this.handlePrivateKeyChange}
    />
    */
    render() {
        return (
            <div className="settings">
                <div className="settingsContainer">
                    <div className="settingHeader">Current Network :</div>
                    <div className="settingSubHeader">Main Tron Network</div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">Current Conversion :</div>
                    <div className="settingSubHeader">Updated Wed Jul 18 2018 08:49:34 GMT</div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">State logs contain your public account address and sent transaction :</div>
                    <div className="settingsbtn button gradient">Download State Logs</div>
                    <div className="settingsbtn button white">Reveal Seed Words</div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">Resetting is for developer use only. <span>Read More</span></div>
                    <div className="settingsbtn button black">Reset Account</div>
                </div>
            </div>
        );
    }
}

export default Settings;