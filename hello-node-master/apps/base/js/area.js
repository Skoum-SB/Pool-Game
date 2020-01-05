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

  draw(image, x, y){

    x = typeof x !== 'undefined' ? x : 0;
    y = typeof y !== 'undefined' ? y : 0;

    this.ctx.save();
    this.ctx.scale(this.scalex, this.scaley);
    this.ctx.translate(x, y);
    this.ctx.drawImage(image, 0, 0, image.width, image.height, x, y, image.width, image.height);
    this.ctx.restore();
  }

  clear(){
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
  }

}
