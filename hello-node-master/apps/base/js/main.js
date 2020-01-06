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

	/**
	 * @method test : test server GET fetch
	 */
	async test() {
		console.log("test server hello method");
		let result = await Comm.get("hello/everyone"); // call server hello method with argument "everyone"
		console.log("result", result);
		console.log("response", result.response);
	}

	/**
	 * @method onIOConnect : socket is connected
	 */
	onIOConnect() {
		this.io.on("players", packet => this.onLogin(packet));
	}

	onLogin(data){
		this.mvc.controller.getPlayers(data);
		this.io.on("newplayer", packet => this.onNewPlayer(packet));
		this.io.on("playerDisconnected", packet => this.onDisconnectedPlayer(packet));
		this.io.on("start", packet => this.onStart(packet));
		this.io.on("playersInGame", packet => this.onPlayersInGame(packet));
	}

	onNewPlayer(data){
		this.mvc.controller.getNewPlayer(data);
		trace("Newcomer !!!");
	}

	onDisconnectedPlayer(data){
		this.mvc.controller.getDCPlayer(data);
		trace("DC", data);
	}

	onStart(room){
		trace("Starting the game", room);
		this.mvc.controller.start(room); // send it to controller
		this.io.removeAllListeners();
		this.io.on("playerLeft", packet => this.onplayerLeft(packet));
	}

	onPlayersInGame(players){
		this.mvc.controller.playersInGame(players);
	}

	onplayerLeft(players){
		trace("Disconnected player");
		this.mvc.controller.playerLeftGame(players);
		this.io.on("newplayer", packet => this.onNewPlayer(packet));
		this.io.on("playerDisconnected", packet => this.onDisconnectedPlayer(packet));
		this.io.on("start", packet => this.onStart(packet));
		this.io.on("playersInGame", packet => this.onPlayersInGame(packet));
	}
}

class MyModel extends Model {

	constructor() {
		super();
	}

	async initialize(mvc) {
		super.initialize(mvc);

		this.name = "";
		this.players = [];
		this.room = 0;

		this.area = new Area();
		this.image = document.createElement("img");
		this.image.src = 'images/sprbackground4.png';

		this.redballs = [
		new Ball(this.area, 1056,433,"red"),
		new Ball(this.area, 1090,374,"red"),
		new Ball(this.area, 1126,393,"red"),
		new Ball(this.area, 1126,472,"red"),
		new Ball(this.area, 1162,335,"red"),
		new Ball(this.area, 1162,374,"red"),
		new Ball(this.area, 1162,452,"red")
		];

		this.yellowballs = [
		new Ball(this.area, 1022,413,"yellow"),
		new Ball(this.area, 1056,393,"yellow"),
		new Ball(this.area, 1090,452,"yellow"),
		new Ball(this.area, 1126,354,"yellow"),
		new Ball(this.area, 1126,433,"yellow"),
		new Ball(this.area, 1162,413,"yellow"),
		new Ball(this.area, 1162,491,"yellow")
		];

		this.whiteball = new Ball(this.area, 413,413,"white");
		this.blackball = new Ball(this.area, 1090,413,"black");

		this.balls = [
			this.yellowballs[0],
			this.yellowballs[1],
			this.yellowballs[2],
			this.yellowballs[3],
			this.yellowballs[4],
			this.yellowballs[5],
			this.yellowballs[6],
			this.redballs[0],
			this.redballs[1],
			this.redballs[2],
			this.redballs[3],
			this.redballs[4],
			this.redballs[5],
			this.redballs[6],
			this.blackball,
			this.whiteball
		];


	}

	/*async data() {
		trace("get data");
		// keep data in class variable ? refresh rate ?
		let result = await Comm.get("data"); // wait data from server
		return result.response; // return it to controller
	}*/

	login(name){
		this.name = name;
	}

	addOtherPlayers(otherPlayers){
		var names = [];
		otherPlayers.forEach(player => {
			names.push((player.name));
		});
		this.players = names;
	}

	addNewPlayer(newPlayer){
		this.players.push(newPlayer.name);
	}

	removePlayer(playerName){
		trace(playerName);
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i] == playerName){
				this.players.splice(i, 1);
			}
		}
	}

	changeRoom(room){
		this.room = room;
	}

}

class MyView extends View {

	constructor() {
		super();
	}

	initialize(mvc) {
		super.initialize(mvc);

		/*// create get test btn
		this.btn = document.createElement("button");
		this.btn.innerHTML = "get test";
		this.stage.appendChild(this.btn);

		// create io test btn
		this.iobtn = document.createElement("button");
		this.iobtn.innerHTML = "io test";
		this.stage.appendChild(this.iobtn);*/

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

		//this.stage.appendChild(this.mvc.model.area.cvs);
	}


	// activate UI
	activate() {
		super.activate();
		this.addListeners(); // listen to events
	}

