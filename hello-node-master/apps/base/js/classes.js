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

  move(allBalls){
  //  var delta= 1/100;
    this.ismoving = true;
    this.moveit = () => {
      if((Math.abs(this.vy) > 0.2) || (Math.abs(this.vx) > 0.2)){
        //this.vx *= delta;
        //this.vy *= delta;
      //  trace("thiiiiiis",delta,this.vx);
        for(var i=0; i<allBalls.length; i++){
            this.collideWith(allBalls[i],allBalls);
        }
        /*Left and Right*/ if(this.x < 55+25 || this.x > 1395+25){ this.vx = -this.vx;}
        /*Top and Bottom*/ if(this.y < 55+25 || this.y > 717+25){ this.vy = -this.vy;}


        if(this.vx>0){this.vx -=0.03;}
        if(this.vy>0){this.vy -=0.03;}

        if(this.vx<0){this.vx +=0.03;}
        if(this.vy<0){this.vy +=0.03;}


        //this.vx *= 0.98;
        //this.vy *= 0.98;

        this.x += this.vx;
        this.y += this.vy;
        requestAnimationFrame(this.moveit);

      }
      else{
        //if(this.x == allBalls[14].x){trace("STOP it!",allBalls[14].x);}
        trace("je marrete");
        this.vx=0;
        this.vy=0;

        cancelAnimationFrame(this.moveit);
        this.ismoving = false;
      }
    }
    this.moveit();
  }

  collideWith(second_ball, allBalls){

    var dx = second_ball.x - this.x	;
    var dy = second_ball.y -	this.y	;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if(this!=second_ball && (distance <= this.radius*2) ){
      second_ball.vx=-this.vx;
      second_ball.vy=-this.vy;

      /*Energy loos*/
      if(second_ball.vx>0){second_ball.vx +=0.00;}
      if(second_ball.vy>0){second_ball.vy +=0.00;}

      if(second_ball.vx<0){second_ball.vx -=0.00;}
      if(second_ball.vy<0){second_ball.vy -=0.00;}

      if(this.vx>0){this.vx -=0.04;}
      if(this.vy>0){this.vy -=0.04;}

      if(this.vx<0){this.vx +=0.04;}
      if(this.vy<0){this.vy +=0.04;}

      //this.vx = -this.vx;
      //this.vx = -this.vx;
      if(second_ball.ismoving==0 && this.ismoving==1){
        second_ball.move(allBalls);
      }

      let angle = Math.atan2(dy,dx);
      let sin = Math.sin(angle);
      let cos = Math.cos(angle);
      let x1=0; let y1=0;
      let x2 = dx*cos+dy*sin;
      let y2 = dy*cos-dx*sin;

      //Rotate velocity
      let vx1 = this.vx*cos+this.vy*sin;
      let vy1 = this.vy*cos-this.vx*sin;
      let vx2 = second_ball.vx*cos+second_ball.vy*sin;
      let vy2 = second_ball.vy*cos-second_ball.vx*sin;

      //resolve 1D velocity, use temp variables
      let vx1final = ((this.mass-second_ball.mass)*vx1+2*second_ball.mass*vx2)/(this.mass+second_ball.mass);
      let vx2final = ((second_ball.mass-this.mass)*vx2+2*this.mass*vx1)/(this.mass+second_ball.mass);
      // update velocity
      vx1 = vx1final;
      vx2 = vx2final;

     // fix the glitch by moving ball part equal to the overlap
      let absV = Math.abs(vx1)+Math.abs(vx2);
      let overlap =38-Math.abs(x1-x2);
      x1 += vx1/absV*overlap;
      x2 += vx2/absV*overlap;

      // rotate the relative positions back
      let x1final = x1*cos-y1*sin;
      let y1final = y1*cos+x1*sin;
      let x2final = x2*cos-y2*sin;
      let y2final = y2*cos+x2*sin;

      // finally compute the new absolute positions
       second_ball.x = this.x + x2final;
       second_ball.y = this.y + y2final;

       this.x = this.x + x1final;
       this.y = this.y + y1final;

       //rotate vel back
      this.vx = (vx1*cos-vy1*sin)*0.95;
      this.vy = (vy1*cos+vx1*sin)*0.95;
      second_ball.vx = (vx2*cos-vy2*sin)*0.95;
      second_ball.vy = (vy2*cos+vx2*sin)*0.95;
      //trace("viteseeeeee",this.vx,this.vy);


      //return true;
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
