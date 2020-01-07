window.addEventListener("load", event => new Base());

class Base {

	constructor() {
		console.log("loaded");

		this.initialize();
	}

	async initialize() {

		this.iospace = "baseapp"; // IO namespace for this app
		this.io = io.connect("http://localhost/" + this.iospace); // connect socket.io
		this.io.on("connect", () => this.onIOConnect()); // listen connect event

		this.mvc = new MVC("myMVC", this, new MyModel(), new MyView(), new MyController()); // init app MVC
		await this.mvc.initialize(); // run init async tasks
		this.mvc.view.attach(document.body); // attach view
		this.mvc.view.activate(); // activate user interface

	}

	onIOConnect() {
		this.io.on("players", packet => this.onLogin(packet));
	}

	onLogin(data){
		this.mvc.controller.getPlayers(data);
		this.io.on("newplayer", packet => this.onNewPlayer(packet));
		this.io.on("newplayers", packet => this.onNewPlayers(packet));
		this.io.on("playerDisconnected", packet => this.onDisconnectedPlayer(packet));
		this.io.on("start", packet => this.onStart(packet));
		this.io.on("state", packet => this.onGameState(packet));
		this.io.on("playersInGame", packet => this.onPlayersInGame(packet));
	}

	onNewPlayer(data){
		this.mvc.controller.getNewPlayer(data);
		trace("Newcomer !!!");
	}

	onNewPlayers(data){
		this.mvc.controller.getNewPlayers(data);
		trace("Newcomers !!!");
	}

	onDisconnectedPlayer(data){
		this.mvc.controller.getDCPlayer(data);
		trace("DC", data);
	}

	onStart(numPlayer){
		trace("You are the player n°" , numPlayer);
		this.io.removeAllListeners();
		this.io.on("state", packet => this.onGameState(packet));
		this.io.on("end", packet => this.onEnd(packet));
		this.io.on("sound", packet => this.mvc.controller.sound(packet));
		this.mvc.controller.start(numPlayer);
	}

	onGameState(gameData){
		//trace("Receiving State");
		this.mvc.controller.gameState(gameData); // send it to controller

	}

	onPlayersInGame(players){
		this.mvc.controller.playersInGame(players);
	}

	onEnd(players){
		this.io.on("newplayer", packet => this.onNewPlayer(packet));
		this.io.on("newplayers", packet => this.onNewPlayers(packet));
		this.io.on("playerDisconnected", packet => this.onDisconnectedPlayer(packet));
		this.io.on("start", packet => this.onStart(packet));
		this.io.on("state", packet => this.onGameState(packet));
		this.io.on("playersInGame", packet => this.onPlayersInGame(packet));
		this.mvc.controller.end(players);
	}
}

class MyModel extends Model {

	constructor() {
		super();
	}

	async initialize(mvc) {
		super.initialize(mvc);

		this.turn = 1;


		this.area = new Area();
		this.image = document.createElement("img");
		this.image.src = 'images/sprbackground4.png';

		this.currentPlayer = new Player(this.area,220,5);
		this.opponent = new Player(this.area,220,770);
		this.currentPlayer.ballOut = 0;
		this.opponent.ballOut = 0;
		this.balls = (function () {var array = []; for(var i=0 ; i < 16 ; i++){array.push(new Ball);} return array;})();

		this.balls.forEach(ball => {
			ball.image = document.createElement("img");
			ball.area = this.area;
		});

		this.stick = new Stick(this.area, this.balls[15].x, this.balls[15].y);
		this.force = 0;
		this.increase = 2;

		this.strikeSound = new Audio("sound/Strike.wav");
		this.ballCollideSound = new Audio("sound/BallsCollide.wav");
		this.holeSound = new Audio("sound/Hole.wav");

		this.mouse_down = false;
		this.shoot = false;
	}
}

class MyView extends View {

	constructor() {
		super();
	}

	initialize(mvc) {
		super.initialize(mvc);

		var text = document.createTextNode('Votre Pseudo :');
		this.stage.appendChild(text);
		this.stage.appendChild(document.createElement("br"));

		this.nameInput = document.createElement("input");
		this.nameInput.id = "name";
		this.nameInput.setAttribute('type',"text");
		this.stage.appendChild(this.nameInput);

		this.submitInput = document.createElement("button");
		this.submitInput.innerHTML = "Valider";

		this.stage.appendChild(this.submitInput);
	}


