import React, { Component } from 'react';

import { ArrowLeftIcon } from '../../Icons.js';

import Header from './Header';
import Content from './Content';

import SendHeader from './Header/Send';
import SendContent from './Content/Send';

class Send extends Component {

    constructor(props){
        super(props);

        this.state = {
            txToDataAddress : ""
        }
    }

    onSetAddress(e){
        this.setState({
            txToDataAddress : e.target.value
        })

    }

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
                    <SendHeader onSetAddress={this.onSetAddress.bind(this)} />
                </Header>
                <Content>
                    <SendContent txToDataAddress={this.state.txToDataAddress}/>
                </Content>
            </div>
        );
    }
}

export default Send;
