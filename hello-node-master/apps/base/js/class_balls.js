class balls{

  constructor (x, y, ball_number, in_out, ball_color){
    this.x = x;
    this.y = y;
    this.ball_number = ball_number;
    this.in_out = in_out;
    this.ball_color = ball_color;
  }

  get positionX(){ return this.x;}
  get positionY(){ return this.y;}
  get ball_number(){ return this.ball_number;}
  get in_out(){ return this.in_out;}
  get ball_color(){ return this.ball_color;}

  

}