	// activate UI
	activate() {
		super.activate();
		this.addListeners(); // listen to events
	}


	addListeners() {
		this.submitHandler = e => this.submitName(e);
		this.submitInput.addEventListener("click", this.submitHandler);

		this.unloadHandler = e => this.unload(e);
		this.stage.addEventListener("unload", this.unloadHandler);
	}

	submitName(event){
		this.mvc.controller.submitName(document.getElementById("name").value);
	}

	unload(event){
		this.mvc.controller.disconnect();
	}

	update(){
		while(this.table.firstChild) this.table.removeChild(this.table.firstChild); // empty table
		var data = this.mvc.model.players;
		trace(data);

		document.getElementById("ownName").innerHTML = "Vous : " + this.mvc.model.currentPlayer.name;

		for(var i = 0 ; i < data.length ; i++){
			let line = document.createElement("tr"); // create line
			let cell = document.createElement("td"); // create cell
			cell.innerHTML = data[i];
			line.appendChild(cell); // add cell

			cell = document.createElement("td"); //second cell
			let btn = document.createElement("button");
			btn.innerHTML = "Défier";
			btn.id = i;
			btn.onclick = () => {this.mvc.controller.challenge(btn.id)};
			cell.appendChild(btn);
			line.appendChild(cell);

			this.table.appendChild(line); // add line
		}
	}

	lobby(){
		this.stage.style.backgroundColor = "white";
		this.stage.innerHTML = "";
		this.stage.appendChild(document.createTextNode("Joueurs actuellement disponibles :"));
		this.stage.appendChild(document.createElement("br"));
		this.stage.appendChild(document.createElement("br"));

		var ownName = document.createElement("b");
		ownName.id = "ownName";
		this.stage.appendChild(ownName);

		this.stage.appendChild(document.createElement("br"));
		this.stage.appendChild(document.createElement("br"));

		this.stage.appendChild(document.createTextNode("Autres joueurs :"));

		this.stage.appendChild(document.createElement("br"));
		this.stage.appendChild(document.createElement("br"));

		this.table = document.createElement("table");
		this.stage.appendChild(this.table);
	}

	allBallsNotMoving(){
		for(var i=0; i<this.mvc.model.balls.length; i++){
			if(this.mvc.model.balls[i].ismoving){
				return false;
			}
		}
		return true;
	}

	playSound(sound){
		if(sound == 1)
			this.mvc.model.ballCollideSound.cloneNode().play();
		else
			this.mvc.model.holeSound.cloneNode().play();
	}

	printGame(){
		this.stage.style.backgroundColor = "black";
		this.stage.innerHTML = "";
		console.log("Turn ", this.mvc.model.turn);

		this.stage.appendChild(this.mvc.model.area.cvs);
		this.mvc.model.area.cvs.ondblclick = () => {this.mvc.controller.playerClick(window.event.pageX, window.event.pageY)};
		this.mvc.model.area.cvs.onmousemove = () => {this.mvc.controller.playerMove(window.event.pageX, window.event.pageY)};


		this.display = () => {
			this.mvc.model.area.clear();
			this.mvc.model.area.draw(this.mvc.model.image);
			this.mvc.model.currentPlayer.draw();
		 	//this.mvc.model.currentPlayer.color="red";

			this.mvc.model.opponent.draw();
		 	//this.opponent.color="yellow";
			for (let i = 0; i < this.mvc.model.balls.length; i++) {
				this.mvc.model.balls[i].draw();
			}

			if(this.mvc.model.turn != this.mvc.model.currentPlayer.number){
				console.log("Current Player == ", this.mvc.model.currentPlayer.number);
				console.log("Current Turn == ", this.mvc.model.turn);
				this.mvc.model.stick.out = true;
			}
			else{
				this.mvc.model.stick.out = false;
			}

			if(this.allBallsNotMoving(this.mvc.model.balls) && !this.mvc.model.balls[15].out){
				this.mvc.model.stick.out = false;
				this.mvc.model.shoot = false;
				this.mvc.model.stick.x=this.mvc.model.balls[15].x;
				this.mvc.model.stick.y=this.mvc.model.balls[15].y;
				this.mvc.model.stick.draw();

				if(!this.mvc.controller.mouse_down && !this.mvc.controller.shoot){
					this.mvc.model.force+=this.mvc.model.increase;
					if(this.mvc.model.force == 150)
						this.mvc.model.increase = -this.mvc.model.increase;
					if(this.mvc.model.force < 0)
						this.mvc.model.increase = -this.mvc.model.increase;
					this.mvc.model.stick.origin += this.mvc.model.increase;
				}
			}
			requestAnimationFrame(this.display);
		}
		this.display();
	}
}

