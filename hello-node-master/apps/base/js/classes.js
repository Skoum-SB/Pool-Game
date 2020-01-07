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
		this.image = document.createElement("img");
		this.area = area;
	}
	draw(){
		if(!this.out){
			this.area.draw(this.image, this.x-25, this.y-25);
			this.image.src = "images/" + this.color + "ball.png";
		}
	}
}

class Stick{
	constructor (area, x, y){
		this.area = area;
		this.x = x;
		this.y = y;
		this.image = document.createElement("img");
		this.image.src = "images/stick.png";
		this.rotation = 0;
		this.origin = 970;
		this.out = false;
	}

	draw(rotate){
    if(!this.out){
      this.area.draw(this.image, this.x-this.origin, this.y-11, this.rotation, this.origin);
    }
	}
}

class Player{
  constructor(area,x,y){
    this.number;
    this.name;
    this.area = area;
    this.color="black";
    this.x = x;
    this.y = y;
    this.ballOut;
    this.image = document.createElement("img");
    this.image.src = "images/profil.png";
  }

  draw(){
    this.area.draw_icon(this.image,this.x,this.y,this.name,this.ballOut,this.color);
  }
}
