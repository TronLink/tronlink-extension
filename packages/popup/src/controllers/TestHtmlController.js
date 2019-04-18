import React from 'react';
import { injectIntl } from 'react-intl';

class TestHtmlController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            app: '1232'
        };
    }

    render() {
        return(
            <div>
                测试页面流程
            </div>
        );
    }
}
export default injectIntl(TestHtmlController);