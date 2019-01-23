import React from 'react';
import WalletOption from 'components/WalletOption';

import { FormattedMessage } from 'react-intl';
import { APP_STATE } from '@tronlink/lib/constants';
import { PopupAPI } from '@tronlink/lib/api';

const onCreationSelect = () => PopupAPI.changeState(APP_STATE.CREATING);
const onRestoreSelect = () => PopupAPI.changeState(APP_STATE.RESTORING);

const WalletCreationController = () => (
    <div className='insetContainer createOrImportWallet'>
        <div className='pageHeader'>
            <div className="logo1"></div>
            <div className="logo2"></div>
        </div>
        <div className='greyModal'>
            {/*<FormattedMessage*/}
                {/*id='CREATION'*/}
                {/*children={ text => (*/}
                    {/*<div className='modalDesc hasBottomMargin'>*/}
                        {/*{ text }*/}
                    {/*</div>*/}
                {/*) }*/}
            {/*/>*/}
            <div className="walletOptions">
                <WalletOption tabIndex={ 1 } name='CREATION.CREATE' onClick={ onCreationSelect } />
                <WalletOption tabIndex={ 2 } name='CREATION.RESTORE' onClick={ onRestoreSelect } />
            </div>
        </div>
    </div>
);

export default WalletCreationController;
