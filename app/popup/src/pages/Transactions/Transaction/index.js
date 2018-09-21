import React, { Component } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import * as Icons from 'components/Icons';
import Utils from 'extension/utils.js';

import './Transaction.css';

class Transaction extends Component {
	formattedDate() {
        const date = new Date(this.props.date);
        
		return date.toLocaleDateString('en-us', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	renderIcon() {
        switch(this.props.txType) {
            case 'TransferContract':
                return <Icons.TopRightArrow className={ this.props.isMine ? 'iconSent' : 'iconReceived' } />;

            case 'TransferAssetContract':
                return <Icons.TokensIcon className={ this.props.isMine ? 'iconSent' : 'iconReceived' } />;

            case 'ParticipateAssetIssueContract':            
                return <Icons.TokensIcon className="iconToken" />;

            case 'VoteWitnessContract':
                return <Icons.VoteIcon className="iconToken" />;

            case 'AssetIssueContract':
                return <Icons.PencilIcon className="iconToken" />;

            case 'FreezeBalanceContract':
            case 'UnfreezeBalanceContract':
                return <Icons.SnowIcon className="iconFreeze" />;

            case 'CreateSmartContract':
                return <Icons.SmartContractIcon className='smartContract' />;

            case 'TriggerSmartContract':
                return <Icons.TriggerSmartContractIcon className='smartContract triggerSmartContract' />;

            default:
                return null;
        }
	}

	renderLabel() {
        switch(this.props.txType) {
            case 'TransferContract':            
                if(this.props.isMine)
                    return <div className="txLabel red"><FormattedMessage id='words.sent' /></div>;

            return <div className="txLabel green"><FormattedMessage id='words.received' /></div>;   

            case 'TransferAssetContract':            
                if(this.props.isMine)
                    return <div className="txLabel red"><FormattedMessage id='words.sentToken' /></div>;

            return <div className="txLabel green"><FormattedMessage id='words.receivedToken' /></div>;      

            case 'ParticipateAssetIssueContract':
                return <div className="txLabel"><FormattedMessage id='words.token' /></div>;

            case 'VoteWitnessContract':
                return <div className="txLabel"><FormattedMessage id='words.vote' /></div>;

            case 'AssetIssueContract':
                return <div className="txLabel"><FormattedMessage id='account.transactions.tokenCreation' /></div>;

            case 'FreezeBalanceContract':
                return <div className="txLabel red"><FormattedMessage id='words.frozen' /></div>;

            case 'UnfreezeBalanceContract':
                return <div className="txLabel green"><FormattedMessage id='words.unfrozen' /></div>;

            case 'CreateSmartContract':
                return <div className='txLabel smartContract'><FormattedMessage id='account.transactions.deployContract' /></div>;

            case 'TriggerSmartContract':
                return <div className='txLabel smartContract triggerSmartContract'><FormattedMessage id='account.transactions.triggerContract' /></div>;

            default:
                return null;
        }
	}

	renderAddress() {
        switch(this.props.txType) {
            case 'TransferContract':
            case 'TransferAssetContract':
                if(this.props.isMine)
                    return this.props.toAddress;

                return this.props.ownerAddress;

            case 'CreateSmartContract':
                return Utils.transformAddress(
                    this.props.contractAddress
                );

            case 'TriggerSmartContract': {
                return Utils.transformAddress(
                    this.props.contract_address
                );
            }

            case 'AssetIssueContract':
                return Utils.hexToString(
                    this.props.raw.parameter.value.name
                );

            default:
                return 'Unknown address';
        }
	}

	renderAmount() {
        if(this.props.txType === 'AssetIssueContract') {
            return (
                <div className={ 'txAmount red' }>
                    - <FormattedNumber value={ 1024 } />
                    <span class='margin-left'>TRX</span>
                </div>
            );
        }

        if(!this.props.amount)
            return null;

        const { 
            raw,
            isMine, 
            amount 
        } = this.props;

        if(this.props.txType == 'TransferContract') {
            return (
                <div className={ 'txAmount ' + (isMine ? 'red' : 'green') }>
                    { isMine ? '- ' : '+ ' }
                    <FormattedNumber value={ Utils.sunToTron(amount) } minimumFractionDigits={ 0 } maximumFractionDigits={ 8 } /> 
                    <span class='margin-left'>TRX</span>
                </div>
            );
        }

        return (
            <div className={ 'txAmount ' + (isMine ? 'red' : 'green') }>
                { isMine ? '- ' : '+ ' }
                <FormattedNumber value={ amount } maximumFractionDigits={ 0 } /> 
                <span class='margin-left'>
                    { Utils.hexToString(raw.parameter.value.asset_name) }
                </span>
            </div>
        );
	}

	render() {
		return (
			<div className="transaction">
                { this.renderIcon() }
                
				<div className="txInfoLeft">
                    { this.renderLabel() }

                    <div className="txAddress">
                        { this.renderAddress() }
                    </div>
				</div>

				<div className="txInfoRight">
                    { this.renderAmount() }
                    
                    <div className="txDate">
                        { this.formattedDate() }
                    </div>
				</div>
			</div>
		);
	}
}

export default Transaction;
