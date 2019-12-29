class Ball{

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

class Stick{

  constructor (force, angle){
    this.force = force;
    this.angle = angle;
  }

  get force(){ return this.force;}
  get angle(){ return this.angle;}

}

class Player{

  cosntructor (name, score, team){
    this.name = name;
    this.score = score;
    this.team = team;
  }

  get name(){ return this.name;}
  get score(){ return this.score;}
  get team(){ return this.team;}

}
