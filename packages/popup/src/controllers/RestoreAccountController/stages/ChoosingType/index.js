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
        <div className='insetContainer createOrImportWallet'>
            <div className='pageHeader'>
                <div className="back" onClick={ onCancel }></div>
                <div className="logo1"></div>
                <div className="logo2"></div>
            </div>
            <div className='greyModal'>
                <div className='modalDesc hasBottomMargin'>
                    <FormattedMessage id='CHOOSING_TYPE' />
                </div>
                <div className="walletOptions">
                    <WalletOption
                        tabIndex={ 1 }
                        className='hasBottomMargin'
                        name='CHOOSING_TYPE.MNEMONIC'
                        onClick={ () => onSubmit(RESTORATION_STAGE.IMPORT_MNEMONIC) }
                    />
                    <WalletOption
                        tabIndex={ 2 }
                        className='hasBottomMargin'
                        name='CHOOSING_TYPE.PRIVATE_KEY'
                        onClick={ () => onSubmit(RESTORATION_STAGE.IMPORT_PRIVATE_KEY) }
                    />
                </div>
                {/*<Button*/}
                    {/*id='BUTTON.GO_BACK'*/}
                    {/*type={ BUTTON_TYPE.DANGER }*/}
                    {/*onClick={ onCancel }*/}
                {/*/>*/}
            </div>
        </div>
    );
};

export default ChoosingType;
