var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(4300);
var db = require('rethinkdb');
const party = require('./services/party');



db.connect({
	db: "YouParty"
}, (err, conn) => {
	if (err) {
		console.log("Error: " + err + " not starting server");
	} else {

		var partyService = new party.Service(db, conn);

		//Delete this line in production!!!!!!!1
		//partyService.destroyParties();

		let ipHash = {};
		let partyHash = {};


		var ipHandler = io
		.of('/party')
		.on('connection', (socket) => {
			socket.on('party-connect', (message) => {
				partyService.findGuest(message.fingerprint, (error, guest) => {
					if (guest !== null && guest.key !== null) {
						socket.join(guest.key);
						socket.emit('party-connect', guest);
					}
					if (partyHash[guest.key] === undefined) {
						partyHash[guest.key] = {
							guests: 1
						}
					} else {
						partyHash[guest.key].guests += 1;
					}
				})
			})

			socket.on('details', (id) => {
				console.log(id);
				partyService.findPartyById(id, (error, party) => {
					party.guests = partyHash[party.id].guests
					socket.emit('details', party);
				})
			})
		})

		var ipHandler = io
		.of('/ip')
		.on('connection', (socket) => {
			socket.on('ip-connect', (message) => {
				partyService.findGuest(message.fingerprint, (error, guest) => {
					console.log(guest);
					if (guest === null) {
						partyService.newGuest(message.fingerprint, message.ip, (error, response) => {
							console.log(response);
						})
					} else {
						socket.emit('ip-connect', guest);
					}
					socket.join(message.fingerprint);
				});

				if (ipHash[message.ip] === undefined) {
					ipHash[message.ip] = {
						parties: [],
						guests: [socket]
					}
				} else {
					ipHash[message.ip].guests.push(socket);
				}

				partyService.findPartiesByIp(message.ip, (error, parties) => {
					socket.emit('initial-parties', parties);
				})

				socket.join(message.ip);
			})

			socket.on('host-party', (message) => {

				partyKey = partyService.generateKey(5);

				partyService.host(message.fingerprint, message.ip, message.partyName, partyKey, (error, result) => {
					partyService.findGuest(message.fingerprint, (error, guest) => {
						console.log("Guest:" + guest + " Message: " + message);
						io.of("/ip").to(message.fingerprint).emit('ip-connect', guest);
						socket.emit('ip-connect', guest);
						console.log("Hosting: " + partyKey);
						socket.join(partyKey);
					})
				})
			})

			socket.on('leave-party', (message) => {
				partyService.leaveParty(message.fingerprint, message.ip, (error, res) => {
					partyService.findGuest(message.fingerprint, (error, guest) => {
						io.of("/ip").to(message.fingerprint).emit('ip-connect', guest);
						socket.emit('ip-connect', guest);
					})
				})
			})

			socket.on('destroy-party', (message) => {
				console.log(message);
				partyService.findGuest(message.fingerprint, (error, guest) => {
					console.log(guest);
				 	let key = guest.key;
					partyService.destroyParty(message.fingerprint, message.ip, guest.key, (error, res) => {
						partyService.findGuest(message.fingerprint, (error, guest) => {
							console.log("Destroying Party", key);
							socket.broadcast.to(key).emit('party-destroyed');
							io.of("/ip").to(message.fingerprint).emit('ip-connect', guest);
							socket.emit('ip-connect', guest);
						})
					})
				})
			})

			socket.on('join-party', (message) => {
				partyService.findPartyById(message.partyKey, (error, party) => {
					if (party === null) {
						console.log("Party not found");
						socket.emit('join-party', {error: error, party: party});
					} else {
						console.log(message);
						partyService.join(message.fingerprint, message.ip, message.partyKey, (error, guest) => {
							partyService.findGuest(message.fingerprint, (error, guest) => {
								console.log("Joining: " + message.partyKey);
								socket.join(message.partyKey);
								socket.emit('ip-connect', guest);
								io.of("/ip").to(message.fingerprint).emit('ip-connect', guest);
							})
						})
					}			
				})
			})
		})

		db.table("Parties").changes().run(conn, (err, cursor) => {
			cursor.each((error, change) => {
				let ip = change.old_val !== null ? change.old_val.ip : change.new_val.ip;
				console.log(change);
				io.of('/ip').to(ip).emit('party-change', change);
			});
		});

	}
})

