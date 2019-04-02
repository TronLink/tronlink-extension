import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';
import { Accordion, NavBar } from 'antd-mobile';
import './TronBankHelp.scss';

class TronBankHelp extends React.Component {

    onChange = (key) => {
        console.log(key);
    };

    render() {
        const { formatMessage } = this.props.intl;
        return(
            <div className='bankHelpContent'>
                <NavBar
                    className='navbar'
                    mode='light'
                    icon={<div className='commonBack'></div>}
                    onLeftClick={() => PopupAPI.changeState(APP_STATE.TRONBANK)}
                >
                    <FormattedMessage id='BANK.RENTNUMMODAL.HELP' />
                </NavBar>
                <section className='tronBankContent'>
                    <Accordion className='my-accordion' onChange={this.onChange}>
                        <Accordion.Panel header={formatMessage({ id: 'BANK.HELP.ANNOUNCEMENTS' })} className='announcements'>
                            <section className='announcementsCont'>
                                <FormattedMessage id='BANK.HELP.TIPSONE' /><br />
                                <FormattedMessage id='BANK.HELP.TIPSTWO' /><br />
                                <FormattedMessage id='BANK.HELP.TIPSTHREE' />
                            </section>
                        </Accordion.Panel>
                        <Accordion.Panel header={formatMessage({ id: 'BANK.HELP.CONTACT' })}π className='feedback'>
                            <section className='feedbackCont'>
                                <FormattedMessage id='BANK.HELP.JOINCOMMUNITY' /><br/>
                                    (Tron Lending)
                                <FormattedMessage id='BANK.HELP.FEEDBACK' /><br/>
                                    xxx@TronLending.com
                            </section>
                        </Accordion.Panel>
                    </Accordion>
                </section>
            </div>
        );
    }
}

export default injectIntl(TronBankHelp);