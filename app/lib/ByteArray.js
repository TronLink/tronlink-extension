const ByteArray = {
    toHexString(bytes = false) {
        if(!bytes)
            return '';

        return Array.from(bytes, byte => (
            // Pad for exactly two digits
            (`0${(byte & 0xFF).toString(16)}`).slice(-2)
        )).join('');
    },

    charToByte(c) {
        if (c >= 'A' && c <= 'F')
            return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;

        if (c >= 'a' && c <= 'f')
            return c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;

        else if (c >= '0' && c <= '9')
            return c.charCodeAt(0) - '0'.charCodeAt(0);

        return 0;
    },

    fromHexString(str) {
        const byteArray = [];

        let d = 0;
        let j = 0;
        let k = 0;

        for (let i = 0; i < str.length; i++) {
            const c = str.charAt(i);

            d <<= 4;
            d += this.charToByte(c);
            j++;

            if (0 === (j % 2)) {
                byteArray[k++] = d;
                d = 0;
            }
        }

        return byteArray;
    }
};

export default ByteArray;