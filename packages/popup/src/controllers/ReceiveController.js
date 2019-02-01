import React from 'react';
import QRCode  from 'qrcode-react';
import { FormattedMessage } from 'react-intl';


const ReceiveController = props => {
    const {
        address,
        onCancel
    } = props;

    return (
        <div className='insetContainer receive'>
            <div className='pageHeader'>
                <div className="back" onClick={ onCancel }></div>
                <FormattedMessage id="ACCOUNT.RECEIVE" />
            </div>
            <div className='greyModal'>
                <div className="desc">
                    <FormattedMessage id="ACCOUNT.RECEIVE.DESC" />
                </div>
                <QRCode
                    value={address}
                />
                <div class="address">
                    {address}
                </div>
                <a className="copyAddressBtn">
                    <FormattedMessage id="ACCOUNT.RECEIVE.BUTTON" />
                </a>
            </div>
        </div>
    );
};

export default ReceiveController;
