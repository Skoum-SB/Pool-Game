
class Ball{

  constructor (x, y, color){
    this.x = x;
    this.y = y;
    this.out = false;
    this.color = color;
    this.frame = 0;
    this.maxFrame = 60;
    this.cvs = document.createElement("canvas");
    this.ctx = this.cvs.getContext("2d");
    this.image = document.createElement("img");

    //console.log(this.image.naturalWidth);

    this.cvs.style.position = "absolute";
    //console.log(this.image.naturalWidth);
  }

  draw(ratio){
    this.image.addEventListener("load", () => {
      this.cvs.width = window.innerWidth;
      this.cvs.height = window.innerHeight;
      this.ctx.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, this.x*ratio, this.y*ratio, this.image.naturalWidth*ratio, this.image.naturalHeight*ratio);
    });
    this.image.src = "images/" + this.color + "ball.png";

  }

  move(ratio, x, y){
    //setInterval(this.move, 10);
      //if(this.frame < this.maxFrame){
        requestAnimationFrame(() => {this.move(ratio, x, y)});
        console.log("Oui");
        this.x = this.x+x;
        this.draw(ratio);
        //this.ctx.clearRect(0,0,this.ctx.width,this.ctx.height);
        /*this.x = this.x+x/1000000;
        this.y = this.y+y/1000000;
        this.draw(ratio);*/
        this.frame++;
      //}
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
