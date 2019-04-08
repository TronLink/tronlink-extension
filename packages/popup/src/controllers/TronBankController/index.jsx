/*
 * @Author: lxm
 * @Date: 2019-03-19 15:18:05
 * @Last Modified by: lxm
 * @Last Modified time: 2019-04-08 15:33:39
 * TronBankPage
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import TronWeb from 'tronweb';
import { BANK_STATE, APP_STATE } from '@tronlink/lib/constants';
import { NavBar, Button, Modal, Toast } from 'antd-mobile';
import Utils from '@tronlink/lib/utils';
import './TronBankController.scss';
class BankController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            popoverVisible: false, //modal show data
            rentModalVisible: false,
            rentConfirmVisible: false,
            recipient: {
                value: '',
                valid: true,
                error: false
            },
            rentNum: {
                value: '',
                predictVal: '',
                predictStatus: false,
                valid: false,
                formatError: false,
                error: false
            },
            rentDay: {
                value: 7,
                valid: true,
                error: false,
                formatError: false
            },
            rentNumMin: 10, // default data
            rentNumMax: 1000,
            rentDayMin: 3,
            rentDayMax: 30,
            defaultUnit: {
                num: 10,
                day: 1,
                cost: 0.5,
                totalEnergyWeight: 999
            },
            rentUnit: { //caclulate data
                ratio: 0,
                cost: 0.5
            },
            accountMaxBalance: {
                value: '',
                valid: false
            },
            curentInputBalance: {
                used: 0,
                total: 0,
                show: true
            },
            validOrderOverLimit: {
                valid: true
            },
            isOnlineAddress: {
                error: false
            },
            currentEnv: 'test'
        };
        this.handlerInfoConfirm = this.handlerInfoConfirm.bind(this);
    }

    componentDidMount() {
        // data by props
        this.defaultDataFun();
        this.getDetaultRatioFun();
    }

    async defaultDataFun() {
        const env = this.state.currentEnv;
        const requestUrl = `${Utils.requestUrl(env)}/api/bank/default_data`;
        const defaultData = await PopupAPI.getBankDefaultData(requestUrl);
        // current account balance
        const { accounts, selected } = this.props.accounts;
        const totalEnergy = accounts[ selected.address ].energy;
        const usedEnergy = accounts[ selected.address ].energyUsed;
        const curentInputBalance = {
            used: usedEnergy,
            total: totalEnergy,
            show: true
        };
        this.setState({
            rentNumMin: defaultData.rental_amount_min / Math.pow(10, 6),
            rentNumMax: defaultData.rental_amount_max / Math.pow(10, 6),
            rentDayMin: defaultData.rental_days_min,
            rentDayMax: defaultData.rental_days_max,
            defaultUnit: {
                num: defaultData.energy / 10000,
                day: defaultData.days,
                cost: defaultData.pay_amount / Math.pow(10, 6),
                totalEnergyWeight: 999
            },
            curentInputBalance
        });
    }

    async getDetaultRatioFun() {
        // get default ratio
        const ratio = await PopupAPI.getDetaultRatioFun();
        const rentUnit = {
            ratio: 1 / ratio,
        };
        this.setState({
            rentUnit
        });
    }

    calculateRentCost() {
        // calculate bank rent cost
        const { rentNum, rentDay } = this.state;
        const ratio = this.state.rentUnit.ratio;
        const rentUnit = {
            ratio,
            cost: (rentNum.value * rentDay.value * ratio).toFixed(1)
        };
        this.setState({
            rentUnit
        });
    }

    onRecipientChange(e, _type) {
        //reacipientchange  judge account isvalid by _type
        const address = e.target.value;
        const recipient = {
            value: address,
            valid: BANK_STATE.INVALID,
            error: BANK_STATE.INVALID
        };
        const validOrderOverLimit = {
            valid: BANK_STATE.VALID
        };
        const isOnlineAddress = {
            error: BANK_STATE.INVALID
        };
        const curentInputBalance = {
            used: '',
            total: '',
            show: true
        };
        if(!address.length) {
            if(_type === 2) {
                this.isValidRentAddress();
                this.calculateRentCost();
            }
            return;
        }
        if(!TronWeb.isAddress(address)) {
            recipient.valid = false;
            validOrderOverLimit.valid = true;
            isOnlineAddress.error = false;
            curentInputBalance.show = false;
            if(_type === 2) {
                recipient.error = true;
            } else recipient.error = false;
            this.setState({
                recipient,
                validOrderOverLimit,
                isOnlineAddress,
                curentInputBalance
            }, () => {
                this.calculateRentCost();
            });
        }
        else {
            if(_type === 2) this.isValidRentAddress();
            this.calculateRentCost();
        }
    }

    async isValidRentAddress() {
        // valid order num > 3
        const curaAddress = this.rentAddressInput.value;
        const env = this.state.currentEnv;
        let address;
        const { selected } = this.props.accounts;
        const selectedaAddress = selected.address;
        if(curaAddress === '') address = selectedaAddress; else address = curaAddress;
        const requestUrl = `${Utils.requestUrl(env)}/api/bank/is_rent`;
        const isRentDetail = await PopupAPI.isValidOrderAddress(address, requestUrl);
        const recipient = {
            value: address,
            error: BANK_STATE.INVALID,
            valid: BANK_STATE.INVALID
        };
        const validOrderOverLimit = {
            valid: isRentDetail.isRent
        };
        const isOnlineAddress = {
            error: BANK_STATE.INVALID
        };
        const curentInputBalance = {
            used: 0,
            total: 0,
            show: true
        };
        // isRent => yes judge online address  => no tips
        if(isRentDetail.isRent) {
            const result = await PopupAPI.isValidOnlineAddress(address);
            if(typeof(result) == 'undefined') {
                isOnlineAddress.error = true;
                curentInputBalance.show = false;
                recipient.error = false;
                recipient.valid = false;
            }else {
                let energyUsed = result.EnergyUsed;
                let energyLimit = result.EnergyLimit;
                if(typeof(energyUsed) == 'undefined') energyUsed = 0;
                if(typeof(energyLimit) == 'undefined') energyLimit = 0;
                isOnlineAddress.error = false;
                recipient.error = false;
                recipient.valid = true;
                curentInputBalance.show = true;
                curentInputBalance.used = energyUsed;
                curentInputBalance.total = energyLimit;
            }
        }else {
            recipient.valid = false;
            curentInputBalance.show = false;
        }
        this.setState({ isOnlineAddress, recipient, validOrderOverLimit, curentInputBalance });
    }

    async handlerRentNumChange(e, _type) {
        // rent num change  _type 1chage 2blur
        const { rentNumMin, rentNumMax, defaultUnit, currentEnv } = this.state;
        const rentVal = e.target.value;
        const rentNum = {
            value: rentVal,
            predictVal: '',
            predictStatus: BANK_STATE.INVALID,
            valid: BANK_STATE.INVALID,
            error: BANK_STATE.INVALID,
            formatError: BANK_STATE.INVALID
        };
        if(!rentVal.length)
            return this.setState({ rentNum });
        if(!Utils.validatInteger(rentVal)) {
            if(_type === 2) {
                rentNum.formatError = true;
                rentNum.error = false;
            }
        }else{
            const { selected } = this.props.accounts;
            const totalEnergyWeight = selected.totalEnergyWeight;
            const totalenergyLimitNum = selected.TotalEnergyLimit;
            // predict num energy
            if(Number.isFinite(totalEnergyWeight)) rentNum.predictVal = Math.ceil(rentVal / totalEnergyWeight * totalenergyLimitNum);else rentNum.predictVal = 0;
            const accountMaxBalance = {
                value: defaultUnit.totalEnergyWeight,
                valid: BANK_STATE.INVALID
            };
            if(rentVal <= rentNumMax && rentVal >= rentNumMin) {
                if(_type === 2) {
                    rentNum.formatError = false;
                    rentNum.error = false;
                    Toast.loading();
                    const requestUrl = `${Utils.requestUrl(currentEnv)}/api/bank/balance_enough`;
                    const curaAddress = this.rentAddressInput.value;
                    let address;
                    const selectedaAddress = selected.address;
                    if(curaAddress === '') address = selectedaAddress; else address = curaAddress;
                    const isValid = await PopupAPI.isValidOverTotal(address, rentVal * Math.pow(10, 6), requestUrl);
                    // overtake company account num isValid 1 => valid 0 => invalid
                    if(isValid === 1) {
                        accountMaxBalance.valid = true;
                        rentNum.valid = false;
                        rentNum.predictStatus = false;
                    }else{
                        rentNum.valid = true;
                        accountMaxBalance.valid = false;
                        rentNum.predictStatus = true;
                    }
                    this.isValidRentAddress();
                    this.setState({ accountMaxBalance });
                    Toast.hide();
                }
                this.setState({
                    rentNum
                }, () => {
                    this.calculateRentCost();
                });
            } else {
                rentNum.valid = false;
                rentNum.predictStatus = false;
                accountMaxBalance.valid = false;
                this.setState({ accountMaxBalance });
                if(_type === 2) {
                    rentNum.error = true;
                    rentNum.formatError = false;
                }
                else {
                    rentNum.error = false;
                    rentNum.formatError = false;
                }
            }
        }
        this.setState({
            rentNum
        }, () => {
            this.calculateRentCost();
        });
    }

    handlerRentDayChange(e, _type) {
        // handler day change _type 1chage 2blur
        const { rentDayMin, rentDayMax } = this.state;
        const rentVal = e.target.value;
        const rentDay = {
            value: rentVal,
            valid: BANK_STATE.VALID,
            error: BANK_STATE.INVALID
        };
        if(!rentVal.length)
            return this.setState({ rentDay });
        if(!Utils.validatInteger(rentVal)) {
            rentDay.valid = false;
            rentDay.error = false;
            if(_type === 2) {
                rentDay.formatError = true;
                rentDay.value = '';
            }
            this.setState({
                rentDay
            });
            return;
        }

        if(rentVal <= rentDayMax && rentVal >= rentDayMin) {
            if(_type === 2) {
                rentDay.valid = true;
                this.setState({
                    rentDay
                }, () => {
                    this.calculateRentCost();
                    this.isValidRentAddress();
                });
            }
            rentDay.error = false;
            rentDay.formatError = false;
        } else {
            rentDay.valid = false;
            if(_type === 2) {
                if(rentVal < rentDayMin ) {
                    rentDay.value = rentDayMin;
                    rentDay.error = true;
                    rentDay.formatError = false;
                }
                if(rentVal > rentDayMax) {
                    rentDay.value = rentDayMax;
                    rentDay.error = true;
                    rentDay.formatError = false;
                }
            }else {
                rentDay.error = false;
                rentDay.formatError = false;
            }
        }
        this.setState({
            rentDay
        }, () => {
            this.calculateRentCost();
        });
    }

    handlerRentDayFun(_type) {
        // _type 1reduce 2add
        const { rentDayMin, rentDayMax } = this.state;
        let rentVal = this.rentDayInput.value;
        const rentDay = {
            value: '',
            valid: BANK_STATE.VALID,
            error: BANK_STATE.INVALID,
            formatError: BANK_STATE.INVALID
        };
        console.log(`当前rentVal为${rentVal},${rentVal === ''}`);
        if(rentVal === '')return;

        if(!Utils.validatInteger(rentVal)) {
            rentDay.value = rentDayMin;
            rentDay.valid = false;
            rentDay.error = false;
            rentDay.formatError = true;
            this.setState({
                rentDay
            });
            return;
        }
        rentVal = Number(rentVal); // valid number
        rentDay.formatError = false;
        if(_type === 1) {
            rentDay.value = rentVal - 1;
            if(rentVal - 1 < rentDayMin ) {
                if(rentVal === 1) rentDay.value = 1;
                rentDay.valid = false;
                rentDay.error = true;
            }else {
                if(rentVal - 1 > rentDayMax) {
                    rentDay.valid = false;
                    rentDay.error = true;
                }else{
                    rentDay.valid = true;
                    rentDay.error = false;
                }
            }
        }
        else {
            rentDay.value = rentVal + 1;
            if(rentVal + 1 > rentDayMax ) {
                rentDay.valid = false;
                rentDay.error = true;
            }else {
                if(rentVal + 1 < rentDayMin) {
                    rentDay.valid = false;
                    rentDay.error = true;
                }else{
                    rentDay.valid = true;
                    rentDay.error = false;
                }
            }
        }
        this.setState({
            rentDay
        }, () => {
            this.calculateRentCost();
            this.isValidRentAddress();
        });
    }

    handlerInfoConfirm() {
        // InfoConfirm
        const { formatMessage } = this.props.intl;
        const { selected } = this.props.accounts;
        const currentBalance = selected.balance / Math.pow(10, 6);
        const { rentUnit } = this.state;
        if(rentUnit.cost > currentBalance) {
            Toast.info( formatMessage({ id: 'BANK.RENTINFO.INSUFFICIENT' }), 2);
            return;
        }
        this.setState({
            rentConfirmVisible: true
        });
    }

    rentDealSendFun(e) {
        //send msg  entrustOrder(freezeAmount,payAmount,_days,Addr)  payAmount = freezeAmount*_days*0.1
        const { formatMessage } = this.props.intl;
        const { rentNum, rentDay, recipient, rentUnit } = this.state;
        const { selected } = this.props.accounts;
        const address = selected.address;
        const rentDayValue = Number(rentDay.value);
        const freezeAmount = rentNum.value * Math.pow(10, 6);
        const ratio = rentUnit.ratio;
        const payAmount = freezeAmount * ratio * rentDayValue;
        let recipientAddress;
        if(recipient.value === '') recipientAddress = address; else recipientAddress = recipient.value;
        PopupAPI.rentEnergy(
            freezeAmount,
            payAmount,
            rentDayValue,
            recipientAddress
        ).then(() => {
            Toast.info(formatMessage({ id: 'BANK.RENTINFO.SUCCESS' }), 4);
            this.setState({
                rentConfirmVisible: false,
                recipient: {
                    value: '',
                    valid: true,
                    error: false
                },
                rentNum: {
                    value: '',
                    predictVal: '',
                    predictStatus: false,
                    valid: false,
                    error: false
                },
                rentDay: {
                    value: 7,
                    valid: true,
                    error: false,
                    formatError: false
                },
            });
        }).catch(error => {
            console.log(error);
            Toast.info(JSON.stringify(error.error), 2);
        });
    }

    onModalClose = key => () => {
        this.setState({
            [ key ]: false,
        });
    };

    render() {
        const { formatMessage } = this.props.intl;
        const { selected } = this.props.accounts;
        const { recipient, rentNum, rentDay, rentNumMin, rentNumMax, rentDayMin, rentDayMax, rentUnit, defaultUnit, accountMaxBalance, validOrderOverLimit, isOnlineAddress, curentInputBalance } = this.state;
        let recipientVal;
        if(recipient.value === '') recipientVal = selected.address; else recipientVal = recipient.value;
        const orderList = [
            { id: 'BANK.RENTINFO.PAYADDRESS', user: 1, value: selected.address },
            { id: 'BANK.RENTINFO.RECEIVEADDRESS', user: 1, value: recipientVal },
            { id: 'BANK.RENTINFO.RENTNUM', tip: 1, value: `${rentNum.value}TRX` },
            { id: 'BANK.RENTINFO.RENTDAY', type: 3, value: rentDay.value },
            { id: 'BANK.RENTINFO.PAYNUM', type: 0, value: `${rentUnit.cost}TRX` },
        ];
        const myImg = src => { return require(`../../assets/images/new/tronBank/${src}.svg`); };
        return (
            <div className='TronBankContainer'>
                <NavBar
                    className='navbar'
                    mode='light'
                    icon={<div className='commonBack'></div>}
                    onLeftClick={() => PopupAPI.changeState(APP_STATE.READY)}
                    rightContent={<img onClick={() => { this.setState({ popoverVisible: !this.state.popoverVisible }); }} className='rightMore' src={myImg('more')} alt={'more'}/>}
                >TronLending
                </NavBar>
                {/* navModal */}
                <div className='navBarMoreMenu' onClick={(e) => { e.stopPropagation();this.setState({ popoverVisible: !this.state.popoverVisible }); } }>
                    <div className={ this.state.popoverVisible ? 'dropList menuList menuVisible' : 'dropList menuList'}>
                        <div onClick={ () => { PopupAPI.changeState(APP_STATE.TRONBANK_RECORD); } } className='item'>
                            <img onClick={() => { this.setState({ popoverVisible: true }); }} className='rightMoreIcon' src={myImg('record')} alt={'record'}/>
                            <FormattedMessage id='BANK.RENTNUMMODAL.RECORD' />
                        </div>
                        <div onClick={(e) => { PopupAPI.changeState(APP_STATE.TRONBANK_HELP); }} className='item'>
                            <img onClick={() => { this.setState({ popoverVisible: true }); }} className='rightMoreIcon' src={myImg('help')} alt={'help'}/>
                            <FormattedMessage id='BANK.RENTNUMMODAL.HELP' />
                        </div>
                    </div>
                </div>
                <div className='backContentWrapper'>
                    <div className='bankContent'>
                        {/* account pay,receive */}
                        <div className='accountContent'>
                            <section className='accountInfo infoSec'>
                                <label><FormattedMessage id='ACCOUNT.SEND.PAY_ACCOUNT'/></label>
                                <div className='selectedAccount'>
                                    { selected.name.length > 6 ? selected.name.slice(0, 6) : selected.name } <span>{ selected.address }</span>
                                </div>
                                <div className='balance'>
                                    <FormattedMessage id='BANK.INDEX.BALANCE' values={{ amount: selected.balance / Math.pow(10, 6) }}/>
                                </div>
                            </section>
                            <section className='infoSec'>
                                <label><FormattedMessage id='ACCOUNT.SEND.RECEIVE_ADDRESS'/></label>
                                <div className={recipient.error || !validOrderOverLimit.valid || isOnlineAddress.error ? 'receiveAccount errorBorder' : 'receiveAccount normalBorder'}>
                                    <input ref={ rentAddressInput => this.rentAddressInput = rentAddressInput}
                                        onChange={(e) => { this.onRecipientChange(e, 1); } }
                                        onBlur={(e) => this.onRecipientChange(e, 2)}
                                        placeholder={ formatMessage({ id: 'BANK.INDEX.PLACEHOLDER', values: { min: rentNumMin } })}
                                    />
                                </div>
                                { recipient.error ?
                                    <div className='errorMsg'>
                                        <FormattedMessage id='BANK.INDEX.RECEIVEERROR'/>
                                    </div> : null
                                }
                                { validOrderOverLimit.valid ? null :
                                    <div className='errorMsg'>
                                        <FormattedMessage id='BANK.INDEX.OVERTAKEORDERNUM'/>
                                    </div>
                                }
                                { isOnlineAddress.error ?
                                    <div className='errorMsg'>
                                        <FormattedMessage id='BANK.INDEX.NOTONLINEADDRESS'/>
                                    </div> : null
                                }
                                { curentInputBalance.show ?
                                    <div className='balance'>
                                        <FormattedMessage id='BANK.INDEX.USED' values={{ used: curentInputBalance.used }} />/<FormattedMessage id='BANK.INDEX.TOTAL' values={{ total: curentInputBalance.total }}/>
                                    </div> : null
                                }
                            </section>
                        </div>
                        {/* rent num,day */}
                        <div className='rentContent'>
                            <section className='infoSec'>
                                <label>
                                    <FormattedMessage id='BANK.INDEX.RENTNUM'/>
                                    <img onClick={() => { this.setState({ rentModalVisible: true }); }}
                                        className='rentNumEntrance'
                                        src={myImg('question')}
                                        alt={'question'}
                                    />
                                </label>
                                <div className={rentNum.error || rentNum.formatError || accountMaxBalance.valid ? 'rentNumWrapper errorBorder' : 'rentNumWrapper normalBorder'}>
                                    <input value={ rentNum.value }
                                        onChange={ (e) => { this.handlerRentNumChange(e, 1); }}
                                        onBlur={ (e) => this.handlerRentNumChange(e, 2)}
                                        className='commonInput rentNumInput'
                                        placeholder={ formatMessage({ id: 'BANK.INDEX.FREEZEPLACEHOLDER' }) + `（${rentNumMin}-${rentNumMax}）`}
                                    /><span>TRX</span>
                                </div>
                                { rentNum.formatError ?
                                    <div className='errorMsg'>
                                        <FormattedMessage id='BANK.INDEX.RENTNUMFORMATERROR' values={{ min: rentNumMin, max: rentNumMax }}/>
                                    </div> : null
                                }
                                { rentNum.error ?
                                    <div className='errorMsg'>
                                        <FormattedMessage id='BANK.INDEX.RENTNUMERROR' values={{ min: rentNumMin, max: rentNumMax }}/>
                                    </div> : null
                                }
                                { rentNum.predictStatus ?
                                    <div className='predictMsg'>
                                        <FormattedMessage id='BANK.INDEX.FORECASTNUM' values={{ num: rentNum.predictVal }}/>
                                    </div> : null
                                }
                                { accountMaxBalance.valid ?
                                    <div className='errorMsg'>
                                        <FormattedMessage id='BANK.INDEX.OVERTAKEMAXNUM' />
                                    </div> : null
                                }
                            </section>
                            <section className='infoSec singlgeSty'>
                                <label><FormattedMessage id='BANK.INDEX.RENTDAY'/></label>
                                <div className={rentDay.error || rentDay.formatError ? 'dayRange errorBorder' : 'dayRange normalBorder'}>
                                    <span className={rentDay.error || rentDay.formatError ? 'errorRightBorder' : 'norderRightBorder'} onClick={ (e) => this.handlerRentDayFun(1)}>
                                        <Button className='operatingBtn'
                                            icon={<img className='operationReduceIcon' src={myImg('subtrac')} alt='subtrac' />}
                                            inline
                                            size='small'
                                        >
                                        </Button>
                                    </span>
                                    <input value={rentDay.value}
                                        ref={rentDayInput => this.rentDayInput = rentDayInput}
                                        onChange={ (e) => { this.handlerRentDayChange(e, 1); }}
                                        onBlur={ (e) => { this.handlerRentDayChange(e, 2); }}
                                        className='commonInput rentDay'
                                        placeholder={ formatMessage({ id: 'BANK.INDEX.RENTPLACEHOLDER' }) + `(${rentDayMin}-${rentDayMax})`} type='text'
                                    />
                                    <span className={rentDay.error || rentDay.formatError ? 'errorLeftBorder' : 'norderLeftBorder'} onClick={ (e) => this.handlerRentDayFun(2)}>
                                        <Button className='operatingBtn' icon={<img className='operationAddIcon' src={myImg('add')} alt='add' />} inline size='small'>
                                        </Button>
                                    </span>
                                </div>
                                { rentDay.error ?
                                    <div className='errorMsg rentError'>
                                        <FormattedMessage id='BANK.INDEX.RENTDAYERROR' values={{ min: rentDayMin, max: rentDayMax }}/>
                                    </div> : null
                                }
                                { rentDay.formatError ?
                                    <div className='errorMsg rentError'>
                                        <FormattedMessage id='BANK.INDEX.RENTDAYFORMATERROR' values={{ min: rentDayMin, max: rentDayMax }}/>
                                    </div> : null
                                }
                            </section>
                            {rentNum.valid && rentDay.valid ?
                                <section className='calculation'>
                                    {rentNum.value}TRX*{rentUnit.ratio}({rentDay.value}<FormattedMessage id='BANK.INDEX.RENTDAYUNIT'/>)<FormattedMessage id='BANK.INDEX.RENTCONST' /> {rentUnit.cost} TRX
                                </section> :
                                <section className='rentIntroduce'>
                                    <FormattedMessage id='BANK.INDEX.RENTINTRODUCE' values={{ ...defaultUnit }} />
                                </section>
                            }
                        </div>
                        {/* tronBank submit */}
                        <Button disabled={recipient.valid && rentNum.valid && rentDay.valid ? false : true }
                            className={recipient.valid && rentNum.valid && rentDay.valid ? 'bankSubmit normalValid' : 'bankSubmit inValid'}
                            onClick = {this.handlerInfoConfirm }
                        >
                            <FormattedMessage id='BANK.INDEX.BUTTON'/>
                        </Button>
                    </div>
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
                    className='modalContent confirmContentModal'
                    wrapClassName='modalConfirmWrap'
                    visible={this.state.rentConfirmVisible}
                    transparent
                    maskClosable={true}
                    onClose={this.onModalClose('rentConfirmVisible')}
                    title={ formatMessage({ id: 'BANK.RENTINFO.CONFIRM' })}
                    afterClose={() => { console.log('afterClose'); }}
                >
                    <div className='rentIntroduceCont'>
                        <section className='modalRentContent confirmRentContent'>
                            <section className='detailContent'>
                                {orderList.map((val, key) => (
                                    <div key={key} className='orderList' >
                                        <span className='orderIntroduce' >
                                            <FormattedMessage id={val.id}/>
                                        </span>
                                        <span className='orderStatus'>
                                            {val.user === 1 ? `${val.value.substr(0, 4)}...${val.value.substr(-12)}` : val.value }
                                            {val.tip === 1 ? <FormattedMessage id='BANK.RENTINFO.TIPS' values={{ num: rentNum.predictVal }} /> : null}
                                            {val.type === 3 ? <FormattedMessage id='BANK.RENTRECORD.TIMEUNIT'/> : null}
                                        </span>
                                    </div>
                                ))}
                            </section>
                        </section>
                        <section className='operateBtn'>
                            <Button className='modalCloseBtn confirmClose' onClick={() => { this.onModalClose('rentConfirmVisible')(); }} ><FormattedMessage id='BANK.RENTINFO.CANCELBTN'/></Button>
                            <Button className='modalPayBtn' onClick={ (e) => { this.rentDealSendFun(e); }}><FormattedMessage id='BANK.RENTINFO.PAYBTN'/></Button>
                        </section>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default injectIntl(BankController);
