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
	}

	/**
	 * @method onDummyData : dummy data received from io server
	 * @param {Object} data
	 */
	onDummyData(data) {
		trace("IO data", data);
		this.mvc.controller.ioDummy(data); // send it to controller
	}
}

class MyModel extends Model {

	constructor() {
		super();
	}

	async initialize(mvc) {
		super.initialize(mvc);

		/*this.redballs = [
			new Ball(1056-25,433-26,"red"),
	    new Ball(1090-25,374-26,"red"),
	    new Ball(1126-25,393-26,"red"),
	    new Ball(1126-25,472-26,"red"),
	    new Ball(1162-25,335-26,"red"),
	    new Ball(1162-25,374-26,"red"),
	    new Ball(1162-25,452-26,"red")
		];
		this.yellowballs = [
	    new Ball(1022-25,413-26,"yellow"),
	    new Ball(1056-25,393-26,"yellow"),
	    new Ball(1090-25,452-26,"yellow"),
	    new Ball(1126-25,354-26,"yellow"),
	    new Ball(1126-25,433-26,"yellow"),
	    new Ball(1162-25,413-26,"yellow"),
	    new Ball(1162-25,491-26,"yellow")
    ];*/

		this.whiteball = new Ball(413-25,413-26,"white");
		//this.blackball = new Ball(1065, 387, "black");
	}

	async data() {
		trace("get data");
		// keep data in class variable ? refresh rate ?
		let result = await Comm.get("data"); // wait data from server
		return result.response; // return it to controller
	}

}

class MyView extends View {

	constructor() {
		super();
		this.table = null;
	}

	initialize(mvc) {
		super.initialize(mvc);

		this.stage.style.backgroundColor = "black";

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

		// load sprites
		this.cvs = document.createElement("canvas");
		this.ctx = this.cvs.getContext("2d");
		this.img = document.createElement("img");
		this.img.src = 'images/sprbackground4.png';

		this.img.style.position = "absolute";
		//this.mvc.model.blackball.image.style.position = "absolute";

		this.img.onload = () => {

		   this.ratio = window.innerWidth/this.img.naturalWidth;
		   if(this.img.naturalHeight*this.ratio >= window.innerHeight - this.img.getBoundingClientRect().top){
				 this.ratio = (window.innerHeight - this.img.getBoundingClientRect().top)/this.img.naturalHeight;
		   }
		   else{
				 this.ratio = window.innerWidth/this.img.naturalWidth;
		   }
			 this.img.width = this.img.naturalWidth * this.ratio;
			 this.img.height = this.img.naturalHeight * this.ratio;

			 /*for(let x = 0; x < this.mvc.model.redballs.length; x++){
				 this.mvc.model.redballs[x].draw(this.ratio);
				 this.stage.appendChild(this.mvc.model.redballs[x].image)
			 }
			 for(let x = 0; x < this.mvc.model.yellowballs.length; x++){
				 this.mvc.model.yellowballs[x].draw(this.ratio);
				 this.stage.appendChild(this.mvc.model.yellowballs[x].image)
			 }

			 this.mvc.model.whiteball.draw(this.ratio);
			 this.mvc.model.blackball.draw(this.ratio);*/
			 //this.stage.appendChild(this.mvc.model.whiteball.image);
			 this.mvc.model.whiteball.draw(this.ratio);
		}

		this.stage.appendChild(this.img);
		this.stage.appendChild(this.mvc.model.whiteball.cvs);


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

	update(data) {
		this.mvc.model.whiteball.move(this.ratio, 1, 0);
		//this.stage.appendChild(this.mvc.model.blackball.image);
		/*while(this.table.firstChild) this.table.removeChild(this.table.firstChild); // empty table
		data.forEach(el => { // loop data
			let line = document.createElement("tr"); // create line
			Object.keys(el).forEach(key => { // loop object keys
				let cell = document.createElement("td"); // create cell
				cell.innerHTML = el[key]; // display
				line.appendChild(cell); // add cell
			});
			this.table.appendChild(line); // add line
		});*/
	}

	updateIO(value) {
		this.iovalue.innerHTML = value.toString(); // update io display
	}

}

class MyController extends Controller {

	constructor() {
		super();
	}

	initialize(mvc) {
		super.initialize(mvc);
		this.ratio = this.mvc.view.ratio;
		window.onresize = () => {
			this.mvc.view.img.onload();
		}

	}

	async btnWasClicked(params) {
		trace("btn click", params);
		this.mvc.view.update(await this.mvc.model.data()); // wait async request > response from server and update view table values

	}

	async ioBtnWasClicked(params) {
		trace("io btn click", params);
		this.mvc.app.io.emit("dummy", {message: "dummy io click"}); // send socket.io packet


	}


	ioDummy(data) {
		this.mvc.view.updateIO(data.value); // io dummy data received from main app
	}

}
