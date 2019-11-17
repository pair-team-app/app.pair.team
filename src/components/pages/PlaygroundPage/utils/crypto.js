'use strict';


import crypto from 'crypto';
import cryptoCreds from '../../../../assets/json/crypto-creds';


export function decryptObject(cipherText) {
	const clearText = decryptText(cipherText);
	return ((clearText.charAt(0) === '[' || clearText.charAt(0) === '{') ? JSON.parse(clearText) : null);
}

export function decryptText(cipherText) {
	const decKey = crypto.createDecipheriv(cryptoCreds.method, cryptoCreds.key, cryptoCreds.iv);
	const decStr = decKey.update(cipherText, 'hex', 'utf8');

	return (`${decStr}${decKey.final('utf8')}`);
}
