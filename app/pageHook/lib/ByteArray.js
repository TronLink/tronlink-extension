const ByteArray = {
    toHexString(bytes) {
        if(bytes == null)
            return '';

        return Array.from(bytes, byte => (
            // Pad for exactly two digits
            ('0' + (byte & 0xFF).toString(16)).slice(-2)
        )).join('');
    },

    fromHexString(string) {
        if(string == null)
            return new Uint8Array(0);

        if(string.startsWith('0x'))
            string = string.substr(2);

        if(string.length % 2 != 0)
            string = '0' + string;

        const buffer = new Uint8Array((string.length / 2) | 0);

        for(let i = 0; i < string.length; i+= 2)
            buffer[i / 2] = parseInt(string.substr(i, i + 2), 16);

        return buffer;
    }
};

export default ByteArray;