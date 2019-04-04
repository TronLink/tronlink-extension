import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';

class LoadMore extends React.Component {
    render() {
        return (
            <div className='load-more' style={{ textAlign: 'center', padding: '10px 0', backgroundColor: '#fff', color: '#999' }} ref={ wrapper => this.wrapper = wrapper }>
                {
                    this.props.isLoadingMore ?
                        <span><FormattedMessage id='BANK.RENTRECORD.LOADMORE' />...</span> :
                        <span onClick={this.loadMoreHandle.bind(this)}>
                            <FormattedMessage id='BANK.RENTRECORD.LOADMORE' />
                        </span>
                }
            </div>
        );
    }

    loadMoreHandle() {
        // 执行传输过来的
        this.props.loadMoreFn();
    }

    componentDidMount() {
        // 使用滚动时自动加载更多
        const loadMoreFn = this.props.loadMoreFn;
        const wrapper = this.wrapper;
        let timeoutId;
        const callback = () => {
            const top = wrapper.getBoundingClientRect().top;
            const windowHeight = window.screen.height;
            console.log(`top值为${top},windowHeight值${windowHeight},${wrapper.getBoundingClientRect()}`);
            if (top && top < windowHeight) {
                // 证明 wrapper 已经被滚动到暴露在页面可视范围之内了
                loadMoreFn();
            }
        };

        window.addEventListener('scroll', () => {
            if (this.props.isLoadingMore) return;
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(callback, 50);
        }, false);
    }
}

export default injectIntl(LoadMore);