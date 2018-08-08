import React from 'react';
import Header from 'components/Header';
import Utils from 'extension/utils';

import { ArrowLeftIcon } from 'components/Icons';

const MERCHANT_ID = 'c4d8a4854c93';
const REF_ID = 'c4d8a4854c93';

export default class BuyPage extends React.Component {
    componentDidMount() {
        document.documentElement.className = 'extended';
    }

    componentWillUnmount() {
        document.documentElement.className = '';
    }

    render() {
        const address = Utils.transformAddress(
            this.props.match.params.address
        ) || '';

        const url = [
            'https://changelly.com/widget/v1',
                '?auth=email',
                '&from=BTC',
                '&to=TRX',
                '&merchant_id=' + MERCHANT_ID,
                '&address=' + address,
                '&amount=0.005',
                '&ref_id=' + REF_ID,
                '&color=ed3f23'
        ].join('');

        return (
            <div className="mainContainer">
                <Header 
                    navbarTitle="PURCHASE TRX"
                    navbarLabel=""
                    leftIcon={ true }
                    leftIconImg={ <ArrowLeftIcon /> }
                    leftIconRoute="/main/transactions"
                    rightIcon={ false }
                />
                <div className="mainContent">
                    <iframe 
                        src={ url }
                        width="600" 
                        height="520" 
                        class="changelly" 
                        scrolling="no" 
                        style={{ overflowY: 'hidden', border: 'none' }}
                    >Failed to load purchase page</iframe>
                </div>
            </div>
        )
    }
}