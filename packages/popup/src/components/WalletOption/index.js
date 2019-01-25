import React from 'react';

import { FormattedMessage } from 'react-intl';
import Button from '../Button';

import './WalletOption.scss';

const WalletOption = props => {
    const {
        className = '',
        onClick,
        name
    } = props;

    const titleKey = `${ name }.TITLE`;
    const descKey = `${ name }.TIP`;

    return (
        <div className={ `walletOption ${ className }`} >
            <div className="iconWrap"></div>
            <Button id={titleKey} onClick={ onClick } />
            <div className="tip"><FormattedMessage id={descKey}/></div>
        </div>
    );
};

export default WalletOption;
