import React from 'react';
import WalletOption from 'components/WalletOption';
import Button from 'components/Button';

import { FormattedMessage } from 'react-intl';

import {
    RESTORATION_STAGE,
    BUTTON_TYPE
} from '@tronlink/lib/constants';

const ChoosingType = props => {
    const {
        onSubmit,
        onCancel
    } = props;

    return (
        <div className='insetContainer choosingType'>
            <div className='pageHeader'>
                <div className="back" onClick={ onCancel }></div>
                <FormattedMessage id="CHOOSING_TYPE.TITLE" />
            </div>
            <div className='greyModal'>
                <div className="option" onClick={ () => onSubmit(RESTORATION_STAGE.IMPORT_MNEMONIC) }>
                    <FormattedMessage id="CHOOSING_TYPE.MNEMONIC.TITLE" />
                </div>
                <div className="option" onClick={ () => onSubmit(RESTORATION_STAGE.IMPORT_PRIVATE_KEY) }>
                    <FormattedMessage id="CHOOSING_TYPE.PRIVATE_KEY.TITLE" />
                </div>
            </div>
        </div>
    );
};

export default ChoosingType;
