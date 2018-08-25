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
            case 'TransferAssetContract':
                if(this.props.isMine)
                    return <Icons.TopRightArrow className="iconSent" />;

            return <Icons.TopRightArrow className="iconReceived" />;

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
                return <Icons.SmartContractIcon className='iconSmartContract' />;

            default:
                return null;
        }
	}

	renderLabel() {
        switch(this.props.txType) {
            case 'TransferContract':
            case 'TransferAssetContract':
                if(this.props.isMine)
                    return <div className="txLabel red"><FormattedMessage id='words.sent' /></div>;
                
            return <div className="txLabel green"><FormattedMessage id='words.received' /></div>;        
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
                return <div className='txLabel' style={{ marginBottom: 0 }}><FormattedMessage id='account.transactions.deployContract' /></div>;

            default:
                return null;
        }
	}

	renderAddress() {
        switch(this.props.txType) {
            case 'TransferContract':
                if(this.props.isMine)
                    return this.props.toAddress;

                return this.props.ownerAddress;

            case 'CreateSmartContract':
                return null;

            default:
                return 'Unknown address';
        }
	}

	renderAmount() {
        if(!this.props.amount)
            return null;

        const isMine = this.props.isMine;
        const amount = Utils.sunToTron(this.props.amount).toString();

        return (
            <div className={ 'txAmount ' + (isMine ? 'red' : 'green') }>
                { isMine ? '- ' : '+ ' }
                <FormattedNumber value={ amount } minimumFractionDigits={ 0 } maximumFractionDigits={ 8 } /> 
                <span class='margin-left'>TRX</span>
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
