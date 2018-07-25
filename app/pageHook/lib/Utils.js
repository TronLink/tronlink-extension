const Utils = {
    base64ToHex(string) {
        const bin = atob(string.replace(/[ \r\n]+$/, ''));
        const hex = [];

        for (let i = 0; i < bin.length; i++) {
            let temp = bin.charCodeAt(i).toString(16);

            if (temp.length == 1)
                temp = '0' + temp;

            hex.push(temp);
        }

        return hex.join('');
    },
    base58ToHex(string) {
        const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        const bytes = [ 0 ];

        for (let i = 0; i < string.length; i++) {
            const char = string[i];

            if (!ALPHABET.includes(char)) 
                throw new Error('Non-base58 character');

            for (let j = 0; j < bytes.length; j++) 
                bytes[j] *= 58;

            bytes[0] += ALPHABET.indexOf(char);

            let carry = 0;

            for (let j = 0; j < bytes.length; ++j) {
                bytes[j] += carry;
                carry = bytes[j] >> 8;
                bytes[j] &= 0xff;
            }

            while (carry) {
                bytes.push(carry & 0xff);
                carry >>= 8;
            }
        }

        for (let i = 0; string[i] === '1' && i < string.length - 1; i++) 
            bytes.push(0);

        return bytes.reverse().slice(0, 21).map(byte => {
            let temp = byte.toString(16);

            if(temp.length == 1)
                temp = '0' + temp;

            return temp;
        }).join('');
    }
}

export default Utils;