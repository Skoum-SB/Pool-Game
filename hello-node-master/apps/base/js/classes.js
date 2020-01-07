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
  constructor (force, angle){
    this.force = force;
    this.angle = angle;
  }

}

class Player{
  cosntructor (name, score, team){
    this.name = name;
    this.score = score;
    this.team = team;
  }
}
