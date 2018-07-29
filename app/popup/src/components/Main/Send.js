import React, { Component } from 'react';

import { ArrowLeftIcon } from '../../Icons.js';

import Header from './Header';
import Content from './Content';

import SendHeader from './Header/Send';
import SendContent from './Content/Send';

class Send extends Component {
    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle="CONFIRM TRX SEND"
                    navbarLabel=""
                    leftIcon={true}
                    leftIconImg={<ArrowLeftIcon />}
                    leftIconRoute="/main/transactions"
                    rightIcon={false}
                >
                    <SendHeader />
                </Header>
                <Content>
                    <SendContent />
                </Content>
            </div>
        );
    }
}

export default Send;
