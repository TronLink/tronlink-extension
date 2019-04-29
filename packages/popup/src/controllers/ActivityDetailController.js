import React from 'react';
import { FormattedMessage } from 'react-intl';
class ActivityDetailController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    render() {
        const { onCancel,selectedToken } = this.props;
        return (
            <div className='insetContainer transactions' style={{overflow: 'auto'}}>
                <div className='pageHeader'>
                    <div className="back" onClick={onCancel}></div>
                    <FormattedMessage id="USDT.TEXT.ACTIVITY_DETAIL"/>
                </div>
                <div className='greyModal activity' style={{padding:0}}>
                    <div className="banner">
                        <div className="icon">
                            <img src={selectedToken.imgUrl} />
                        </div>
                        <div className="name">
                            {selectedToken.abbr}
                        </div>
                    </div>
                    <div className="content scroll">
                        <div className="contents">
                            <div className="main-title">
                                <FormattedMessage id="USDT.MAIN_TITLE1" />
                            </div>
                            <div className="sub-title">
                                <FormattedMessage id="USDT.MAIN_TITLE1.SUBTITLE1" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE1.SUBTITLE1.CONTENT" />
                            </div>
                            <div className="sub-title">
                                <FormattedMessage id="USDT.MAIN_TITLE1.SUBTITLE2" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE1.SUBTITLE2.CONTENT" />
                            </div>
                            <div className="sub-title">
                                <FormattedMessage id="USDT.MAIN_TITLE1.SUBTITLE3" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE1.SUBTITLE3.CONTENT" />
                            </div>
                            <div className="sub-title">
                                <FormattedMessage id="USDT.MAIN_TITLE1.SUBTITLE4" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE1.SUBTITLE4.CONTENT" />
                            </div>
                            <div className="main-title" style={{marginTop:'20px'}}>
                                <FormattedMessage id="USDT.MAIN_TITLE2" />
                            </div>
                            <div className="sub-title">
                                <FormattedMessage id="USDT.MAIN_TITLE2.SUBTITLE1" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE2.SUBTITLE1.CONTENT1" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE2.SUBTITLE1.CONTENT2" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE2.SUBTITLE1.CONTENT3" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE2.SUBTITLE1.CONTENT4" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE2.SUBTITLE1.CONTENT5" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE2.SUBTITLE1.CONTENT6" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE2.SUBTITLE1.CONTENT7" />
                            </div>
                            <div className="description">
                                <FormattedMessage id="USDT.MAIN_TITLE2.SUBTITLE1.CONTENT8" />
                             </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export default ActivityDetailController;
