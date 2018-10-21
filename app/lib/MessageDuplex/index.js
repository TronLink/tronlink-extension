import Host from './handlers/host';
import Child from './handlers/child';

const Tab = Child.bind(null, 'tab'); // eslint-disable-line
const Popup = Child.bind(null, 'popup'); // eslint-disable-line

export default {
    Host,
    Tab,
    Popup
};