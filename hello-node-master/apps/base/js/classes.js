class Ball{
  constructor (area, x, y, color){
    this.x = x;
    this.y = y;
    this.out = false;
    this.color = color;
    this.image = document.createElement("img");
    this.image.onload;
    this.ismoving = false;
    this.vx = 0;
    this.vy = 0;
    this.area = area;
    this.radius = 19;
    this.mass=1;
  }

  draw(){
    if(!this.out){
      this.area.draw(this.image, this.x-25, this.y-25);
      this.image.src = "images/" + this.color + "ball.png";
    }
  }

  move(allBalls){

    if(this.ismoving){
      //console.log(this.color);
        /*Left and Right*/ if(this.x < 55+25 || this.x > 1395+25){ this.vx = -this.vx; this.vx *= 0.95;}
        /*Top and Bottom*/ if(this.y < 55+25 || this.y > 717+25){ this.vy = -this.vy; this.vx *= 0.95;}
        /*for(let i=0; i<allBalls.length; i++){
            this.collideWith(allBalls[i],allBalls);
          }*/
        this.x += this.vx;
        this.y += this.vy;
        this.vx += 0.01;
        this.vy += 0.01;
        //console.log(this.vy);

        //requestAnimationFrame(this.moveit);
      /*}
      else{*/
      if((Math.abs(this.vy) < 1) && (Math.abs(this.vx)<1)){
        //cancelAnimationFrame(this.moveit);
        this.ismoving = false;
        this.vx = 0;
        this.vy = 0;
      }
    }
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  collideWith(second_ball){

    if(second_ball.ismoving==false && this.ismoving==false){
      return;
    }
    let dx = second_ball.x - this.x ;
    let dy = second_ball.y -  this.y  ;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if(this!=second_ball && (distance < this.radius*2) ){
      //this.vx = -this.vx;
      //this.vx = -this.vx;

      let angle = Math.atan2(dy,dx);
      let sin = Math.sin(angle);
      let cos = Math.cos(angle);
      let x1=0; let y1=0;

      //Rotate velocity
      let vx1 = this.vx*cos+this.vy*sin;
      let vy1 = this.vy*cos-this.vx*sin;
      let vx2 = second_ball.vx*cos+second_ball.vy*sin;
      let vy2 = second_ball.vy*cos-second_ball.vx*sin;


      //resolve 1D velocity, use temp letiables
      let vx1final = ((this.mass-second_ball.mass)*vx1+2*second_ball.mass*vx2)/(this.mass+second_ball.mass);
      let vx2final = ((second_ball.mass-this.mass)*vx2+2*this.mass*vx1)/(this.mass+second_ball.mass);
      // update velocity
      vx1 = vx1final;
      vx2 = vx2final;

      this.vx = vx1*cos-vy1*sin;
      this.vy = vy1*cos+vx1*sin;
      second_ball.vx = vx2*cos-vy2*sin;
      second_ball.vy = vy2*cos+vx2*sin;
      //console.log(second_ball.vy, second_ball.vx);
      this.ismoving = true;
      second_ball.ismoving = true;


      return true;
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
