import React from 'react';

import './Button.css';
import './styles/primary.css';
import './styles/secondary.css';
import './styles/black.css';

export default class Button extends React.Component {
    validateClick() {
        return !this.props.loading && !this.props.disabled && this.props.onClick;
    }

    render() {
        const { 
            height = '45px', 
            width = '100%',
            type = 'primary', 
            disabled = false, 
            loading = false, 
            onClick = false,
            style = {},
            children: text
        } = this.props;

        const classes = [ type ];

        if(disabled)
            classes.push('disabled');

        if(loading)
            classes.push('loading');

        return (
            <div 
                className={ [ 'button', ...classes ].join(' ') } 
                style={{ height, width, ...style }}
                onClick={ event => (this.validateClick() && onClick(event)) }    
            >
                { !loading && text }
            </div>
        );
    }
}