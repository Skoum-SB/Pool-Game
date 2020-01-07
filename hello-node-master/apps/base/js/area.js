class Area{
  constructor(){
    this.cvs;
    this.ctx;
    this.cvs = document.createElement("canvas");
    this.ctx = this.cvs.getContext('2d');
    window.onresize = () => {this.resize()};
    this.resize();
  }

  resize(){
    let ratio = 1500 / 825;
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width/height > ratio) {
        width = window.innerHeight * ratio;
    }
    else {
        height = window.innerWidth / ratio;
    }
    this.cvs.width = width;
    this.cvs.height = height;
    this.scalex = this.cvs.width / 1500;
    this.scaley = this.cvs.height / 825;
  }

  draw(image, x, y, rotate, stickOrigin){

    x = typeof x !== 'undefined' ? x : 0;
    y = typeof y !== 'undefined' ? y : 0;
    rotate = typeof rotate !== 'undefined' ? rotate : 0;

    this.ctx.save();
    this.ctx.scale(this.scalex, this.scaley);
    if(rotate){
      this.ctx.translate(x+stickOrigin, y+11);
    }
    this.ctx.rotate(rotate);
    if(rotate){
      this.ctx.translate(-(x+stickOrigin), -(y+11));
    }
    this.ctx.drawImage(image, 0, 0, image.width, image.height, x, y, image.width, image.height);
    this.ctx.restore();
  }

  draw_icon(image, x, y,name,ballOut,color){
    this.ctx.font = "30px Comic Sans MS";
    this.ctx.fillStyle = color;

    if(y<500){
      this.ctx.fillText(name, x+50, 40);
      this.ctx.fillText(ballOut, x-50, 40);
    }

    else{
      this.ctx.fillText(name, x+50, 732);
      this.ctx.fillText(ballOut, x-50, 732);
    }


    this.ctx.save();
    this.ctx.scale(this.scalex, this.scaley);

    this.ctx.drawImage(image, 0, 0, image.width, image.height, x, y, image.width-1035, image.height-1035);
    this.ctx.restore();
  }



  clear(){
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
  }

}
