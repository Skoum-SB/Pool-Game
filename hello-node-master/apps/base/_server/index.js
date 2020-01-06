const ModuleBase = load("com/base"); // import ModuleBase class

class Base extends ModuleBase {

	constructor(app, settings) {
		super(app, new Map([["name", "baseapp"], ["io", true]]));
		this.lobbyPlayers = [];
		this.gamePlayers = [[{id: null, name : null},{id: null, name : null}]];
		this.gameRooms = [];
		this.boards = [];
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
		//socket.on("dummy", packet => this._onDummyData(socket, packet)); // listen to "dummy" messages
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

		this._initBoard(roomId);
		//trace(this.boards[roomId]);
		this._io.to("room-" + (roomId)).emit("start", this.boards[roomId]);//!!!!!!!!

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

	_initBoard(room){
		var redballs = [
		new Ball(this.area, 1056,433,"red"),
		new Ball(this.area, 1090,374,"red"),
		new Ball(this.area, 1126,393,"red"),
		new Ball(this.area, 1126,472,"red"),
		new Ball(this.area, 1162,335,"red"),
		new Ball(this.area, 1162,374,"red"),
		new Ball(this.area, 1162,452,"red")
		];

		var yellowballs = [
		new Ball(this.area, 1022,413,"yellow"),
		new Ball(this.area, 1056,393,"yellow"),
		new Ball(this.area, 1090,452,"yellow"),
		new Ball(this.area, 1126,354,"yellow"),
		new Ball(this.area, 1126,433,"yellow"),
		new Ball(this.area, 1162,413,"yellow"),
		new Ball(this.area, 1162,491,"yellow")
		];

		var whiteball = new Ball(this.area, 413,413,"white");
		var blackball = new Ball(this.area, 1090,413,"black");

		this.balls = yellowballs.concat(redballs);
		this.balls.push(blackball);
		this.balls.push(whiteball);


		this.boards[room] = this.balls;
	}
}

module.exports = Base; // export app class

class Ball{

	constructor (area, x, y, color){
		this.x = x;
		this.y = y;
		this.out = false;
		this.color = color;
		this.ismoving = false;
		this.vx = 0;
		this.vy = 0;
		this.radius = 19;
		this.mass=1;
	}

	move(allBalls){
		if(this.ismoving){
			/*Left and Right*/ if(this.x < 55+25 || this.x > 1395+25){ this.vx = -this.vx; this.vx *= 0.95;}
			/*Top and Bottom*/ if(this.y < 55+25 || this.y > 717+25){ this.vy = -this.vy; this.vx *= 0.95;}
			this.x += this.vx;
			this.y += this.vy;
			this.vx += (this.vx * 0.01);
			this.vy += (this.vy * 0.01);
			if((Math.abs(this.vy) < 1) && (Math.abs(this.vx)<1)){
				this.ismoving = false;
				this.vx = 0;
				this.vy = 0;
			}
		}
		this.vx *= 0.979;
		this.vy *= 0.979;
	}

	collideWith(second_ball){
		if(second_ball.ismoving==false && this.ismoving==false)
			return;
		let tx = (this.x + (this.x*0.01));
		let ty = (this.y + (this.y*0.01));
		let fx = (second_ball.x + (second_ball.x*0.01));
		let fy = (second_ball.y + (second_ball.y*0.01));
		let dx = fx - tx;
		let dy = fy - ty;
		let distance = Math.sqrt(dx * dx + dy * dy);
		if(this!=second_ball && (distance < this.radius*2)){
			//this.vx = -this.vx;
			//this.vx = -this.vx;
			let angle = Math.atan2(dy,dx);
			let sin = Math.sin(angle);
			let cos = Math.cos(angle);
			let x1=0; let y1=0;
			let x2 = dx*cos+dy*sin;
			let y2 = dy*cos-dx*sin;

			//Rotate velocity
			let vx1 = this.vx*cos+this.vy*sin;
			let vy1 = this.vy*cos-this.vx*sin;
			let vx2 = second_ball.vx*cos+second_ball.vy*sin;
			let vy2 = second_ball.vy*cos-second_ball.vx*sin;

			//resolve 1D velocity, use temp letiables
			let vx1final = ((this.mass-second_ball.mass)*vx1+2*second_ball.mass*vx2)/(this.mass+second_ball.mass);
			let vx2final = ((second_ball.mass-this.mass)*vx2+2*this.mass*vx1)/(this.mass+second_ball.mass);
			// update velocity
			vx1 = vx1final;
			vx2 = vx2final;

			// fix the glitch by moving ball part equal to the overlap
			let absV = Math.abs(vx1)+Math.abs(vx2);
			let overlap =38-Math.abs(x1-x2);
			x1 += vx1/absV*overlap;
			x2 += vx2/absV*overlap;

			// rotate the relative positions back
			let x1final = x1*cos-y1*sin;
			let y1final = y1*cos+x1*sin;
			let x2final = x2*cos-y2*sin;
			let y2final = y2*cos+x2*sin;

			// finally compute the new absolute positions
			second_ball.x = this.x + x2final;
			second_ball.y = this.y + y2final;

			this.x = this.x + x1final;
			this.y = this.y + y1final;


			this.vx = vx1*cos-vy1*sin;
			this.vy = vy1*cos+vx1*sin;
			second_ball.vx = vx2*cos-vy2*sin;
			second_ball.vy = vy2*cos+vx2*sin;
			//console.log(second_ball.vy, second_ball.vx);
			this.ismoving = true;
			second_ball.ismoving = true;

			return true;
		}
	}
}