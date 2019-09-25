import React from 'react';

import { connect } from 'react-redux';
import { setPage } from '@tronlink/popup/src/reducers/appReducer';

import AccountsPage from '@tronlink/popup/src/pages/AccountsPage';
import './PageController.scss';

class PageController extends React.Component {
    pages = {
        ACCOUNTS: AccountsPage,

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

        const pages = this.pages;

        return (
            <div className='pageContainer'>
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
                                    //changePage={ this.changePage }
                                    //setSubTitle={ this.setSubTitle }
                                    //onPageChange={ callback => this.onPageChange(index, callback) }
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
