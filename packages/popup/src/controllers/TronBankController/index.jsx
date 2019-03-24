/*
 * @Author: lxm
 * @Date: 2019-03-19 15:18:05
 * @Last Modified by: lxm
 * @Last Modified time: 2019-03-24 19:45:46
 * TronBankPage
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import TronWeb from 'tronweb';
import { VALIDATION_STATE, APP_STATE } from '@tronlink/lib/constants';
import { NavBar, Button, Modal } from 'antd-mobile';
import Utils from '@tronlink/lib/utils';
import './TronBankController.scss';

class BankController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            popoverVisible: false,
            rentModalVisible: false,
            rentConfirmVisible: true,
            recipient: {
                value: '',
                valid: true,
                error: false
            },
            rentNum: {
                value: '',
                valid: false,
                error: false
            },
            rentDay: {
                value: '',
                valid: false,
                error: false,
                maxError: false
            },
            rentNumMin: 100,
            rentNumMax: 1000,
            rentDayMin: 3,
            rentDayMax: 30,
            rentUnit: {
                num: 10,
                day: 1,
                cost: 0.5
            },
            loading: false
        };
    }

    componentDidMount() { // data by props
        // const { selectedToken, selected } = this.props.accounts;
        // selectedToken.amount = selectedToken.id === '_' ? selected.balance / Math.pow(10, 6) : selectedToken.amount;
        // this.setState({ selectedToken });
        // console.log(selectedToken, selected);
    }

    onRecipientChange(e, _type) {
        //reacipientchange  judge account isvalid by _type
        const address = e.target.value;
        const recipient = {
            value: address,
            valid: VALIDATION_STATE.NONE,
            error: VALIDATION_STATE.NONE
        };

        if(!address.length) {
            recipient.valid = true;
            recipient.error = false;
            return this.setState({ recipient });
        }
        if(!TronWeb.isAddress(address)) {
            recipient.valid = false;
            if(_type == 2) recipient.error = true; else recipient.error = false;
        }
        else {
            recipient.valid = true;
            recipient.error = false;
        }
        this.setState({
            recipient
        });
    }

    handlerRentNumChange(e, _type) {
        // rent num change  _type 1chage 2blur
        const { rentNumMin, rentNumMax } = this.state;
        const rentVal = e.target.value;
        const rentNum = {
            value: rentVal,
            valid: VALIDATION_STATE.NONE,
            error: VALIDATION_STATE.NONE
        };
        if(!rentVal.length)
            return this.setState({ rentNum });

        if(Utils.validatInteger(rentVal) && rentVal < rentNumMax && rentVal > rentNumMin) {
            rentNum.valid = true;
            rentNum.error = false;
        } else {
            rentNum.valid = false;
            if(_type == 2) rentNum.error = true; else rentNum.error = false;
        }
        this.setState({
            rentNum
        });
    }

    handlerRentDayChange(e, _type) {
        // handler day change _type 1chage 2blur
        const { rentDayMin, rentDayMax } = this.state;
        const rentVal = e.target.value;
        const rentDay = {
            value: rentVal,
            valid: VALIDATION_STATE.NONE,
            error: VALIDATION_STATE.NONE
        };
        if(!rentVal.length)
            return this.setState({ rentDay });

        if(!Utils.validatInteger(rentVal)) {
            rentDay.value = rentDayMin;
            rentDay.valid = false;
            rentDay.error = true;
            rentDay.maxError = false;
            this.setState({
                rentDay
            });
            return;
        }

        if(rentVal <= rentDayMax && rentVal >= rentDayMin) {
            rentDay.valid = true;
            rentDay.error = false;
        } else {
            rentDay.valid = false;
            if(_type == 2) {
                if(rentVal < rentDayMin ) {
                    rentDay.value = rentDayMin;
                    rentDay.valid = false;
                    rentDay.error = true;
                    rentDay.maxError = false;
                }
                if(rentVal > rentDayMax) {
                    rentDay.valid = false;
                    rentDay.error = false;
                    rentDay.maxError = true;
                    rentDay.value = rentDayMax;
                }
            }else {
                rentDay.error = false;
                rentDay.maxError = false;
            }
        }
        this.setState({
            rentDay
        });
    }

    handlerRentDayFun(_type) {
        // _type 1reduce 2add
        const { rentDayMin, rentDayMax } = this.state;
        let rentVal = Number(this.state.rentDay.value);
        const rentDay = {
            value: '',
            valid: VALIDATION_STATE.NONE,
            error: VALIDATION_STATE.NONE,
            maxError: VALIDATION_STATE.NONE
        };

        if(!Utils.validatInteger(rentVal)) {
            rentDay.value = rentDayMin;
            rentDay.valid = false;
            rentDay.error = true;
            rentDay.maxError = false;
            this.setState({
                rentDay
            });
            return;
        }
        if(_type == 1) {
            if(rentVal <= rentDayMin ) {
                rentDay.value = rentDayMin;
                rentDay.valid = false;
                rentDay.error = true;
                rentDay.maxError = false;
            }else {
                if(rentVal > rentDayMax) {
                    rentDay.valid = false;
                    rentDay.error = false;
                    rentDay.maxError = true;
                    rentDay.value = rentDayMax;
                }else{
                    rentVal -= 1;
                    rentDay.value = rentVal;
                    rentDay.valid = true;
                    rentDay.error = false;
                    rentDay.maxError = false;
                }
            }
        }
        else {
            if(rentVal >= rentDayMax ) {
                rentDay.value = rentDayMax;
                rentDay.valid = false;
                rentDay.maxError = true;
            }else {
                rentVal += 1;
                rentDay.value = rentVal;
                rentDay.valid = true;
                rentDay.maxError = false;
            }
            rentDay.error = false;
        }
        console.log(`当前值${rentVal}type${_type}`);
        this.setState({
            rentDay
        });
    }

    onModalClose = key => () => {
        this.setState({
            [ key ]: false,
        });
    };

    render() {
        const { accounts, selected } = this.props.accounts;
        const { formatMessage } = this.props.intl;
        const { recipient, rentNum, rentDay, rentNumMin, rentDayMin, rentDayMax, rentUnit } = this.state;
        const myImg = src => { return require(`../../assets/images/new/tronBank/${src}.svg`); };
        return (
            <div className='TronBankContainer'>
                <NavBar
                    className='navbar'
                    mode='light'
                    icon={<div className='commonBack'></div>}
                    onLeftClick={() => PopupAPI.changeState(APP_STATE.READY)}
                    rightContent={<img onClick={() => { console.log(this.state.popoverVisible);this.setState({ popoverVisible: !this.state.popoverVisible }); }} className='rightMore' src={myImg('more')} alt={'more'}/>}
                >TronBank
                </NavBar>
                {/* navModal */}
                <div className='navBarMoreMenu' onClick={(e) => { e.stopPropagation();this.setState({ popoverVisible: !this.state.popoverVisible }); } }>
                    <div className={ this.state.popoverVisible ? 'dropList menuList menuVisible' : 'dropList menuList'}>
                        <div onClick={ () => { PopupAPI.changeState(APP_STATE.TRONBANK_RECORD); } } className='item'>
                            <img onClick={() => { this.setState({ popoverVisible: true }); }} className='rightMoreIcon' src={myImg('record')} alt={'record'}/>
                            <FormattedMessage id='BANK.RENTNUMMODAL.RECORD' />
                        </div>
                        <div onClick={(e) => { console.log('TODO'); }} className='item'>
                            <img onClick={() => { this.setState({ popoverVisible: true }); }} className='rightMoreIcon' src={myImg('help')} alt={'help'}/>
                            <FormattedMessage id='BANK.RENTNUMMODAL.HELP' />
                        </div>
                    </div>
                </div>
                <div className='bankContent'>
                    {/* account pay,receive */}
                    <div className='accountContent'>
                        <section className='accountInfo infoSec'>
                            <label><FormattedMessage id='ACCOUNT.SEND.PAY_ACCOUNT'/></label>
                            <div className='selectedAccount'>
                                <FormattedMessage id='BANK.INDEX.ACCOUNT'/>一<span>{ selected.address }</span>
                            </div>
                            <div className='balance'>
                                <FormattedMessage id='BANK.INDEX.BALANCE' values={{ amount: selected.balance / Math.pow(10, 6) }}/>
                            </div>
                        </section>
                        <section className='infoSec'>
                            <label><FormattedMessage id='ACCOUNT.SEND.RECEIVE_ADDRESS'/></label>
                            <div className={recipient.error ? 'receiveAccount errorBorder' : 'receiveAccount normalBorder'}>
                                <input onChange={(e) => { this.onRecipientChange(e, 1); } } onBlur={(e) => this.onRecipientChange(e, 2)} placeholder={ formatMessage({ id: 'BANK.INDEX.PLACEHOLDER', values: { min: rentNumMin } })}/>
                            </div>
                            {recipient.error ? <div className='errorMsg'><FormattedMessage id='BANK.INDEX.RECEIVEERROR'/></div> : null}
                            <div className='balance'>
                                <FormattedMessage id='BANK.INDEX.USED' values={{ num: accounts[ selected.address ].energy - accounts[ selected.address ].energyUsed }} />/<FormattedMessage id='BANK.INDEX.TOTAL' values={{ total: accounts[ selected.address ].energy }}/>
                            </div>
                        </section>
                    </div>
                    {/* rent num,day */}
                    <div className='rentContent'>
                        <section className='infoSec'>
                            <label><FormattedMessage id='BANK.INDEX.RENTNUM'/><img onClick={() => { this.setState({ rentModalVisible: true }); }} className='rentNumEntrance' src={myImg('question')} alt={'question'}/></label>
                            <div className={rentNum.error ? 'rentNumWrapper errorBorder' : 'rentNumWrapper normalBorder'}>
                                <input value={ rentNum.value } onChange={ (e) => { this.handlerRentNumChange(e, 1); }} onBlur={ (e) => this.handlerRentNumChange(e, 2)} className='commonInput rentNumInput' placeholder={ formatMessage({ id: 'BANK.INDEX.FREEZEPLACEHOLDER' })} /><span>TRX</span>
                            </div>
                            { rentNum.error ? <div className='errorMsg'><FormattedMessage id='BANK.INDEX.RENTNUMERROR'/></div> : null}
                        </section>
                        <section className='infoSec singlgeSty'>
                            <label><FormattedMessage id='BANK.INDEX.RENTDAY'/></label>
                            <div className='dayRange'>
                                <span onClick={ (e) => this.handlerRentDayFun(1)}><Button className='operatingBtn' icon={<img className='operationReduceIcon' src={myImg('subtrac')} alt='subtrac' />} inline size='small'></Button></span>
                                <input value={rentDay.value} onChange={ (e) => { this.handlerRentDayChange(e, 1); }} onBlur={ (e) => { this.handlerRentDayChange(e, 2); }} className='commonInput rentDay' placeholder={ formatMessage({ id: 'BANK.INDEX.RENTPLACEHOLDER' })} type='text' />
                                <span onClick={ (e) => this.handlerRentDayFun(2)}><Button className='operatingBtn' icon={<img className='operationAddIcon' src={myImg('add')} alt='add' />} inline size='small'></Button></span>
                            </div>
                            { rentDay.error ? <div className='errorMsg'><FormattedMessage id='BANK.INDEX.RENTDAYERROR' values={{ min: rentDayMin }}/></div> : null}
                            { rentDay.maxError ? <div className='errorMsg'><FormattedMessage id='BANK.INDEX.RENTDAYMAXERROR' values={{ max: rentDayMax }}/></div> : null}
                        </section>
                        <section className='rentIntroduce'>
                            <FormattedMessage id='BANK.INDEX.RENTINTRODUCE' values={{ ...rentUnit }} />
                        </section>
                    </div>
                    {/* tronBank subbtn */}
                    <Button disabled={recipient.valid && rentNum.valid && rentDay.valid ? false : true }
                        className={recipient.valid && rentNum.valid && rentDay.valid ? 'bankSubmit normalValid' : 'bankSubmit inValid'}
                    >
                        <FormattedMessage id='BANK.INDEX.BUTTON'/>
                    </Button>
                </div>
                {/*rentNum modal */}
                <Modal
                    className='modalContent'
                    wrapClassName='modalWrap'
                    visible={this.state.rentModalVisible}
                    transparent
                    maskClosable={false}
                    onClose={this.onModalClose('rentModalVisible')}
                    title={ formatMessage({ id: 'BANK.RENTNUMMODAL.TITLE' })}
                    afterClose={() => { console.log('afterClose'); }}
                >
                    <div className='rentIntroduceCont'>
                        <section className='modalRentContent'>
                            <FormattedMessage id='BANK.RENTNUMMODAL.CONTENT'/>
                        </section>
                        <Button className='modalCloseBtn' onClick={() => { this.onModalClose('rentModalVisible')(); }} size='small'><FormattedMessage id='BANK.RENTNUMMODAL.BUTTON'/></Button>
                    </div>
                </Modal>
                <Modal
                    className='modalContent'
                    wrapClassName='modalConfirmWrap'
                    visible={this.state.rentConfirmVisible}
                    transparent
                    maskClosable={false}
                    onClose={this.onModalClose('rentConfirmVisible')}
                    title={ formatMessage({ id: 'BANK.RENTINFO.CONFIRM' })}
                    afterClose={() => { console.log('afterClose'); }}
                >
                    <div className='rentIntroduceCont'>
                        <section className='modalRentContent'>
                        </section>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default injectIntl(BankController);
