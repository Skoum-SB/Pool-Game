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
		this.area = new Area();
		this.image = document.createElement("img");
    this.image.onload;
    this.image.src = 'images/sprbackground4.png';
		this.player = new Player();
		this.player.name = "Tamer";
		this.player.team = 1;
		this.turn = 1;
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
			this.whiteball,
			this.blackball
    ];

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
	 //this.stage.appendChild(this.btn);

	 // create io test btn
	 this.iobtn = document.createElement("button");
	 this.iobtn.innerHTML = "io test";
	 //this.stage.appendChild(this.iobtn);

	 // io random value display
	 this.iovalue = document.createElement("div");
	 this.iovalue.innerHTML = "no value";
	 //this.stage.appendChild(this.iovalue);

	 // get dataset display
	 this.table = document.createElement("table");
	 //this.stage.appendChild(this.table);
		// load sprites

		this.display = () => {
		 this.mvc.model.area.clear();
		 this.mvc.model.area.draw(this.mvc.model.image);
		 for (let i = 0; i < this.mvc.model.balls.length; i++) {
         this.mvc.model.balls[i].draw();
				 this.mvc.model.balls[i].move(this.mvc.model.balls);
				 for(let j = i+1; j<this.mvc.model.balls.length; j++){
					 this.mvc.model.balls[i].collideWith(this.mvc.model.balls[j]);
				 }
     }
		 requestAnimationFrame(this.display);
 	 }
	 this.display();

		this.stage.appendChild(this.mvc.model.area.cvs)


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

		this.mvc.model.area.cvs.onclick = () => {
			if(this.canClick() && this.mvc.model.player.team == this.mvc.model.turn){
				let angle = Math.atan2(window.event.pageY - (this.mvc.model.whiteball.y*this.mvc.model.area.scaley), window.event.pageX - (this.mvc.model.whiteball.x*this.mvc.model.area.scalex));
				let power = Math.sqrt(Math.pow(window.event.pageX - (this.mvc.model.whiteball.x*this.mvc.model.area.scalex) ,2) + Math.pow(window.event.pageY - (this.mvc.model.whiteball.y*this.mvc.model.area.scaley), 2))/20;
				this.mvc.model.whiteball.vx = Math.cos(angle)*power;
				this.mvc.model.whiteball.vy = Math.sin(angle)*power;
				this.mvc.model.whiteball.ismoving = true;
				this.mvc.model.turn = (this.mvc.model.turn == 1) ? 2 : 1;
			}
		}
	}

	canClick(){
		for(let i = 0; i<this.mvc.model.balls.length; i++){
			if(this.mvc.model.balls[i].ismoving){
				return false;
			}
		}
		return true;
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
