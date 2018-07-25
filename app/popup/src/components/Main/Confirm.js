import React, { Component } from 'react';

import { SettingsIcon } from '../../Icons.js';

import Header from './Header';
import Content from './Content';

import ConfirmSendHeader from './Header/ConfirmSend';
import ConfirmSendContent from './Content/ConfirmSend';

class Confirm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sendAmount: '89.2877',
            toAddress: '17UNYEGIUN763NBGIHENKIGE76'
        };
    }

    renderCheck() {
        if (true) return this.renderSend();
        if (true) return this.renderSend();
        if (true) return this.renderSend();
        if (true) return this.renderSend();
    }

    renderSend() {
        let token = false;
        if (token) {
            return (
                <div class="mainContainer">
                    <Header 
                        navbarTitle="CONFIRM TOKEN SEND"
                        navbarLabel=""
                        leftIcon={false}
                        rightIcon={false}
                    >
                        <ConfirmSendHeader 
                            sendAmount={this.state.sendAmount}
                            sendLabel="TronWatch"
                            toAddress={this.state.toAddress}
                        />
                    </Header>
                    <Content>
                        <ConfirmSendContent />
                    </Content>
                </div>
            );
        }
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle="CONFIRM TRX SEND"
                    navbarLabel=""
                    leftIcon={false}
                    rightIcon={false}
                >
                    <ConfirmSendHeader 
                        sendAmount={this.state.sendAmount}
                        sendLabel="TRX"
                        toAddress={this.state.toAddress}
                    />
                </Header>
                <Content>
                    <ConfirmSendContent />
                </Content>
            </div>
        );
    }

    render() {
        return this.renderCheck();
    }
}

export default Confirm;
