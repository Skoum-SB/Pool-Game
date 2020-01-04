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
		this.io.on("start", packet => this.onStart(packet));
	}

	onLogin(data){
		this.mvc.controller.getPlayers(data);
		this.io.on("newplayer", packet => this.onNewPlayer(packet));
		this.io.on("playerDisconnected", packet => this.onDisconnectedPlayer(packet));
	}

	onNewPlayer(data){
		this.mvc.controller.getNewPlayer(data);
		trace("Newcomer !!!");
	}

	onDisconnectedPlayer(data){
		this.mvc.controller.getDCPlayer(data);
		trace("DC", data);
	}

	onStart(data){
		trace("Starting the game", data);
		this.mvc.controller.ioStart(); // send it to controller
	}
}

class MyModel extends Model {

	constructor() {
		super();
		this.players = [];
	}

	async initialize(mvc) {
		super.initialize(mvc);
	}

	/*async data() {
		trace("get data");
		// keep data in class variable ? refresh rate ?
		let result = await Comm.get("data"); // wait data from server
		return result.response; // return it to controller
	}*/

	login(name){
		this.players.push(name);
	}

	addOtherPlayers(otherPlayers){
		var names = [];
		otherPlayers.forEach(player => {
			names.push((player.name));
		});
		this.players = this.players.concat(names);
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
		

		var text = document.createTextNode('Your Name');
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

	// deactivate
	deactivate() {
		super.deactivate();
		this.removeListeners();
	}

	addListeners() {
		/*this.getBtnHandler = e => this.btnClick(e);
		this.btn.addEventListener("click", this.getBtnHandler);

		this.ioBtnHandler = e => this.ioBtnClick(e);
		this.iobtn.addEventListener("click", this.ioBtnHandler);*/

		this.submitHandler = e => this.submitName(e);
		this.submitInput.addEventListener("click", this.submitHandler);

		this.unloadHandler = e => this.unload(e);
		this.stage.addEventListener("unload", this.unloadHandler);
	}

	removeListeners() {
		/*this.btn.removeEventListener("click", this.getBtnHandler);
		this.iobtn.removeEventListener("click", this.ioBtnHandler);*/
	}

	/*btnClick(event) {
		this.mvc.controller.btnWasClicked("more parameters"); // dispatch
	}

	ioBtnClick(event) {
		this.mvc.controller.ioBtnWasClicked("io parameters"); // dispatch
	}*/

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

		document.getElementById("ownName").innerHTML = "Vous : " + data[0];

		for(var i = 1 ; i < data.length ; i++){
			let line = document.createElement("tr"); // create line
			let cell = document.createElement("td"); // create cell
			cell.innerHTML = data[i]; // display
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

	waitAnswer(){
		this.stage.innerHTML = "";
		this.stage.appendChild(document.createTextNode("En attente de la réponse de votre adversaire"));
	}

	startGame(){
		this.stage.innerHTML = "";
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

		//ball
		//this.gege = new Ball(100,100,1,1,10);

		var canvas = document.createElement("canvas");
		var ctex = canvas.getContext("2d");
		var image = document.createElement("yellowball.png");

		//ctex.drawImage(image, 33, 71);
		//this.stage.appendChild(this.gege);
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

	async submitName(params){
		trace("submit btn click", params);
		await this.mvc.model.login(params);
		this.mvc.app.io.emit("login", params);
		this.mvc.view.lobby();
	}

	async disconnect(){
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

	ioStart(){
		this.mvc.view.startGame();
	}

	challenge(opponent){
		trace(opponent);
		this.mvc.app.io.emit("challenge", this.mvc.model.players[opponent]);
		this.mvc.view.waitAnswer();
	}

}
