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
        console.log('数据的高-------------------------', wrapper.clientHeight);
        console.log('滚动的高------------------------', document.documentElement.scrollTop);
        console.log('滚动的高------------------------', document.body.scrollTop);
        console.log('屏幕的高------------------------', document.documentElement.clientHeight);
        console.log('%O', this.props.rentListContentDom);
        const callback = () => {
            const top = wrapper.getBoundingClientRect().top;
            const windowHeight = window.screen.height;
            if (top && top < windowHeight) {
                // 证明 wrapper 已经被滚动到暴露在页面可视范围之内了
                loadMoreFn();
            }
        };

        this.props.rentListContentDom.addEventListener('scroll', () => {
            if (this.props.isLoadingMore) return;
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(callback, 50);
        }, false);
    }
}

export default injectIntl(LoadMore);