
class Ball{

  constructor (x, y, color){
    this.x = x;
    this.y = y;
    this.out = false;
    this.color = color;
    this.image = document.createElement("img");
    this.image.src = "images/" + this.color + "ball.png";
  }

  draw(ratio){
    this.image.style.position = "absolute";
    this.image.width = this.image.naturalWidth*ratio;
    this.image.height = this.image.naturalHeight*ratio;
    this.image.style.marginLeft = this.x*ratio + "px";
    this.image.style.marginTop = this.y*ratio + "px";
  }

  moveX(x){
      this.x = this.x+x;
      this.image.style.marginLeft = (this.x)*0.9273333333333333+ x + "px";
  }

  moveY(y){
      this.x = this.x+x;
      this.image.style.marginLeft = (this.x)*0.9273333333333333+ y + "px";
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
