
class Ball{
  constructor (x, y, color){
    this.x = x;
    this.y = y;
    this.out = false;
    this.color = color;
    this.cvs = document.createElement("canvas");
    this.ctx = this.cvs.getContext("2d");
    this.image = document.createElement("img");
    this.cvs.style.position = "absolute";
    this.vx = 10;
    this.vy = 3;
    this.limit=300;
  }

  draw(ratio){
    this.image.addEventListener("load", () => {
      this.cvs.width = window.innerWidth;
      this.cvs.height = window.innerHeight;
      this.ctx.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, this.x*ratio, this.y*ratio, this.image.naturalWidth*ratio, this.image.naturalHeight*ratio);
    });
    this.image.src = "images/" + this.color + "ball.png";
  }

  move(ratio){
  this.ctx.clearRect(0,0,this.cvs.width,this.cvs.height);
  this.ctx.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, this.x*ratio, this.y*ratio, this.image.naturalWidth*ratio, this.image.naturalHeight*ratio);
    if(this.limit >= 0){
      this.limit-=1;

      /*Left and Right*/ if(this.x+this.vx < 50 || this.x+this.vx > 1400){ this.vx = -this.vx;}
      /*Top and Bottom*/ if(this.y+this.vy < 50 || this.y+this.vy > 722){ this.vy = -this.vy;}
      this.x += this.vx;
      this.y += this.vy;
      requestAnimationFrame(() => {this.move(ratio)});
    }
    else{
      cancelAnimationFrame(() => {this.move(ratio)});
    }
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
