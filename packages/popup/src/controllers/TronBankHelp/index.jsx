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
                                <FormattedMessage id='BANK.HELP.TIPSTHREE' /><br/>
                                <FormattedMessage id='BANK.HELP.TIPSFOUR' />
                            </section>
                        </Accordion.Panel>
                        <Accordion.Panel header={formatMessage({ id: 'BANK.HELP.CONTACT' })}π className='feedback'>
                            <section className='feedbackCont'>
                                <h2 className='title'><FormattedMessage id='BANK.HELP.JOINCOMMUNITY' /></h2>
                                <p className='content'>
                                    <img src={require('../../assets/images/new/tronBank/telegram.svg')} alt='telegram'/><a href='https://t.me/Tronlending' rel='noopener noreferrer' target='_blank'><span className='linkStyle'>（TronLink Official Group）</span></a>
                                </p>
                                <h2 className='title'>
                                    <FormattedMessage id='BANK.HELP.FEEDBACK' />
                                </h2>
                                <p className='content single'>
                                    tronlending@tronlink.org
                                </p>
                            </section>
                        </Accordion.Panel>
                    </Accordion>
                </section>
            </div>
        );
    }
}

export default injectIntl(TronBankHelp);