class Ball{
  x;
  y;
  ball_number;
  in_out;
  ball_color;
  image;
  image_path;

  constructor (x, y, ball_number, in_out, ball_color, image_path){
    this.x = x;
    this.y = y;
    this.ball_number = ball_number;
    this.in_out = in_out;
    this.ball_color = ball_color;
    this.image = document.createElement("img");
    this.path = image_path;
  }

 draw(){
   this.cvs = document.createElement("canvas");
   this.ctx = this.cvs.getContext("2d");
   this.image.src = this.path;
   this.image.onload = () =>{
     this.ctx.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, 0, 0, 100, 100);
   }
 }

  get positionX(){ return this.x;}
  get positionY(){ return this.y;}
  get ball_number(){ return this.ball_number;}
  get in_out(){ return this.in_out;}
  get ball_color(){ return this.ball_color;}
  get ball_image(){ return this.image;}


  load_image(){
    var x = document.createElement("IMG");
    x.setAttribute("src", this.image);
    x.setAttribute("width", "304");
    x.setAttribute("height", "228");
  }



  /*
  var x = document.createElement("IMG");
x.setAttribute("src", "img_pulpit.jpg");
x.setAttribute("width", "304");
x.setAttribute("height", "228");
x.setAttribute("alt", "The Pulpit Rock");
document.body.appendChild(x);
*/

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
