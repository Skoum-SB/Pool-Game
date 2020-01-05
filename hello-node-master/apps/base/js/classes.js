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
    this.mass=2;
  }

  draw(){
    if(!this.out){
      this.area.draw(this.image, this.x-25, this.y-25);
      this.image.src = "images/" + this.color + "ball.png";
    }
  }

  collideWith(second_ball, allBalls){
      let dx = second_ball.x - this.x;
      let dy = second_ball.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if(distance  == 0){
        console.log(distance)
      }

      if(this != second_ball && distance < this.radius){
        //faire les caculs
        if(!second_ball.ismoving){
          console.log("Aiiiiie");
             //second_ball.move(allBalls);
        }
      }
  }

  move(allBalls){
    this.ismoving = true;
    this.moveit = () => {
      //if((Math.abs(y)-slowy > 0) || (Math.abs(x)-slowx > 0)){
        /*Left and Right*/ if(this.x < 55+25 || this.x > 1395+25){ this.vx = -this.vx;}
        /*Top and Bottom*/ if(this.y < 55+25 || this.y > 717+25){ this.vy = -this.vy;}
        for(var i=0; i<allBalls.length; i++){
            this.collideWith(allBalls[i],allBalls);
          }
        this.x += this.vx;
        this.y += this.vy;
        requestAnimationFrame(this.moveit);
      /*}
      else{
        cancelAnimationFrame(this.moveit);
        this.ismoving = false;
      }*/
    }
    this.moveit();
  }

  collideWith(second_ball, allBalls){

    var dx = second_ball.x - this.x	;
    var dy = second_ball.y -	this.y	;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if(this!=second_ball && (distance < this.radius) ){
      //this.vx = -this.vx;
      //this.vx = -this.vx;
      if(second_ball.ismoving==0 && this.ismoving==1){
        second_ball.move(allBalls);
      }

      trace("I??????????????????");
      var angle = Math.atan2(dy,dx);
      var sin = Math.sin(angle);
      var cos = Math.cos(angle);
      var x1=0; var y1=0;

      //Rotate velocity
      var vx1 = this.vx*cos+this.vy*sin;
      var vy1 = this.vy*cos-this.vx*sin;
      var vx2 = second_ball.vx*cos+second_ball.vy*sin;
      var vy2 = second_ball.vy*cos-second_ball.vx*sin;


      //resolve 1D velocity, use temp variables
      var vx1final = ((this.mass-second_ball.mass)*vx1+2*second_ball.mass*vx2)/(this.mass+second_ball.mass);
      var vx2final = ((second_ball.mass-this.mass)*vx2+2*this.mass*vx1)/(this.mass+second_ball.mass);
      // update velocity
      vx1 = vx1final;
      vx2 = vx2final;

      this.vx = vx1*cos-vy1*sin;
      this.vy = vy1*cos+vx1*sin;
      second_ball.vx = vx2*cos-vy2*sin;
      second_ball.vy = vy2*cos+vx2*sin;


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
