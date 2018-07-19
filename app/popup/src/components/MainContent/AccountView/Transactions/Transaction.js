import React, { Component } from 'react';
import './Transaction.css';

import { TopRightArrow, TokensIcon, SnowIcon, PencilIcon, VoteIcon } from "../../../../Icons";

class Transaction extends Component {

    formattedDate() {
        const date = new Date(this.props.date);
        return date.toLocaleDateString("en-us", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    chooseIcon() {
        if (this.props.txType === "TransferContract" || this.props.txType === "TransferAssetContract") {
            if (this.props.type === 2) {
                return (
                    <TopRightArrow className="iconReceived" />
                );
            }
            return (
                <TopRightArrow className="iconSent" />
            );
        }
        if (this.props.txType === "ParticipateAssetIssueContract") {
            return (
                <TokensIcon className="iconToken" />
            );
        }
        if (this.props.txType === "FreezeBalanceContract" || this.props.txType === "UnfreezeBalanceContract") {
            return (
                <SnowIcon className="iconFreeze" />
            );
        }
        if (this.props.txType === "AssetIssueContract") {
            return (
                <PencilIcon className="iconToken" />
            );
        }
        if (this.props.txType === "VoteWitnessContract") {
            return (
                <VoteIcon className="iconToken" />
            );
        }
    }

    chooseLabel() {
        if (this.props.txType === "TransferContract" || this.props.txType === "TransferAssetContract") {
            if (this.props.type === 2) {
                return (
                    <div className="txLabel">Received</div>
                );
            }
            return (
                <div className="txLabel">Sent</div>
            );
        }
        if (this.props.txType === "ParticipateAssetIssueContract") {
            return (
                <div className="txLabel">Token</div>
            );
        }
        if (this.props.txType === "FreezeBalanceContract" || this.props.txType === "UnfreezeBalanceContract") {
            return (
                <div className="txLabel">Frozen</div>
            );
        }
        if (this.props.txType === "AssetIssueContract") {
            return (
                <div className="txLabel">Token Creation</div>
            );
        }
        if (this.props.txType === "VoteWitnessContract") {
            return (
                <div className="txLabel">Vote</div>
            );
        }
    }

    successCheck() {
        // Failed, Success, Rejected
        if (true) return;
    }

    copyButton() {
        if (true) {
            return <div className="copyButton btn">Copy</div>;
        }
    }

    render() {
        return (
            <div className="transaction">
                { this.chooseIcon() }
                <div className="txInfoLeft">
                    { this.chooseLabel() }
                    <div className="txAddress">{ this.props.address }</div>
                </div>
                <div className="txInfoRight">
                    <div className="txAmount">{ this.props.amount }<span>{ this.props.label }</span></div>
                    <div className="txDate">{ this.formattedDate() }</div>
                </div>
                { this.copyButton() }
            </div>
        );
    }
}

export default Transaction;
