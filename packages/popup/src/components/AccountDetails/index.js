import React from 'react';

import { connect } from 'react-redux';

import {
    FormattedMessage,
    FormattedNumber
} from 'react-intl';

import './AccountDetails.scss';

const AccountDetails = ({ account, prices }) => {
    const {
        balance,
        energy,
        bandwidth
    } = account;

    const {
        priceList,
        selected: currency
    } = prices;

    const amount = (balance / 1000000) * priceList[ currency ];

    return (
        <div className='accountInfo'>
            <div className='accountBalance'>
                <div className='trxBalance'>
                    <FormattedNumber value={ balance / 1000000 } maximumFractionDigits={ 6 } />
                    <span className='ticker'>
                        TRX
                    </span>
                </div>
                <FormattedMessage id='TRANSACTIONS.CURRENCY' values={{ amount, currency }} />
            </div>
            <div className='accountLabel'>
                <FormattedNumber value={ energy } />
                <FormattedMessage id='TRANSACTIONS.ENERGY' />
            </div>
            <div className='accountLabel'>
                <FormattedNumber value={ bandwidth } />
                <FormattedMessage id='TRANSACTIONS.BANDWIDTH' />
            </div>
        </div>
    );
};

export default connect(state => ({
    account: state.accounts.selected,
    prices: state.app.prices
}))(AccountDetails);