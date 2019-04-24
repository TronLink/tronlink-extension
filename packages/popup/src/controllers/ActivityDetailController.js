import React from 'react';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage } from 'react-intl';
import { APP_STATE,USDT_ACTIVITY_STAGE } from "@tronlink/lib/constants";
import { PopupAPI } from '@tronlink/lib/api';
import moment from 'moment';
class ActivityDetailController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    render() {
        const { onCancel } = this.props;
        return (
            <div className='insetContainer transactions'>
                <div className='pageHeader'>
                    <div className="back" onClick={onCancel}></div>
                    <FormattedMessage id="USDT.TEXT.ACTIVITY_DETAIL"/>
                </div>
                <div className='greyModal'>
                    <div className="banner">

                    </div>
                </div>
            </div>
        );
    }
}

export default ActivityDetailController;
