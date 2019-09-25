/**
 * Created by tron on 2019/7/3.
 */
import React from 'react';
import Button from '@tronlink/popup/src/components/Button';

import { injectIntl } from 'react-intl';

import './Alert.scss';

class Alert extends React.Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){

    }

    render() {
        const {formatMessage} = this.props.intl;
        const {
            className = '',
            show = true,
            title = formatMessage({id: 'CREATION.LEDGER.ALERT.TIP'}),
            body = formatMessage({id: 'CREATION.LEDGER.ALERT.BODY'}),
            buttonText = 'BUTTON.CONFIRM'
        } = this.props;

        return (
            show
                ?
                <div className={"alert"+(className?' '+className:"")}>
                    <div className="title">
                        {title}
                    </div>
                    <div className="body">
                        {body}
                    </div>
                    <Button id={buttonText} onClick={this.props.onClose}/>
                </div>
                :
                null
        );
    }
};

export default injectIntl(Alert);