import React, { Component } from 'react';

import { ArrowLeftIcon } from 'components/Icons';

import Header from 'components/Header';

import GiveContent from './GiveView';

import { FormattedMessage } from 'react-intl';

class Give extends Component {
    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle={ <FormattedMessage id='give.fund.title' /> }
                    navbarLabel=""
                    leftIcon={ true }
                    leftIconImg={ <ArrowLeftIcon /> }
                    leftIconRoute="/main/transactions"
                    rightIcon={ false }
                />
                <div className="mainContent">
                    <GiveContent />
                </div>
            </div>
        );
    }
}

export default Give;
