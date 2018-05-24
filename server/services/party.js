class Guest {
	constructor(props) {
		this.fingerprint = props.fingerprint;
		this.ip = props.ip;
		this.id = this.ip + "_" + this.fingerprint;
		this.target = props.target;
		this.agent = props.agent;
	}
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
class Service {
	constructor(db, connection) {
		this.db = db;
		this.conn = connection;
	}

	newGuest(fingerprint, ip, callback) {
		this.db.table("Guests").insert({
			id: fingerprint,
			ip: ip,
			fingerprint: fingerprint,
			target: "Index",
			agent: "None"
		}).run(this.conn, (err, res) => {
			callback(err, res);
		})
	}

	findGuest(fingerprint, callback) {
		this.db.table("Guests").get(fingerprint).run(this.conn, (error, guest) => {
			callback(error, guest);
		})
	}

	updateGuest(fingerprint, ip, target, key, callback) {
		this.db.table("Guests").get(fingerprint).update({
			target: target,
			key: key
		}).run(this.conn, (error, result) => {
			callback(error, result);
		})
	}

	host(fingerprint, ip, partyName, partyKey, callback) {
		this.db.table("Parties").insert({
			host: fingerprint,
			ip: ip,
			name: partyName,
			id: partyKey,
		}).run(this.conn, (error, res) => {
			this.updateGuest(fingerprint, ip, "host", partyKey, (error, result) => {
				callback(error,result);
			})
		})
	}

	join(fingerprint, ip, partyKey, callback) {
		this.updateGuest(fingerprint, ip, "guest", partyKey, callback);
	}

	findPartiesByIp(ip, callback) {
		this.db.table("Parties").filter({ip: ip}).run(this.conn, (error, cursor) => {
			cursor.toArray((error, parties) => {
				callback(error, parties);
			})
		})
	}

	findPartyById(id, callback) {
		this.db.table("Parties").get(id).run(this.conn, (error, party) => {
			callback(error, party);
		})
	}

	generateKey(length) {
		let alpha = ['a','b','c','d','e','f','g','h','j','k','q','r','s','t','w','x','y','z'];
		let key = "";
		for (let i = 0; i < length; i++) {
			let r1 = getRandomInt(2);
			if (r1 === 0) {
				key += getRandomInt(2,9);
			} else {
				key += alpha[getRandomInt(0, alpha.length)];
			}
		}
		return key;
	}

	destroyParties() {
		this.db.table("Parties").delete().run(this.conn, (err, res) => {
			this.db.table("Guests").update({target: "index", key: null}).run(this.conn, (error, res) => {
				
			})
		})
	}

	leaveParty(fingerprint, ip, callback) {
		this.updateGuest(fingerprint, ip, "index", null, callback);
	}

	destroyParty(fingerprint, ip, id, callback) {
		this.findPartyById(id, (error, party) => {
			if (party !== null) {
				console.log(party);
				if (party.host === fingerprint) {
					console.log(party);
					this.db.table("Parties").get(party.id).delete().run(this.conn, (error, res) => {
						this.db.table("Guests").filter({key: party.id}).update({target: "index", key: null}).run(this.conn, (error, res) => {
							callback(true);
						})
					})
				}
			}
		})
	}
}

module.exports = {
	Service : Service,
	Guest: Guest
};