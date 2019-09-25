/**
 * Created by tron on 2019/8/29.
 */
import React from 'react';
import Button from '@tronlink/popup/src/components/Button';

import { injectIntl } from 'react-intl';

import './Confirmation.scss';

class Confirmation extends React.Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){

    }

    render() {
        const {formatMessage} = this.props.intl;
        const {
            show = true,
            title = formatMessage({id: 'BUTTON.DELETE'}),
            body = formatMessage({id: 'CONFIRMATIONS.DELETE_NODE.BODY'})
        } = this.props;

        return (
            show
                ?
            <div className="confirmWrap">
                <div className="confirm">
                    <div className="title">
                        {title}
                    </div>
                    <div className="body">
                        {body}
                    </div>
                    <div className="btn-group">
                        <Button id="BUTTON.CLOSE" onClick={this.props.onClose}/>
                        <Button id="BUTTON.CONFIRM" onClick={this.props.onConfirmed}/>
                    </div>
                </div>
            </div>
                :
                null
        );
    }
};
export default injectIntl(Confirmation);

