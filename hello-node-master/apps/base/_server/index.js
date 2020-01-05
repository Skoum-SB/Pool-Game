const ModuleBase = load("com/base"); // import ModuleBase class

class Base extends ModuleBase {

	constructor(app, settings) {
		super(app, new Map([["name", "baseapp"], ["io", true]]));
		this.lobbyPlayers = [];
		this.gamePlayers = [[{id: null, name : null},{id: null, name : null}]];
		this.gameRooms = [];
	}

	/**
	 * @method hello : world
	 * @param {*} req 
	 * @param {*} res 
	 * @param  {...*} params : some arguments
	 */
	/*hello(req, res, ... params) {
		let answer = ["hello", ...params, "!"].join(" "); // say hello
		trace(answer); // say it
		this.sendJSON(req, res, 200, {message: answer}); // answer JSON
	}*/

	/**
	 * @method data : random data response
	 * @param {*} req 
	 * @param {*} res 
	 */
	/*data(req, res) {
		let data = [ // some random data
			{id: 0, name: "data0", value: Math.random()},
			{id: 1, name: "data1", value: Math.random()},
			{id: 2, name: "data2", value: Math.random()}
		];
		this.sendJSON(req, res, 200, data); // answer JSON
	}*/

	/**
	 * @method _onIOConnect : new IO client connected
	 * @param {*} socket 
	 */
	_onIOConnect(socket) {
		super._onIOConnect(socket); // do not remove super call
		socket.on("dummy", packet => this._onDummyData(socket, packet)); // listen to "dummy" messages
		socket.on("login", packet => this._onLogin(socket, packet));
	}

	/*_onDummyData(socket, packet) { // dummy message received
		trace(socket.id, "dummy", packet); // say it
		socket.emit("dummy", {message: "dummy indeed", value: Math.random()}); // answer dummy random message
	}*/

	_onLogin(socket, packet){
		trace(socket.id, "pseudo :", packet);
		
		socket.emit("players", this.lobbyPlayers);

		this.lobbyPlayers.push({id: socket.id, name: packet});

		trace(this.lobbyPlayers.length, " players connected actually");

		socket.broadcast.emit("newplayer", this.lobbyPlayers[this.lobbyPlayers.length - 1]);

		socket.on("disconnect", packet => this._onDisconnect(socket, packet));
		socket.on("challenge", packet => this._onChallenge(socket, packet));
	}

	_onDisconnect(socket, packet){
		trace(socket.id, "disconnected");

		var inLobby = false;
		for(var i = 0; i < this.lobbyPlayers.length; i++){
			if(this.lobbyPlayers[i].id == socket.id){
				var playerDisconnected = this.lobbyPlayers.splice(i, 1);
				inLobby = true;
			}
		}
		
		if(inLobby){//In lobby
			trace(this.lobbyPlayers.length, " players in the lobby actually");
			socket.broadcast.emit("playerDisconnected", playerDisconnected[0].name);
		}

		else{//In game
			for(var i=0 ; i<this.gamePlayers.length ; i++){
				if(socket.id == this.gamePlayers[i][0].id){
					trace("DISCONNECT P1", "room-" + i);
					this._io.emit("newplayer", this.gamePlayers[i][1]);
					socket.to("room-" + i).emit("playerLeft", this.lobbyPlayers);
					this.lobbyPlayers.push({id: this.gamePlayers[i][1].id, name: this.gamePlayers[i][1].name});
					this.gameRooms[i] = false;
					this.gamePlayers[i] = [{id: null, name : null},{id: null, name : null}];

				}
				else if(socket.id == this.gamePlayers[i][1].id){
					trace("DISCONNECT P2", "room-" + i);
					this._io.emit("newplayer", this.gamePlayers[i][0]);
					socket.to("room-" + i).emit("playerLeft", this.lobbyPlayers);
					this.lobbyPlayers.push({id: this.gamePlayers[i][0].id, name: this.gamePlayers[i][0].name});
					this.gameRooms[i] = false;
					this.gamePlayers[i] = [{id: null, name : null},{id: null, name : null}];

				}
			}


		}
	}

	_onChallenge(socket, packet){//packet = Name Player 2
		trace(socket.id, packet);//socket.id = Id Player 1
		
		var playerName;//Name Player 1
		var opponentId;//Id Player 2

		var roomId = 0;

		for(var i=0 ; i<this.gameRooms.length ; roomId = ++i){
			trace("ITERATION", i);
			if(this.gamePlayers[i][0].id == null){
				break;
			}
		}
		this.gameRooms[roomId] = true;
		trace(this.gameRooms.length, "ID GAME = ", roomId);

		//Prepare next room (If necessary)
		if(roomId == (this.gamePlayers.length - 1)){
			trace("INCREASED SIZE");
			this.gamePlayers.push([{id: null, name : null},{id: null, name : null}]);
		}

		this.lobbyPlayers.forEach(el => {
			if(el.name == packet)
				opponentId = el.id;//Id Player 2
			if(el.id == socket.id)
				playerName = el.name;//Name Player 1
		});
		trace(opponentId);

		socket.join("room-" + (roomId));

		this._io.sockets[opponentId].join("room-" + (roomId));
		this._io.to("room-" + (roomId)).emit("start", roomId);

		//trace(this._io);

		var gamePlayers = [playerName, packet];//Name of the 2 players
		trace(gamePlayers);
		trace(this.gameRooms);

		socket.broadcast.emit("playersInGame", gamePlayers);

		this.gamePlayers[roomId] = [{id: socket.id, name: playerName}, {id: opponentId, name: packet}];
		trace(roomId, this.gamePlayers[roomId]);

		for(var i = 0; i < this.lobbyPlayers.length; i++){
			if(this.lobbyPlayers[i].name == gamePlayers[0] || this.lobbyPlayers[i].name == gamePlayers[1]){
				this.lobbyPlayers.splice(i, 1);
				i--;
			}
		}
	}
}

module.exports = Base; // export app class