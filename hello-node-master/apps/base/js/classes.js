class Ball{

  constructor (x, y, color){
    this.initx = x;
    this.inity = y;
    this.x;
    this.y;
    this.out = false;
    this.color = color;
    this.image = document.createElement("img");
    this.image.src = "images/" + this.color + "ball.png";
  }
}

class Stick{
  force;
  angle;

  constructor (force, angle){
    this.force = force;
    this.angle = angle;
  }

  get force(){ return this.force;}
  get angle(){ return this.angle;}

}

class Player{
  name;
  score;
  team;

  cosntructor (name, score, team){
    this.name = name;
    this.score = score;
    this.team = team;
  }

  get name(){ return this.name;}
  get score(){ return this.score;}
  get team(){ return this.team;}

}
