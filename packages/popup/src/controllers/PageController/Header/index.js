import React from 'react';

import { FormattedMessage } from 'react-intl';
import { PAGES } from '@tronlink/lib/constants';
import { connect } from 'react-redux';

import './Header.scss';

const PageLink = props => {
    const {
        active = false,
        page,
        changePage
    } = props;

    const pageKey = `PAGES.${ page }`;
    const pageIndex = PAGES[ page ];

    return (
        <FormattedMessage
            id={ pageKey }
            children={ text => (
                <div
                    className={ `pageLink ${ active ? 'active' : '' }` }
                    onClick={ () => !active && changePage(pageIndex) }
                >
                    { text }
                </div>
            ) }
        />
    );
};

class Header extends React.Component {
    render() {
        const {
            title,
            currentPage,
            changePage,
            selectedAccount
        } = this.props;

        const pages = Object.keys(PAGES);

        return (
            <div className='header'>
                <div className='titleContainer'>
                    <FormattedMessage
                        id={ `TITLES.${ title }` }
                        children={ text => (
                            <span className='title'>
                                { text }
                            </span>
                        )}
                    />
                    { /*subTitle ? <FormattedMessage id={ subTitle } children={ text => (
                        <span className='subTitle'>
                            { text }
                        </span>
                    )} /> : ''*/ }
                    <span className='subTitle'>
                        { selectedAccount }
                    </span>
                </div>
                <div className='pageLinks'>
                    { pages.map(( pageKey, index) => (
                        <PageLink
                            page={ pageKey }
                            changePage={ changePage }
                            active={ currentPage === index }
                            key={ pageKey }
                        />
                    )) }
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    selectedAccount: state.accounts.selected.name
}))(Header);