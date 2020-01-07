const ModuleBase = load("com/base"); // import ModuleBase class

class Base extends ModuleBase {

	constructor(app, settings) {
		super(app, new Map([["name", "baseapp"], ["io", true]]));
		this.lobbyPlayers = [];
		this.gamePlayers = [[{id: null, name : null},{id: null, name : null}]];
		this.gameRooms = [];
		this.gameState = [];
		this.boards = [];
		this.holes = [
			 new Ball(this.area, 750,50,"red"),
			 new Ball(this.area, 750,776,"red"),
			 new Ball(this.area, 62,62,"red"),
			 new Ball(this.area, 1435,62,"red"),
			 new Ball(this.area, 62,762,"red"),
			 new Ball(this.area, 1435,762,"red")
		];

		this.holes[0].radius = 15;
		this.holes[1].radius = 15;
		this.holes[2].radius = 25;
		this.holes[3].radius = 25;
		this.holes[4].radius = 25;
		this.holes[5].radius = 25;
	}

	_onIOConnect(socket) {
		super._onIOConnect(socket); // do not remove super call
		socket.on("login", packet => this._onLogin(socket, packet));
	}

	_onLogin(socket, packet){
		trace(socket.id, "pseudo :", packet);
		
		socket.emit("players", this.lobbyPlayers);

		this.lobbyPlayers.push({id: socket.id, name: packet});

		trace(this.lobbyPlayers.length, " players connected actually");

		socket.broadcast.emit("newplayer", this.lobbyPlayers[this.lobbyPlayers.length - 1]);

		socket.on("disconnect", packet => this._onDisconnect(socket, packet));
		socket.on("challenge", packet => this._onStart(socket, packet));
		socket.on("action", packet => this._onPlayerAction(socket, packet));
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
					socket.to("room-" + i).emit("end", this.lobbyPlayers);
					this.lobbyPlayers.push({id: this.gamePlayers[i][1].id, name: this.gamePlayers[i][1].name});
					this.gameRooms[i] = false;
					this.gamePlayers[i] = [{id: null, name : null},{id: null, name : null}];

				}
				else if(socket.id == this.gamePlayers[i][1].id){
					trace("DISCONNECT P2", "room-" + i);
					this._io.emit("newplayer", this.gamePlayers[i][0]);
					socket.to("room-" + i).emit("end", this.lobbyPlayers);
					this.lobbyPlayers.push({id: this.gamePlayers[i][0].id, name: this.gamePlayers[i][0].name});
					this.gameRooms[i] = false;
					this.gamePlayers[i] = [{id: null, name : null},{id: null, name : null}];
				}
			}
		}
	}

	_onStart(socket, packet){//packet = Name Player 2
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
		
		this.gameState[roomId] = 1;

		this._io.to("room-" + (roomId)).emit("state", this.boards[roomId]);
		this._io.to(socket.id).emit("start", 1);
		this._io.to(opponentId).emit("start", 2);

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

		var gameLoop = setInterval(() => {
			for(let i = 0; i < this.boards[roomId].length; i++){
				this.boards[roomId][i].move(this.boards[roomId]);
				for(let j = 0; j<this.boards[roomId].length; j++){
					if(i != j)
						this.boards[roomId][i].collideWith(this.boards[roomId][j], this.holes);
				}
			}
			this._io.to("room-" + (roomId)).emit("state", this.boards[roomId]);
			if(this.boards[roomId][14].out){
				var players = [this.gamePlayers[roomId][0].name, this.gamePlayers[roomId][1].name];
				this._io.emit("newplayers", players);
				this._io.to("room-" + (roomId)).emit("end", this.lobbyPlayers);
				this._io.to(this.gamePlayers[roomId][1].id).emit("newplayer", this.gamePlayers[roomId][0]);
				this._io.to(this.gamePlayers[roomId][0].id).emit("newplayer", this.gamePlayers[roomId][1]);
				this.lobbyPlayers.push({id: this.gamePlayers[roomId][0].id, name: this.gamePlayers[roomId][0].name});
				this.lobbyPlayers.push({id: this.gamePlayers[roomId][1].id, name: this.gamePlayers[roomId][1].name});
				this.gameRooms[roomId] = false;
				this.gamePlayers[roomId] = [{id: null, name : null},{id: null, name : null}];
				clearInterval(gameLoop);
			}
		}, 1000 / 80);
	}

	_onPlayerAction(socket, packet){
		trace("Action received", packet, socket.id);
		var roomId = 0;

		for(let i=0 ; i<this.gamePlayers.length ; i++){
			if(socket.id == this.gamePlayers[i][0].id && this.gameState[roomId] == 1 && this._notMovingBalls(roomId) || socket.id == this.gamePlayers[i][1].id && this.gameState[roomId] == -1 && this._notMovingBalls(roomId)){
				roomId = i;

				if(!this.boards[roomId][15].out){
					var power = packet[0];
					var angle = packet[1];
					this.boards[roomId][15].vx = Math.cos(angle)*power;
					this.boards[roomId][15].vy = Math.sin(angle)*power;
					this.boards[roomId][15].ismoving = true;
					this.gameState[roomId] *= -1;
				}
				else{
					let x = packet[0];
					let y = packet[1];
					if(this._checkBall(x, y, this.boards[roomId][15], this.boards[roomId], this.holes)==true){
						this.boards[roomId][15].x = x;
						this.boards[roomId][15].y =y;
						this.boards[roomId][15].out=false;
					}
				}
			}
		}
	}

	_notMovingBalls(roomId){
		for(let i = 0; i<this.boards[roomId].length; i++){
			if(this.boards[roomId][i].ismoving)
				return false;
		}
		return true;
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

	_checkBall(x,y,whiteball,balls,holes){
		for(var i=0; i<balls.length; i++){
			if(whiteball.whiteCollideWith(x,y,balls[i],holes)==true){
				whiteball.x = 0;
				whiteball.y = 0;
				return false;
			}
		}
		return true;
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
			if(this.x < 76){
				this.vx = -this.vx; this.vx *= 0.95;
				this.x = 77;
			}
			if(this.x > 1424){
				this.vx = -this.vx; this.vx *= 0.95;
				this.x = 1423;
			}
			if(this.y < 76){
				this.vy = -this.vy; this.vy *= 0.95;
				this.y = 77;
			}
			if(this.y > 748){
				this.vy = -this.vy; this.vx *= 0.95;
				this.y = 747;
			}
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

	collideWith(second_ball, holes){
		if(second_ball.ismoving==false && this.ismoving==false)
			return;
		let tx = (this.x + (this.x*0.01));
		let ty = (this.y + (this.y*0.01));
		let fx = (second_ball.x + (second_ball.x*0.01));
		let fy = (second_ball.y + (second_ball.y*0.01));
		let dx = fx - tx;
		let dy = fy - ty;
		let distance = Math.sqrt(dx * dx + dy * dy);

		for(var i=0; i<holes.length; i++){
			var distance_ = Math.sqrt((this.x-holes[i].x)*(this.x-holes[i].x) + (this.y-holes[i].y)*(this.y-holes[i].y));
			if( distance_ < (this.radius+holes[i].radius)){
				this.ismoving=0;
				this.out=true;
				this.x=0; this.y=0;
				return true;
			}
		}

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

	whiteCollideWith(x,y,second_ball,holes){
		/*Left and Right*/ if(x < 55+25 || x > 1395+25){ return true;}
		/*Top and Bottom*/ if(y < 55+25 || y > 717+25){ return true;}
		
		let tx = (x + (x*0.01));
		let ty = (y + (y*0.01));
		let fx = (second_ball.x + (second_ball.x*0.01));
		let fy = (second_ball.y + (second_ball.y*0.01));
		let dx = fx - tx;
		let dy = fy - ty;
		let distance = Math.sqrt(dx * dx + dy * dy);

		for(let i=0; i<holes.length; i++){
			let distance_ = Math.sqrt((x-holes[i].x)*(x-holes[i].x) + (y-holes[i].y)*(y-holes[i].y));
			if( distance_ < (this.radius+holes[i].radius)){
				return true;
			}
		}
		if(this!=second_ball && (distance < this.radius*2) ){
			return true;
		}
		return false;
	}
}