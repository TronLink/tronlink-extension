import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
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
                    <div className="settingSubHeader">TestNet Tron Network</div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">Current Price :</div>
                    <div className="settingSubHeader">Updated { (new Date()).toLocaleString() }</div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">State logs contain your public account address and sent transaction :</div>
                    <div className="settingsbtn button gradient">Download State Logs</div>
                    <div className="settingsbtn button outline">Reveal Seed Words</div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">Resetting is for developer use only. <span>Read More</span></div>
                    <div className="settingsbtn button black">Reset Account</div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    settings: state.settings
}))(Settings);