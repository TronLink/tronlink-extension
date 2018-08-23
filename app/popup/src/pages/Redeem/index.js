import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { ArrowLeftIcon } from 'components/Icons';

import Header from 'components/Header';
import Button from 'components/Button';
import axios from 'axios';
import Swal from 'sweetalert2';

import './Redeem.css';

class Redeem extends Component {
    constructor(props) {
        super(props);
        this.translate = props.intl.formatMessage;
    }

    async fund(){
        axios.get(
            'https://us-central1-flottpay.cloudfunctions.net/testCoins?address=' + this.props.account.publicKey
        ).then(() => {
            return Swal({
                title: this.translate({ id: 'give.sent.header' }),
                type: 'success',
                text: this.translate({ id: 'give.sent.body' })
            });
        }).catch(() => {
            return Swal({
                title: this.translate({ id: 'give.failed.header' }),
                type: 'error'
            });
        }).then(() => {
            this.props.history.push('/main/transactions');
        });
    }

    renderBox() {
        return (
            <div className="give">
                <div className="giveContainer">
                    <div className="giveHeader">
                        <FormattedMessage id='give.fund.header' />
                    </div>
                    <div className="giveSubHeader">
                        <FormattedMessage id='give.fund.body' />
                    </div>
                    <div className="giveSubHeader">
                        <FormattedMessage id='give.fund.address' values={{ address: this.props.account.publicKey }} />
                    </div>
                </div>
                
                <Button onClick={ () => this.fund() } type={ 'black' } style={{ margin: '30px 0' }}>
                    <FormattedMessage id='give.fund.button' />
                </Button>
            </div>
        );
    }
    
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
                    { this.renderBox() }
                </div>
            </div>
        );
    }
}

export default withRouter(
    injectIntl(
        connect(state => ({ 
            account: 
            state.wallet.account 
        }))(Redeem)
    )
);
