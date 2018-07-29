import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import './Give.css';

class Give extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    render() {
        return (
            <div className="give">
                <div className="giveContainer">
                    <div className="giveHeader">TestNet Funding :</div>
                    <div className="giveSubHeader">Sends 20,000 TRX to your currently selected wallet address.</div>
                    <div className="giveSubHeader">Address: { this.props.account.address }</div>
                </div>
                <div className="giveBtn button black">Fund Account</div>
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account
}))(Give);