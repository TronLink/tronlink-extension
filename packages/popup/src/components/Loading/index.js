/**
 * Created by tron on 2019/7/3.
 */
import React from 'react';
import Button from '@tronlink/popup/src/components/Button';
import LoadingGif from 'assets/images/loading_black.gif';

import { injectIntl } from 'react-intl';

import './Loading.scss';

const Loading = props => {
    const { formatMessage } = props.intl;
    const {
        show = true,
        title = formatMessage({id:'CREATION.LEDGER.LOADING'})
    } = props;


    return (
            show
            ?
            <div className="loading" >
                <div className="wrap">
                    <div className="title">
                        {title}
                    </div>
                    <img src={LoadingGif} alt=""/>
                    <Button id="BUTTON.CANCEL" onClick={props.onClose} />
                </div>
            </div>
            :
            null
    );
};

export default injectIntl(Loading);