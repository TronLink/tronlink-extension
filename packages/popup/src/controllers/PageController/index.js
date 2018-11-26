import React from 'react';
import Header from './Header';

import { connect } from 'react-redux';
import { setPage } from 'reducers/appReducer';

import AccountsPage from 'pages/AccountsPage';
import TransactionsPage from 'pages/TransactionsPage';
import TokensPage from 'pages/TokensPage';
import SendPage from 'pages/SendPage';
import SettingsPage from 'pages/SettingsPage';

import './PageController.scss';

class PageController extends React.Component {
    pages = {
        ACCOUNTS: AccountsPage,
        TRANSACTIONS: TransactionsPage,
        TOKENS: TokensPage,
        SEND: SendPage,
        SETTINGS: SettingsPage
    };

    state = {
        subTitle: false,
        callbacks: []
    };

    constructor() {
        super();

        this.changePage = this.changePage.bind(this);
        this.setSubTitle = this.setSubTitle.bind(this);
    }

    componentDidMount() {
        const { currentPage } = this.props;
        this.changePage(currentPage);
    }

    changePage(nextPage) {
        const { callbacks } = this.state;

        this.props.setPage(nextPage);

        this.setState({
            subTitle: false
        });

        if(callbacks[ nextPage ])
            callbacks[ nextPage ]();
    }

    setSubTitle(subTitle) {
        this.setState({
            subTitle
        });
    }

    onPageChange(index, callback) {
        const { callbacks } = this.state;

        callbacks[ index ] = callback;

        this.setState({
            callbacks
        });
    }

    render() {
        const { currentPage } = this.props;
        const { subTitle } = this.state;

        const title = Object.keys(this.pages)[ currentPage ];
        const pages = this.pages;

        return (
            <div className='pageContainer'>
                <Header
                    title={ title }
                    subTitle={ subTitle }
                    currentPage={ currentPage }
                    changePage={ this.changePage }
                />
                <div className='pageView'>
                    { Object.values(pages).map((Page, index) => {
                        const pageOffset = (index - currentPage) * 420;

                        return (
                            <div
                                className='page'
                                key={ index }
                                style={{
                                    transform: `translateX(${ pageOffset }px)`
                                }}
                            >
                                <Page
                                    changePage={ this.changePage }
                                    setSubTitle={ this.setSubTitle }
                                    onPageChange={ callback => this.onPageChange(index, callback) }
                                />
                            </div>
                        );
                    }) }
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    currentPage: state.app.currentPage
}), {
    setPage
})(PageController);