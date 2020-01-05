class Ball{
  constructor (area, x, y, color){
    this.x = x;
    this.y = y;
    this.out = false;
    this.color = color;
    this.image = document.createElement("img");
    this.image.onload;
    this.vitessex;
    this.vitessey;
    this.area = area;
  }

  draw(){
    if(!this.out){
      this.area.draw(this.image, this.x, this.y);
      this.image.src = "images/" + this.color + "ball.png";
    }
  }

  move(x, y, slow){
    let slowx = (x>y) ? slow : slow*(x/y);
    let slowy = (x<y) ? slow : slow*(y/x);
    this.moveit = () => {
      if((Math.abs(y)-slowy > 0) || (Math.abs(x)-slowx > 0)){
        /*Left and Right*/ if(this.x < 26 || this.x > 700){ x = -x;}
        /*Top and Bottom*/ if(this.y < 26 || this.y > 360){ y = -y;}
        this.x += x;
        this.y += y;
        x += (x > 0) ? -slowx : slowx;
        y += (y > 0) ? -slowy : slowy;
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
