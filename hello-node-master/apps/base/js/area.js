class Area{
  constructor(){
    this.cvs;
    this.ctx;
  }

  initialize(){
    this.cvs = document.createElement("canvas");
    this.ctx = this.cvs.getContext('2d');

    window.onresize = () => {this.resize()};
    this.resize();
  }

  resize(){
    let ratio = 1500 / 825;
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;
    let windowRatio = newWidth / newHeight;

    if (windowRatio > ratio) {
        newWidth = newHeight * ratio;
    } else {
        newHeight = newWidth / ratio;
    }
    this.cvs.width = newWidth;
    this.cvs.height = newHeight;
  }

  draw(image, x, y, ratio){

    x = typeof x !== 'undefined' ? x : 0;
    y = typeof y !== 'undefined' ? y : 0;
    ratio = typeof ratio !== 'undefined' ? ratio : 1;

    this.ctx.save();
    this.ctx.scale(this.scalex, this.scaley);
    this.ctx.translate(x, y);
    this.ctx.drawImage(image, 0, 0,
        image.width, image.height,
        x, y,
        image.width, image.height);
    this.ctx.restore();
  }

  clear(){
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
  }

}

var area = new Area();

Object.defineProperty(area, "scalex",
{
  get: function () {
    return this.cvs.width / 1500;
  }
});

Object.defineProperty(area, "scaley",
{
  get: function () {
    return this.cvs.height / 825;
  }
});
