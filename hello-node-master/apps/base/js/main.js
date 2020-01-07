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
		this.stick = new Stick(this.area, this.whiteball.x, this.whiteball.y);

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
		this.force = 0;
		this.increase = 2;

		this.strikeSound = new Audio("sound/Strike.wav");
		this.ballCollideSound = new Audio("sound/BallsCollide.wav");

		this.display = () => {

		 this.area.clear();
		 this.area.draw(this.image);
		 for (let i = 0; i < this.balls.length; i++) {
         this.balls[i].draw();
				 this.balls[i].move(this.balls);
				 for(let j = 0; j<this.balls.length; j++){
					 if(this.balls[i].collideWith(this.balls[j],this.holes)){
						 this.ballCollideSound.cloneNode().play();
					 }
				 }
     }
		 if(this.allBallNotMoving(this.balls) && !this.whiteball.out){
			this.mvc.controller.shoot = false;
			this.stick.x=this.whiteball.x;
			this.stick.y=this.whiteball.y;
			this.stick.draw();

			if(!this.mvc.controller.mouse_down && !this.mvc.controller.shoot){
				this.force+=this.increase;
				if(this.force == 150){
					this.increase = -this.increase;
				}
				if(this.force == 0){
					this.increase = -this.increase;
				}
					this.stick.origin += this.increase;
				}
			}
		 requestAnimationFrame(this.display);
 	 }
	 this.display();

	}

	allBallNotMoving(balls){
	//	trace("cheeckingg",balls[i]);
		for(var i=0; i<balls.length; i++){
			if(balls[i].ismoving){
				return false;
			}
		}
		return true;
	}

	canClick(){
	  for(let i = 0; i<this.balls.length; i++){
	    if(this.balls[i].ismoving){
	      return false;
	    }
	  }
	  return true;
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
		this.mouse_down = false;
		this.shoot = false;

		this.mvc.model.area.cvs.onmousemove = () => {
				if(this.mouse_down){
					var opposite = window.event.pageY - (this.mvc.model.stick.y*this.mvc.model.area.scaley);
					var adjacent = window.event.pageX - (this.mvc.model.stick.x*this.mvc.model.area.scalex);
					this.mvc.model.stick.rotation = Math.atan2(opposite, adjacent);
				}
				this.mvc.model.area.cvs.onmousedown = () => {
					this.mouse_down = true;
				}
				this.mvc.model.area.cvs.onmouseup = () => {
					this.mouse_down = false;
				}
		}
		this.mvc.model.area.cvs.ondblclick = () => {
			this.mvc.model.strikeSound.play();
			this.mvc.model.stick.origin = 960;
			this.shoot = true;
			setTimeout(() => { this.mvc.model.stick.out = true; }, 2000);
			console.log(this.mvc.model.force);
			if(!this.mvc.model.whiteball.out){
				let power =this.mvc.model.force/3;
				let angle = Math.atan2(window.event.pageY - (this.mvc.model.whiteball.y*this.mvc.model.area.scaley), window.event.pageX - (this.mvc.model.whiteball.x*this.mvc.model.area.scalex));
				this.mvc.model.whiteball.vx = Math.cos(angle)*power;
				this.mvc.model.whiteball.vy = Math.sin(angle)*power;
				this.mvc.model.whiteball.ismoving = true;
			}
			else{
				var x = window.event.pageX / this.mvc.model.area.scalex;
				var y = window.event.pageY / this.mvc.model.area.scaley;
				if(this.checkBall(x,y,this.mvc.model.whiteball,this.mvc.model.balls,this.mvc.model.holes)==true){
					this.mvc.model.whiteball.x = x;
					this.mvc.model.whiteball.y =y;
					this.mvc.model.whiteball.out=false;
				}
			}

		}
	}


	 checkBall(x,y,whiteball,balls,holes){
		for(var i=0; i<balls.length; i++){
			if(whiteball.whiteCollideWith(x,y,balls[i],holes)==true){
				trace("nope again");
				whiteball.x =0;
				whiteball.y =0;
				return false
			}
		}
		return true;
	}

	increaseForce(){

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