class MyController extends Controller {

	constructor() {
		super();
	}

	initialize(mvc) {
		super.initialize(mvc);
	}

	submitName(name){
		trace("submit btn click", name);
		this.mvc.model.currentPlayer.name = name;
		this.mvc.app.io.emit("login", name);
		this.mvc.view.lobby();
	}

	disconnect(){
		this.mvc.app.io.emit("disconnect");
	}

	getPlayers(players){
		var names = [];
		players.forEach(player => {
			names.push((player.name));
		});
		this.mvc.model.players = names;
		this.mvc.view.update();
	}

	getNewPlayer(player){
		this.mvc.model.players.push(player.name);
		this.mvc.view.update();
	}

	getNewPlayers(players){
		this.mvc.model.players.push(players[0]);
		this.mvc.model.players.push(players[1]);
		this.mvc.view.update();
	}

	removePlayer(playerName){
		trace(playerName);
		for(var i = 0; i < this.mvc.model.players.length; i++){
			if(this.mvc.model.players[i] == playerName){
				this.mvc.model.players.splice(i, 1);
			}
		}
	}

	getDCPlayer(playerName){
		this.removePlayer(playerName);
		this.mvc.view.update();
	}

	playersInGame(players){
		this.removePlayer(players[0]);
		this.removePlayer(players[1]);
		this.mvc.view.update();
	}

	start(numPlayer){
		this.mvc.model.currentPlayer.number = numPlayer[0];
		this.mvc.model.opponent.number = (numPlayer == 1) ? 0 : 1;
		this.mvc.model.opponent.name =  numPlayer[1];
		this.mvc.model.turn = numPlayer[0];
		this.mvc.view.printGame();
	}

	gameState(gameData){
		//console.log(this.mvc.model.turn);
		this.mvc.model.turn = (this.mvc.model.turn == 1) ? 2 : 1;
		for(var i=0 ; i<gameData.length ; i++)
			Object.assign(this.mvc.model.balls[i], gameData[i]);
	}

	challenge(opponent){
		trace(opponent);
		this.mvc.app.io.emit("challenge", this.mvc.model.players[opponent]);
	}

	end(players){
		this.mvc.view.lobby();
		this.getPlayers(players);
	}

	playerClick(clickX, clickY){
		trace(this.mvc.model.force);
		if(!this.mvc.model.balls[15].out){
			this.mvc.model.shoot = true;
			this.mvc.model.stick.origin = 960;
			setTimeout(() => { this.mvc.model.stick.out = true; }, 2000);
			this.mvc.model.strikeSound.play();
			let power = this.mvc.model.force/3;
			let angle = Math.atan2(clickY - (this.mvc.model.balls[15].y*this.mvc.model.area.scaley), clickX - (this.mvc.model.balls[15].x*this.mvc.model.area.scalex));
			let data = [power, angle];
			this.mvc.app.io.emit("action", data);
			this.mvc.model.stick.origin = 970;
			this.mvc.model.force = 0;
		}
		else{
			var x = window.event.pageX / this.mvc.model.area.scalex;
			var y = window.event.pageY / this.mvc.model.area.scaley;
			this.mvc.model.stick.out = true;
			let data = [x, y];
			this.mvc.app.io.emit("action", data);
		}
	}

	playerMove(mouseX, mouseY){
		if(this.mvc.model.mouse_down){
			var opposite = mouseY - (this.mvc.model.stick.y*this.mvc.model.area.scaley);
			var adjacent = mouseX - (this.mvc.model.stick.x*this.mvc.model.area.scalex);
			this.mvc.model.stick.rotation = Math.atan2(opposite, adjacent);
		}
		this.mvc.model.area.cvs.onmousedown = () => {
			this.mvc.model.mouse_down = true;
		}
		this.mvc.model.area.cvs.onmouseup = () => {
			this.mvc.model.mouse_down = false;
		}
	}

	sound(sound){
		this.mvc.view.playSound(sound);
	}
}
