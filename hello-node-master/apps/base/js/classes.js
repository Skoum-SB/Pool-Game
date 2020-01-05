class Vector2 {
  constructor(x=0,y=0){
    this.x=x;
    this.y=y;
  }
}

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
    this.limit=210;
    this.radius=19;
    this.ismoving=0;
    this.vx=0;
    this.vy=0;
    this.mass=2;
  }

  draw(ratio){
      if(!this.out){
        this.image.addEventListener("load", () => {
          this.cvs.width = window.innerWidth;
          this.cvs.height = window.innerHeight;
          this.ctx.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, this.x*ratio, this.y*ratio, this.image.naturalWidth*ratio, this.image.naturalHeight*ratio);
        });
        this.image.src = "images/" + this.color + "ball.png";
      }
      else{
        this.ctx.clearRect(0,0,this.cvs.width,this.cvs.height);
      }
    }

    move(ratio, x, y, slow,allBalls){
      this.ismoving=1;
      var slowx = (x>y) ? slow : slow*(Math.abs(x)/Math.abs(y));
      var slowy = (x<y) ? slow : slow*(Math.abs(y)/Math.abs(x));

      this.moveit = () => {
        if((Math.abs(y)-slowy > 0.02) || (Math.abs(x)-slowy > 0.02)){
//            if(this.number>0){trace("HEEEEEEEEEEEEEERE",this.y,this.number);}
          this.ctx.clearRect(0,0,this.cvs.width,this.cvs.height);
          /*Left and Right*/ if(this.x < 55 || this.x > 1395){ this.vx = -this.vx;}
          /*Top and Bottom*/ if(this.y < 55 || this.y > 717){ this.vy = -this.vy;}

          for(var i=0; i<allBalls.length; i++){
            this.collideWith(allBalls[i],ratio, allBalls);

          }

          this.x += this.vx;
          this.y += this.vy;

          this.ctx.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, this.x*ratio, this.y*ratio, this.image.naturalWidth*ratio, this.image.naturalHeight*ratio);
          requestAnimationFrame(this.moveit);
        }
        else{
          this.ismoving=0;
          cancelAnimationFrame(this.moveit);
        }
      }
      this.moveit();
    }

    collideWith(second_ball, ratio, allBalls){

      var dx = second_ball.x - this.x	;
      var dy = second_ball.y -	this.y	;
      var distance = Math.sqrt(dx * dx + dy * dy);

      if((this.x!=second_ball.x && this.y!=second_ball.y) && (distance < (this.radius + second_ball.radius)) ){
        //this.vx = -this.vx;
        //this.vx = -this.vx;
        if(second_ball.ismoving==0 && this.ismoving==1){
          second_ball.move(ratio, 1, 0, 0, allBalls);
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

  }//end class ball

class Stick{
  force;
  angle;

  constructor (x,y){
    this.x = x;
    this.y = y;
    this.force = 0;
    this.angle = 0;
    this.cvs = document.createElement("canvas");
    this.ctx = this.cvs.getContext("2d");
    this.image = document.createElement("img");
    this.cvs.style.position = "absolute";
    //this.origin= new Vector2(500,10);

    this.position = new Vector2(x,y);
  }

  draw(ratio){
    this.image.addEventListener("load", () => {
      this.cvs.width = window.innerWidth;
      this.cvs.height = window.innerHeight;
      this.ctx.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, this.x*ratio, this.y*ratio, this.image.naturalWidth*ratio, this.image.naturalHeight*ratio);
    });

    this.image.src = "images/stick.png";
  }
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
