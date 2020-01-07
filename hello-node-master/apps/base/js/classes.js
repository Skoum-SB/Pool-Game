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

      if(this.x < 76){
        this.vx = -this.vx; this.vx *= 0.95;
        this.x = 77;
      }
      if(this.x > 1424){
        this.vx = -this.vx; this.vx *= 0.95;
        this.x = 1423;
     }
      if(this.y < 76){
        this.vy = -this.vy; this.vy *= 0.95;
        this.y = 77;
      }
      if(this.y > 748){
        this.vy = -this.vy; this.vx *= 0.95;
        this.y = 747;
      }
        this.x += this.vx;
        this.y += this.vy;
        this.vx += (this.vx * 0.0115);
        this.vy += (this.vy * 0.0115);

      if((Math.abs(this.vy) < 1) && (Math.abs(this.vx)<1)){
        this.ismoving = false;
        this.vx = 0;
        this.vy = 0;
      }
    }
    this.vx *= 0.979;
    this.vy *= 0.979;
  }

  collideWith(second_ball,holes){
    if(second_ball.ismoving==false && this.ismoving==false){
      return;
    }

    let tx = (this.x + (this.x*0.01));
    let ty = (this.y + (this.y*0.01));
    let fx = (second_ball.x + (second_ball.x*0.01));
    let fy = (second_ball.y + (second_ball.y*0.01));
    let dx = fx - tx;
    let dy = fy - ty;
    let distance = Math.sqrt(dx * dx + dy * dy);

    for(var i=0; i<holes.length; i++){
      var distance_ = Math.sqrt((this.x-holes[i].x)*(this.x-holes[i].x) + (this.y-holes[i].y)*(this.y-holes[i].y));
      if( distance_ < (this.radius+holes[i].radius)){
        let holeSound = new Audio("sound/Hole.wav");
        holeSound.cloneNode().play();
        this.ismoving=0;
        this.out=true;
        this.x=0; this.y=0;
        trace("oooooooooooooooooook");
        return true;
      }
    }

    if(this!=second_ball && (distance < this.radius*2) ){
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

      //resolve 1D velocity, use temp letiables
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

      this.vx = vx1*cos-vy1*sin;
      this.vy = vy1*cos+vx1*sin;
      second_ball.vx = vx2*cos-vy2*sin;
      second_ball.vy = vy2*cos+vx2*sin;

      this.ismoving = true;
      second_ball.ismoving = true;

      return true;
    }

    return false;
  }

    whiteCollideWith(x,y,second_ball,holes){

      /*Left and Right*/ if(x < 55+25 || x > 1395+25){ return true;}
      /*Top and Bottom*/ if(y < 55+25 || y > 717+25){ return true;}

      let tx = (x + (x*0.01));
      let ty = (y + (y*0.01));
      let fx = (second_ball.x + (second_ball.x*0.01));
      let fy = (second_ball.y + (second_ball.y*0.01));
      let dx = fx - tx;
      let dy = fy - ty;
      let distance = Math.sqrt(dx * dx + dy * dy);

      for(let i=0; i<holes.length; i++){
        let distance_ = Math.sqrt((x-holes[i].x)*(x-holes[i].x) + (y-holes[i].y)*(y-holes[i].y));
        if( distance_ < (this.radius+holes[i].radius)){
          return true;
        }
      }

      if(this!=second_ball && (distance < this.radius*2) ){
        return true;
      }

      return false;
    }


    firstCollision(color){
      let tx = (x + (x*0.01));
      let ty = (y + (y*0.01));
      let fx = (second_ball.x + (second_ball.x*0.01));
      let fy = (second_ball.y + (second_ball.y*0.01));
      let dx = fx - tx;
      let dy = fy - ty;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if(this!=second_ball && (distance < this.radius*2) ){
        return second_ball.color;
      }
  	}

}

class Stick{
  constructor (area, x, y){
    this.area = area;
    this.x = x;
    this.y = y;
    this.image = document.createElement("img");
    this.image.src = "images/stick.png";
    this.rotation = 0;
    this.origin = 970;
    this.out = false;
  }

  draw(rotate){
    //if(!this.out){
      this.area.draw(this.image, this.x-this.origin, this.y-11, this.rotation, this.origin);
    //}
  }
}

class Player{
  constructor(area,x,y){
    this.area = area;
    this.x = x;
    this.y = y;
    this.ballOut = 0;
    this.cvs = document.createElement('canvas');
    this.ctx = this.cvs.getContext('2d');
  }

  draw(){
    this.area.draw_();
  //  this.cvs.width = 100;
  //  this.cvs.height = 100;
    //this.area.draw(this.image, this.x, this.y);
    //this.image.src = "images/" + this.color + "ball.png";
  }
}
