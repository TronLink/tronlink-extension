import Contracts from './contracts';

export default async (tronWeb, contractType, transaction) => {
    if(!Contracts.hasOwnProperty(contractType))
        return { error: `Contract type ${ contractType } not supported` };

    const endpoint = Contracts[ contractType ];

    return {
        mapped: transaction
    };
};