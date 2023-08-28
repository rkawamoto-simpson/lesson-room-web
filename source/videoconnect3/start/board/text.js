function CanvasText(context, parentContext, config) {
    var $this = this;
    this.isActive = false;
    this.input = undefined;
    this.ratioX = 1;
    this.ratioY = 1;
    this.ratioFont = 1;
    this.color = BoardConfig.STROKE_STRIKE_RED;
    this.size = undefined;
    this.fontFamily = BoardConfig.DEFAULT_TEXT_FONT_FAMILY;
    this.text = undefined;
    this.currentX = undefined;
    this.currentY = undefined;
    this.isLocal = true;
    this.lastX = 0;
    this.lastY = 0;
    this.value = undefined;

    this.__construct = function () {
        if(config.ratioX != undefined)
            this.ratioX = config.ratioX
        if(config.ratioY != undefined)
            this.ratioY = config.ratioY
        if(config.isLocal != undefined)
            this.isLocal = config.isLocal;

        this.ratioFont = (this.ratioX > this.ratioY) ? this.ratioY : this.ratioX;
        // this.ratioFont = 1;
        this.size = BoardConfig.DEFAULT_TEXT_SIZE * this.ratioFont;

        context.textBaseline = 'top';
        context.textAlign = 'left';
        context.font = this.size + 'px ' +this.fontFamily;

        $this.input = document.createElement('input');
        $this.input.type = 'text';
        $this.input.onkeydown = function (e) { $this.onKeydown(e.keyCode) };
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

    this.onClick = function (x, y) {
        if(this.isActive) {
            if($this.input != undefined) {
                this.onKeydown(13);
            }
        }
        this.addInput(x, y);

    }

    this.getText = function () {
        return $this.value;
    }
    this.clearText = function () {
        $this.value = "";
    }

    this.addInput = function (x, y) {
        $this.currentX = x - 4;
        $this.currentY = y - 4;
        $this.input.style.marginLeft = (x - 4) + 'px';
        $this.input.style.marginTop = (y - 4) + 'px';
        $this.input.style.fontSize = this.size/$this.ratioFont + 'px';
        $this.input.style.fontFamily = $this.fontFamily;
        // $this.input.style.color = $this.color;
        // $this.input.style.fontWeight = "bold";
        parentContext.appendChild($this.input);
        $this.input.focus();

        this.isActive = true;

        this.lastX = x;
        this.lastY = y;
    }

    this.onInputDataChanged = function (value) {
        this.input.value = value;
        this.text = value;
    }

    this.onKeydown = function(keyCode) {
        if (keyCode === 13) {
            $this.text = $this.input.value;
            $this.drawText($this.input.value, parseInt($this.input.style.marginLeft, 10), parseInt($this.input.style.marginTop, 10));
            $this.value = $this.input.value;
            $this.input.value = "";
            if($this.input != undefined) {
                try {
                    parentContext.removeChild($this.input);
                }
                catch (e) {}
            }

            $this.isActive = false;
        }
    }
    
    this.drawText = function (txt, x, y) {
        context.globalCompositeOperation = 'source-over';
        if(this.isLocal) {
            x += 3;
            y += 3;
            x *= $this.ratioX;
            y *= $this.ratioY;
        }
        context.fillText(txt, x, y);
        this.lastX = x;
        this.lastY = y;
    }

    this.setStyle = function (style) {
        $this.input.style.color = style;
        context.fillStyle = style;
    }

    this.setSize = function (size) {
        $this.input.style.fontSize = size + 'px';
        $this.input.focus();
        this.size = size * this.ratioFont;
        context.font = (this.size) + 'px ' +this.fontFamily;
    }

    this.hide = function () {
        if($this.input != undefined) {
            $this.input.value = "";
            if(parentContext.contains($this.input))
                parentContext.removeChild($this.input);

            this.text = undefined;
            this.currentX = undefined;
            this.currentY = undefined;
            this.isActive = false;
        }

    }

    this.getCurrentX = function () {
        return this.currentX;
    }

    this.getCurrentY = function () {
        return this.currentY;
    }




    this.__construct();
}