import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';

import Button from 'components/Button';
import axios from 'axios';
import Swal from 'sweetalert2';

import './Give.css';

class Give extends Component {
    constructor(props) {
        super(props);
        this.translate = props.intl.formatMessage;
    }

    async fund(){
        axios.get(
            'https://us-central1-flottpay.cloudfunctions.net/testCoins?address=' + this.props.account.address
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

    render() {
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
                        <FormattedMessage id='give.fund.address' values={{ address: this.props.account.address }} />
                    </div>
                </div>
                
                <Button onClick={ () => this.fund() } type={ 'black' } style={{ margin: '30px 0' }}>
                    <FormattedMessage id='give.fund.button' />
                </Button>
            </div>
        );
    }
}


export default withRouter(
    injectIntl(
        connect(state => ({ 
            account: 
            state.wallet.account 
        }))(Give)
    )
);
