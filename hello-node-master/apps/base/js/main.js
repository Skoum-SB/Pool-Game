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
		area.initialize();
		this.image = document.createElement("img");
    this.image.onload;
    this.image.src = 'images/sprbackground4.png';

		this.redBalls = [
      new Ball(516,203,"red"),
      new Ball(533,174,"red"),
      new Ball(550,184,"red"),
      new Ball(550,222,"red"),
      new Ball(567,156,"red"),
      new Ball(567,175,"red"),
      new Ball(567,213,"red")
    ];

    this.yellowBalls = [
      new Ball(499,193,"yellow"),
      new Ball(516,183,"yellow"),
      new Ball(533,212,"yellow"),
      new Ball(550,165,"yellow"),
      new Ball(550,203,"yellow"),
      new Ball(567,194,"yellow"),
      new Ball(567,232,"yellow")
    ];

    this.whiteBall = new Ball(193,193, "white");
    this.blackBall = new Ball(533,193, "black");

    this.balls = [
      this.yellowBalls[0],
      this.yellowBalls[1],
      this.redBalls[0],
      this.redBalls[1],
      this.blackBall,
      this.yellowBalls[2],
      this.yellowBalls[3],
      this.redBalls[2],
      this.yellowBalls[4],
      this.redBalls[3],
      this.redBalls[4],
      this.redBalls[5],
      this.yellowBalls[5],
      this.redBalls[6],
      this.yellowBalls[6],
      this.whiteBall
    ];
		this.display = () => {
		 area.clear();
		 area.draw(this.image);
		 for (var i = 0; i < this.balls.length; i++) {
         this.balls[i].draw();
     }
		 requestAnimationFrame(this.display);
 	 }
	 this.display();

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

		this.stage.appendChild(area.cvs)


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
		var distance = 350;
		var speedx = 2;
		var speedy = 13;
		var slow = (speedx+speedy)/distance;
		window.requestAnimationFrame(() => {this.mvc.model.balls[15].move(speedx, speedy, slow)});
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
