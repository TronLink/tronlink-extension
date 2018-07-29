import React, { Component } from 'react';

import { ArrowLeftIcon } from '../../Icons.js';

import Header from './Header';
import Content from './Content';

import GiveContent from './Content/Give';

class Give extends Component {
    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle="GRANT FUNDS"
                    navbarLabel=""
                    leftIcon={true}
                    leftIconImg={<ArrowLeftIcon />}
                    leftIconRoute="/main/transactions"
                    rightIcon={false}
                />
                <Content>
                    <GiveContent />
                </Content>
            </div>
        );
    }
}

export default Give;
