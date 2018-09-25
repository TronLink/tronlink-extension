import Contracts from './contracts';

export default async (tronWeb, contractType = false, parameters = false) => {
    if(!Contracts.hasOwnProperty(contractType))
        return { error: 'Contract type not supported' };

    // Replace default address (PrivateKey: FF) with user address
    Object.entries(parameters).forEach(([ key, value ]) => {
        if(![
            'THHdJjkPUngpM4PdJd8Wq8Rq77CFoKHj1u',
            '415044a80bd3eff58302e638018534bbda8896c48a'
        ].includes(value))
            return;

        parameters[key] = tronWeb.wallet.defaultAddress.hex;
    });

    const endpoint = Contracts[contractType];

    return {
        mapped: await tronWeb.fullNode.request(endpoint, parameters, 'post')
    };
};