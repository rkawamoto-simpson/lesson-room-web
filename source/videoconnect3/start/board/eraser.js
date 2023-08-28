function Eraser(contexts, config) {
    var $this = this;
    this.isActive = false;
    this.old = undefined;
    this.lastStates = [];
    this.ratioX = 1;
    this.ratioY = 1;
    this.lastX = 0;
    this.lastY = 0;
    this.isLocal = true;

    this.__construct = function () {
        if(config.ratioX != undefined)
            this.ratioX = config.ratioX
        if(config.ratioY != undefined)
            this.ratioY = config.ratioY
        if(config.isLocal != undefined)
            this.isLocal = config.isLocal;
    }

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
        if (this.isActive) {
            contexts.forEach(function (context) {
                context.globalCompositeOperation = 'destination-out';

                context.beginPath();
                context.arc(x, y, 10, 0, 2 * Math.PI);
                context.fill();

                context.beginPath();
                context.moveTo($this.old.x, $this.old.y);
                context.lineTo(x, y);
                context.stroke();

                $this.old = {x: x, y: y};

            })
        }

        this.lastX = x;
        this.lastY = y;
    }

    this.onMouseDown = function (x, y) {
        if(this.isLocal) {
            x *= $this.ratioX;
            y *= $this.ratioY;
        }
        this.isActive = true;
        this.old = {x: x, y: y};
        this.lastX = x;
        this.lastY = y;
    }

    this.onMouseUp = function () {
        this.isActive = false;
    }

    this.onMouseOut = function () {
        this.isActive = false;
    }



    this.__construct();
}