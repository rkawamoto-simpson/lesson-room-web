function Mouse(context, config) {
  this.context = context;
  var $this = this;
  this.lastState = {};
  this.currentX = 0;
  this.currentY = 0;
  this.mouseObj = undefined;
  this.ratioX = 1;
  this.ratioY = 1;
  this.maxWidth = undefined;
  this.maxHeight = undefined;
  this.isMouseHidden = false;
  this.isLocal = true;
  this.lastX = 0;
  this.lastY = 0;
  this.scaleX = 0;
  this.scaleY = 0;

  this.__construct = function() {
    if (config.ratioX != undefined)
      this.ratioX = config.ratioX
    if (config.ratioY != undefined)
      this.ratioY = config.ratioY
    this.mouseObj = new Image();
    if (config.src_mouse != undefined) {
      this.mouseObj.src = config.src_mouse;
    }
    if (config.isLocal != undefined)
      this.isLocal = config.isLocal;
     //this.mouseObj.style.width = '1000px';
    // if(config.max_width != undefined)
    //     this.maxWidth = config.max_width;
    // if(config.max_height != undefined)
    //     this.maxHeight = config.max_height;

  }
  this.setRatioX = function(value) {
    this.ratioX = value;
  }
  this.setRatioY = function(value) {
    this.ratioY = value;
  }

  this.getX = function() {
    return this.lastX;
  }
  this.getY = function() {
    return this.lastY;
  }

  this.onMouseDown = function(e) {

  }


  this.onMouseUp = function() {
    this.onMouseMove(-50, -50);
  }

  this.onMouseOut = function() {
    this.onMouseMove(-50, -50);
  }

  this.hide = function() {
    this.onMouseMove(-50, -50);
  }

  this.__construct();
}
