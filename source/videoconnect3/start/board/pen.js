function Pen(context, config) {
    var $this = this;
    this.isActive = false;
    this.lastX = 0;
    this.lastY = 0;
    this.ratioX = 1;
    this.ratioY = 1;
    this.isLocal = true;
    this.__construct = function () {
        if(config.ratioX != undefined)
            this.ratioX = config.ratioX
        if(config.ratioY != undefined)
            this.ratioY = config.ratioY
        if(config.isLocal != undefined)
            this.isLocal = config.isLocal;
    };

    this.getX = function () {
        return this.lastX;
    }
    this.getY = function () {
        return this.lastY;
    }

    this.setRatioX = function(value) {
        this.ratioX = value;
    }
    this.setRatioY = function(value) {
        this.ratioY = value;
    }

    this.onMouseMove = function(x, y) {
        if(this.isLocal) {
            x *= $this.ratioX;
            y *= $this.ratioY;
        }
        if(!this.isActive) return;
        context.globalCompositeOperation = 'source-over';
        context.beginPath();
        context.moveTo(this.lastX, this.lastY);
        context.lineTo(x, y);
        context.stroke();
        this.lastX = x;
        this.lastY = y;
    }

    this.onMouseUp = function () {
        this.isActive = false;
    }

    this.onMouseOut = function () {
        this.isActive = false;
    }

    this.onMouseDown = function (x, y) {
        if(this.isLocal) {
            x *= $this.ratioX;
            y *= $this.ratioY;
        }
        this.isActive = true;
        this.lastX = x;
        this.lastY = y;

    }

    this.setStyle = function (style) {
        context.strokeStyle = style;
    }

    this.setWidth = function (width) {
        context.lineWidth = width;
    }

    this.__construct();
}
