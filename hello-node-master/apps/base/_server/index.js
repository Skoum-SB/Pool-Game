const ModuleBase = load("com/base"); // import ModuleBase class

class Base extends ModuleBase {

	constructor(app, settings) {
		super(app, new Map([["name", "baseapp"], ["io", true]]));
		this.players = [];
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
		
		socket.emit("players", this.players);

		this.players.push({id: socket.id, name: packet});

		trace(this.players.length, " players connected actually");

		socket.broadcast.emit("newplayer", this.players[this.players.length - 1]);

		socket.on("disconnect", packet => this._onDisconnect(socket, packet));
		socket.on("challenge", packet => this._onChallenge(socket, packet));
	}

	_onDisconnect(socket, packet){
		trace(socket.id, "disconnected");
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i].id == socket.id){
				var playerDisconnected = this.players.splice(i, 1);
			}
		}
		trace(this.players.length, " players connected actually");

		socket.broadcast.emit("playerDisconnected", playerDisconnected[0].name);
	}

	_onChallenge(socket, packet){
		trace(socket.id, packet);
		
		var playerName;
		var opponentId;

		var gameId = 0;

		trace(this.gameRooms.length , "LONGUEUR");
		for(var i=0 ; i<this.gameRooms.length ; gameId = ++i){
			trace("ITERATION", i);
			if(this.gameRooms[i] == false){
				break;
			}
		}
		this.gameRooms[gameId] = true;
		trace(this.gameRooms.length, "ID GAME = ", gameId);

		this.players.forEach(el => {
			if(el.name == packet)
				opponentId = el.id;//Id Player 2
			if(el.id == socket.id)
				playerName = el.name;//Name Player 1
		});
		trace(opponentId);

		socket.join("game-" + (gameId + 1));

		this._io.sockets[opponentId].join("game-" + (gameId + 1));
		this._io.to("game-" + (gameId + 1)).emit("start", packet);

		trace(this._io);

		var gamePlayers = [playerName, packet];
		trace(gamePlayers);
		trace(this.gameRooms);

		socket.broadcast.emit("playersInGame", gamePlayers);

		for(var i = 0; i < this.players.length; i++){
			if(this.players[i].name == gamePlayers[0] || this.players[i].name == gamePlayers[1]){
				this.players.splice(i, 1);
				i--;
			}
		}
	}
}

module.exports = Base; // export app class