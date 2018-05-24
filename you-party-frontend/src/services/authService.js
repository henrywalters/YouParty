import Fingerprint2 from 'fingerprintjs2';
let request = require('request');

export default class Authorization {
	static getFingerPrint(callback) {

		new Fingerprint2().get((fingerprint) => {
			callback(fingerprint);
		})
	}

	static getIP(callback) {
		request("https://you-party.co/getIP.php", (err, res, body) => {
			callback(body);
		});
	}

	static getCredentials() {
		let hasCredentials = false;
		let credentials = {
			ip: null,
			fingerprint: null
		}
		return new Promise((resolve, reject) => {
			Authorization.getIP((ip) => {
				credentials.ip = ip;
				if (credentials.ip !== null && credentials.fingerprint !== null) {
					resolve(credentials);
				}
			})

			Authorization.getFingerPrint((fingerprint) => {
				credentials.fingerprint = fingerprint;
				if (credentials.ip !== null && credentials.fingerprint !== null) {
					resolve(credentials);
				}
			})
		})
	}
}

