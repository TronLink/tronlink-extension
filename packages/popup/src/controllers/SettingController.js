import React from 'react';
import {PopupAPI} from "@tronlink/lib/api";
import {APP_STATE} from "@tronlink/lib/constants"
import { FormattedMessage } from 'react-intl';


class SettingController extends  React.Component {
    constructor(props){
        super(props);
    }
    state={}
    setting(i){
        console.log(this.refs);
    }
    render(){
        const { onCancel } = this.props;
        return (
            <div className='insetContainer choosingType'>
                <div className='pageHeader'>
                    <div className="back" onClick={ onCancel }></div>
                    <FormattedMessage id="SETTING.TITLE" />
                </div>
                <div className='greyModal' ref="cell">
                    <div className="option" onClick={ this.setting(0) }>
                        <FormattedMessage id="SETTING.TITLE.NODE" />
                    </div>
                    <div className="option" onClick={ this.setting(1) }>
                        <FormattedMessage id="SETTING.TITLE.CURRENCY" />
                    </div>
                    <div className="option" onClick={() =>{PopupAPI.lockWallet()}   }>
                        <FormattedMessage id="SETTING.TITLE.LOCK" />
                    </div>
                </div>
            </div>
        );
    }

};

export default SettingController;
