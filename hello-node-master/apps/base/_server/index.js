const ModuleBase = load("com/base"); // import ModuleBase class

var players = [];

class Base extends ModuleBase {

	constructor(app, settings) {
		super(app, new Map([["name", "baseapp"], ["io", true]]));
	}

	/**
	 * @method hello : world
	 * @param {*} req 
	 * @param {*} res 
	 * @param  {...*} params : some arguments
	 */
	hello(req, res, ... params) {
		let answer = ["hello", ...params, "!"].join(" "); // say hello
		trace(answer); // say it
		this.sendJSON(req, res, 200, {message: answer}); // answer JSON
	}

	/**
	 * @method data : random data response
	 * @param {*} req 
	 * @param {*} res 
	 */
	data(req, res) {
		let data = [ // some random data
			{id: 0, name: "data0", value: Math.random()},
			{id: 1, name: "data1", value: Math.random()},
			{id: 2, name: "data2", value: Math.random()}
		];
		this.sendJSON(req, res, 200, data); // answer JSON
	}

	/**
	 * @method _onIOConnect : new IO client connected
	 * @param {*} socket 
	 */
	_onIOConnect(socket) {
		super._onIOConnect(socket); // do not remove super call
		socket.on("dummy", packet => this._onDummyData(socket, packet)); // listen to "dummy" messages
		socket.on("login", packet => this._onLogin(socket, packet));
		socket.on("disconnect", packet => this._onDisconnect(socket, packet));
	}

	/*_onIODisconnect(socket){
		super._onIODisconnect(socket);
		trace(socket);
	}*/

	_onDummyData(socket, packet) { // dummy message received
		trace(socket.id, "dummy", packet); // say it
		socket.emit("dummy", {message: "dummy indeed", value: Math.random()}); // answer dummy random message
	}

	_onLogin(socket, packet){
		trace(socket.id, "pseudo :", packet);
		
		socket.emit("players", players);

		players.push({id: socket.id, name: packet});

		trace(players.length, " players connected actually");

		if(players.length > 1)
			socket.broadcast.emit("newplayer", players[players.length - 1]);
		/*if(players.length == 2){
			socket.emit("start", players);
			socket.broadcast.emit("start", players);
		}
		else
			socket.emit("login", players);
		*/
	}

	_onDisconnect(socket, packet){
		trace(socket.id, "disconnected");
		for(var i = 0; i < players.length; i++){
			if(players[i].id == socket.id){
				players.splice(i, 1);
			}
		}
		trace(players.length, " players connected actually");
	}
}

module.exports = Base; // export app class