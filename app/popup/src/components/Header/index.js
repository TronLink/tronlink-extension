import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { TronIcon } from 'components/Icons';

import './Header.css';

class Header extends Component {
	leftIcon() {
		if (!this.props.leftIconRoute)
			return <div className="navbarIconLeft disabled" />;

		return (
			<NavLink className="navbarIconLeft" to={ this.props.leftIconRoute }>
				{ this.props.leftIconImg }
			</NavLink>
		);  
	}

	rightIcon() {
		if (!this.props.rightIconRoute)
			return <div className="navbarIconRight disabled" />;

		return (
			<NavLink className="navbarIconRight" to={ this.props.rightIconRoute }>
				{ this.props.rightIconImg }
			</NavLink>
		);  
	}

	renderSubLabel() {
		if (this.props.navbarLabel && this.props.navbarLabel.length > 33) {
            const addr = this.props.navbarLabel;
            
			return (
				<div className="navbarHeaderSub address">
					<span>{ this.props.navbarLabel }</span>
				</div>
			);
        }
        
		return (
			<div className="navbarHeaderSub">
				<span>{ this.props.navbarLabel }</span>
			</div>
		);
	}

	render() {
		return (
			<div className="header">
				<div className="navbarContainer">
					{ this.leftIcon() }

					<div className="navbarHeader">
						<div className="navbarHeaderMain">
							<span>{ this.props.navbarTitle }</span>
						</div>

                        { this.renderSubLabel() }
                        
						<TronIcon />
					</div>

					{ this.rightIcon() }
				</div>
				<div className='nav'>
					<NavLink className="navTab" to={ '/main/accounts' }>
						Accounts
					</NavLink>
					<NavLink className="navTab" to={ '/main/transactions' }>
						Transactions
					</NavLink>
					<NavLink className="navTab" to={ '/main/tokens' }>
						Tokens
					</NavLink>
					<NavLink className="navTab" to={ '/main/send' }>
						Send
					</NavLink>
				</div>
			</div>
		);
	}
}

export default Header;
