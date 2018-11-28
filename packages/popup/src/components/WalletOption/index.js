import React from 'react';

import { FormattedMessage } from 'react-intl';

import './WalletOption.scss';

const WalletOption = props => {
    const {
        className = '',
        onClick,
        name
    } = props;

    const titleKey = `${ name }.TITLE`;
    const descKey = `${ name }.DESC`;

    return (
        <div className={ `walletOption ${ className }` } onClick={ onClick }>
            <FormattedMessage id={ titleKey } />
            <FormattedMessage id={ descKey } />
        </div>
    );
};

export default WalletOption;