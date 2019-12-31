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
		trace("yay IO connected");
		this.io.on("dummy", packet => this.onDummyData(packet)); // listen to "dummy" messages
		this.io.emit("dummy", {value: "dummy data from client"}) // send test message
		this.io.on("login", packet => this.onLoginData(packet));
	}

	/**
	 * @method onDummyData : dummy data received from io server
	 * @param {Object} data
	 */
	onDummyData(data){
		trace("IO data", data);
		this.mvc.controller.ioDummy(data); // send it to controller
	}

	onLoginData(data){
		trace("Logged in", data);
		this.mvc.controller.ioWait(); // send it to controller
	}
}

class MyModel extends Model {

	constructor() {
		super();
		this.players = {};
	}

	async initialize(mvc) {
		super.initialize(mvc);
	}

	async data() {
		trace("get data");
		// keep data in class variable ? refresh rate ?
		let result = await Comm.get("data"); // wait data from server
		return result.response; // return it to controller
	}

	/*async login() {
		trace("get name");
		// keep data in class variable ? refresh rate ?
		let name = await Comm.get("data"); // wait data from server
		return name.response; // return it to controller
	}*/

}

class MyView extends View {

	constructor() {
		super();
		this.table = null;
	}

	initialize(mvc) {
		super.initialize(mvc);

		// create get test btn
		this.btn = document.createElement("button");
		this.btn.innerHTML = "get test";
		this.stage.appendChild(this.btn);

		// create io test btn
		this.iobtn = document.createElement("button");
		this.iobtn.innerHTML = "io test";
		this.stage.appendChild(this.iobtn);

		// io random value display
		this.iovalue = document.createElement("div");
		this.iovalue.innerHTML = "no value";
		this.stage.appendChild(this.iovalue);

		// get dataset display
		this.table = document.createElement("table");
		this.stage.appendChild(this.table);

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

		//load background
		/*this.cvs = document.createElement("canvas");
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

	//this.stage.appendChild(this.gege);*/

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
		this.getBtnHandler = e => this.btnClick(e);
		this.btn.addEventListener("click", this.getBtnHandler);

		this.ioBtnHandler = e => this.ioBtnClick(e);
		this.iobtn.addEventListener("click", this.ioBtnHandler);

		this.submitHandler = e => this.submitName(e);
		this.submitInput.addEventListener("click", this.submitHandler);
	}

	removeListeners() {
		this.btn.removeEventListener("click", this.getBtnHandler);
		this.iobtn.removeEventListener("click", this.ioBtnHandler);
	}

	btnClick(event) {
		this.mvc.controller.btnWasClicked("more parameters"); // dispatch
	}

	ioBtnClick(event) {
		this.mvc.controller.ioBtnWasClicked("io parameters"); // dispatch
	}

	submitName(event){
		this.mvc.controller.submitName(document.getElementById("name").value);
	}

	update(data) {
		while(this.table.firstChild) this.table.removeChild(this.table.firstChild); // empty table
		data.forEach(el => { // loop data
			let line = document.createElement("tr"); // create line
			Object.keys(el).forEach(key => { // loop object keys
				let cell = document.createElement("td"); // create cell
				cell.innerHTML = el[key]; // display
				line.appendChild(cell); // add cell
			});
			this.table.appendChild(line); // add line
		});
	}

	wait(){
		this.stage.innerHTML = "";
		this.stage.appendChild(document.createTextNode("En attente d'un autre joueur"));
	}
}

class MyController extends Controller {

	constructor() {
		super();
	}

	initialize(mvc) {
		super.initialize(mvc);

	}

	async btnWasClicked(params) {
		trace("btn click", params);
		this.mvc.view.update(await this.mvc.model.data()); // wait async request > response from server and update view table values
	}

	async ioBtnWasClicked(params) {
		trace("io btn click", params);
		this.mvc.app.io.emit("dummy", {message: "dummy io click"}); // send socket.io packet
	}

	async submitName(params){
		trace("submit btn click", params);
		this.mvc.app.io.emit("login", params);
		//this.mvc.view.update(await this.mvc.model.login());
	}

	ioDummy(data) {
	}

	ioWait(){
		this.mvc.view.wait();
	}

}