import React from 'react';
import CustomScroll from 'react-custom-scroll';
// import Transaction from './Transaction';
import AccountDetails from 'components/AccountDetails';

import { connect } from 'react-redux';

import './TransactionsPage.scss';

const TransactionsPage = ({ account }) => {
    // const { transactions } = account;

    return (
        <div className='transactionsPage'>
            <AccountDetails />
            <div className='transactions'>
                <CustomScroll heightRelativeToParent='100%'>
                    {/*{ transactions.map(transaction => (*/}
                        {/*<Transaction transaction={ transaction } key={ transaction.txID } />*/}
                    {/*)) }*/}
                </CustomScroll>
            </div>
        </div>
    );
};

export default connect(state => ({
    account: state.accounts.selected
}))(TransactionsPage);