	// deactivate
	deactivate() {
		super.deactivate();
		this.removeListeners();
	}

	addListeners() {
		this.submitHandler = e => this.submitName(e);
		this.submitInput.addEventListener("click", this.submitHandler);

		this.unloadHandler = e => this.unload(e);
		this.stage.addEventListener("unload", this.unloadHandler);
	}

	removeListeners() {
		/*this.btn.removeEventListener("click", this.getBtnHandler);
		this.iobtn.removeEventListener("click", this.ioBtnHandler);*/
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

		document.getElementById("ownName").innerHTML = "Vous : " + this.mvc.model.name;

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

	/*waitAnswer(){
		this.stage.innerHTML = "";
		this.stage.appendChild(document.createTextNode("En attente de la réponse de votre adversaire"));
	}*/

	startGame(){
		/*this.stage.innerHTML = "";
		this.stage.appendChild(document.createTextNode("Vous êtes dans la Room N°" + (this.mvc.model.room + 1)));
		this.cvs = document.createElement("canvas");
		this.ctx = this.cvs.getContext("2d");
		this.img = document.createElement("img");
		this.img.src = 'images/sprbackground4.png';

		this.img.onload = () => {
			this.imageRatio = window.innerHeight/this.img.naturalHeight;
			this.ratio = window.innerWidth/this.img.naturalWidth;
			this.cvs.width = window.innerWidth;
			this.cvs.height = window.innerHeight;
			if(this.img.naturalHeight*this.ratio > window.innerHeight-40){
				console.log("Oui");
				this.width = this.img.naturalWidth*this.imageRatio-40;
				this.height = this.img.naturalHeight*this.imageRatio-40;
			}
			else{
				this.width = this.img.naturalWidth*this.ratio;
				this.height = this.img.naturalHeight*this.ratio;
			}
			this.ctx.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight, 0, 0, this.width, this.height);
		}

		window.onresize = () => {
			this.img.onload();
		};

		this.stage.appendChild(this.cvs);

		var canvas = document.createElement("canvas");
		var ctex = canvas.getContext("2d");
		var image = document.createElement("yellowball.png");
		*/
		this.stage.style.backgroundColor = "black";
		this.stage.innerHTML = "";

		this.stage.appendChild(this.mvc.model.area.cvs);
		this.mvc.model.area.cvs.onclick = () => {this.mvc.controller.playerClick(window.event.pageX, window.event.pageY)};

		this.display = () => {
			this.mvc.model.image.onload;
			trace("yep");
			this.mvc.model.area.clear();
			this.mvc.model.area.draw(this.mvc.model.image);
			for(let i = 0; i < this.mvc.model.balls.length; i++)
				this.mvc.model.balls[i].draw();
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

	/*async btnWasClicked(params) {
		trace("btn click", params);
		//this.mvc.view.update(await this.mvc.model.data()); // wait async request > response from server and update view table values
	}

	async ioBtnWasClicked(params) {
		trace("io btn click", params);
		this.mvc.app.io.emit("dummy", {message: "dummy io click"}); // send socket.io packet
	}*/

	submitName(name){
		trace("submit btn click", name);
		this.mvc.model.login(name);
		this.mvc.app.io.emit("login", name);
		this.mvc.view.lobby();
	}

	disconnect(){
		this.mvc.app.io.emit("disconnect");
	}

	getPlayers(players){
		this.mvc.model.addOtherPlayers(players);
		this.mvc.view.update();
	}

	getNewPlayer(player){
		this.mvc.model.addNewPlayer(player);
		this.mvc.view.update();
	}

	getDCPlayer(playerName){
		this.mvc.model.removePlayer(playerName);
		this.mvc.view.update();
	}

	playersInGame(players){
		this.mvc.model.removePlayer(players[0]);
		this.mvc.model.removePlayer(players[1]);
		this.mvc.view.update();
	}

	start(room){
		this.mvc.model.changeRoom(room);
		this.mvc.view.startGame();
		//this.mvc.view.display();
	}

	challenge(opponent){
		trace(opponent);
		this.mvc.app.io.emit("challenge", this.mvc.model.players[opponent]);
		//this.mvc.view.waitAnswer();
	}

	playerLeftGame(players){
		this.mvc.view.lobby();
		this.getPlayers(players);
	}

	playerClick(clickX, clickY){
		let power = 10;
		let angle = Math.atan2(clickY - (this.mvc.model.whiteball.y*this.mvc.model.area.scaley), clickX - (this.mvc.model.whiteball.x*this.mvc.model.area.scalex));
		this.mvc.model.whiteball.vx = Math.cos(angle)*power;
		this.mvc.model.whiteball.vy = Math.sin(angle)*power;
		console.log(window.event.pageY*this.mvc.model.area.scaley);
		this.mvc.model.whiteball.move(this.mvc.model.balls);
	}
}
