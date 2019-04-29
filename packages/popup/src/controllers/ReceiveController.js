import React from 'react';
import QRCode from 'qrcode-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Toast } from 'antd-mobile';
import { FormattedMessage, injectIntl } from 'react-intl';

const ReceiveController = props => {
    const {
        address,
        onCancel
    } = props;
    const { formatMessage } = props.intl;
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
                <CopyToClipboard text={address} onCopy={ () => { Toast.info(formatMessage({ id: 'TOAST.COPY' }), 2); }}>
                    <a className="copyAddressBtn">
                        <FormattedMessage id="ACCOUNT.RECEIVE.BUTTON" />
                    </a>
                </CopyToClipboard>
            </div>
        </div>
    );
};

export default injectIntl(ReceiveController);
