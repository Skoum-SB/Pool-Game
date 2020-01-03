
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

  move(ratio, x, y, slow){
    let slowx = (x>y) ? slow : slow*(x/y);
    let slowy = (x<y) ? slow : slow*(y/x);
    this.moveit = () => {
      if((Math.abs(y)-slowy > 0)){
        this.ctx.clearRect(0,0,this.cvs.width,this.cvs.height);
        /*Left and Right*/ if(this.x < 55 || this.x > 1395){ x = -x;}
        /*Top and Bottom*/ if(this.y < 55 || this.y > 717){ y = -y;}
        //console.log(y);
        this.x += x;
        this.y += y;
        x += (x > 0) ? -slowx : slowx;
        y += (y > 0) ? -slowy : slowy;
        this.ctx.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, this.x*ratio, this.y*ratio, this.image.naturalWidth*ratio, this.image.naturalHeight*ratio);
        requestAnimationFrame(this.moveit);
      }
      else{
        cancelAnimationFrame(this.moveit);
      }
    }
    this.moveit();
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
