
import crypto from 'crypto';
import cryptoCreds from '../../../../assets/json/crypto-creds';


export function decryptObject(cipherText) {
	const clearText = decryptText(cipherText);
	return ((clearText.charAt(0) === '[' || clearText.charAt(0) === '{') ? JSON.parse(clearText) : null);
}

export function decryptText(cipherText) {
	const segs = cipherText.split(':');
	const iv = Buffer.from(segs.shift(), 'hex');
	const msg = Buffer.from(segs.join(':'), 'hex');
	const decipher = crypto.createDecipheriv(cryptoCreds.method, Buffer.from(cryptoCreds.key), iv);
	const prefix = decipher.update(msg);

	return (Buffer.concat([prefix, decipher.final()]).toString('utf8'));
}
