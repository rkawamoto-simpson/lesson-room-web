var BoardConfig = {
  AUDIO_SRC_TIME_UP: undefined, //"../asset/audios/1_timeup.wav",
  AUDIO_SRC_FANFARE: undefined, //"../asset/audios/2_fanfare.wav",
  AUDIO_SRC_HANDCLAP: undefined, //"../asset/audios/3_handclap.wav",
  AUDIO_SRC_REGRET_FULLY: undefined, //"../asset/audios/4_regretfully.wav",
  AUDIO_SRC_BELL: undefined, //"../asset/audios/5_bell.wav",
  AUDIO_SRC_TEL: undefined, //"../asset/audios/6_tel.wav",
  AUDIO_SRC_CORRECT: undefined, //"../asset/audios/7_correct.wav",
  AUDIO_SRC_INCORRECT: undefined, //"../asset/audios/8_incorrect.wav",
  AUDIO_SRC_SOUND_1: undefined, //"../asset/audios/sound1.mp3",
  AUDIO_TYPE_TIMEUP: 'time_up',
  AUDIO_TYPE_FANFARE: 'fanfare',
  AUDIO_TYPE_HANDCLAP: 'handclap',
  AUDIO_TYPE_REGRET_FULLY: 'regret_fully',
  AUDIO_TYPE_BELL: 'bell',
  AUDIO_TYPE_TEL: 'tel',
  AUDIO_TYPE_CORRECT: 'correct',
  AUDIO_TYPE_INCORRECT: 'incorrect',
  AUDIO_TYPE_SOUND: 'sound',
  DEFAULT_LINE_JOIN: 'round',
  DEFAULT_LINE_CAP: 'round',
  DEFAULT_LINE_WIDTH: 1.5,
  DEFAULT_STROKE_STYLE: '#000000',
  DEFAULT_MOUSE_SRC: '../asset/images/mouse.png',
  DEFAULT_TEXT_FONT: '19px arial',
  DEFAULT_LINE_WIDTH_1: 4,
  DEFAULT_LINE_WIDTH_2: 6,
  MODE_PEN: 'pen',
  MODE_MOUSE: 'mouse',
  MODE_ERASER: 'eraser',
  MODE_TEXT: 'text',
  MODE_SWIPE: 'swipe',
  EVENT_MODE_CHANGE: 'mode_change',
  EVENT_MOUSE_DOWN: 'mouse_down',
  EVENT_MOUSE_MOVE: 'mouse_move',
  EVENT_MOUSE_UP: 'mouse_up',
  EVENT_MOUSE_OUT: 'mouse_out',
  EVENT_AUDIO: 'audio',
  EVENT_CLICK: 'click',
  EVENT_KEY_DOWN: 'key_down',
  EVENT_CLEAR: 'clear',
  EVENT_CONFIG: 'config',
  STROKE_STRIKE_BLACK: '#000000',
  STROKE_STRIKE_RED: '#FC0000',
  STROKE_STRIKE_GREEN: '#00B04F',
  STROKE_STRIKE_BLUE: '#0071BD',
  DEFAULT_TEXT_SIZE: 19,
  DEFAULT_TEXT_FONT_FAMILY: 'arial',
  TEXT_SIZE_8PX: 11,
  TEXT_SIZE_10PX: 13,
  TEXT_SIZE_13PX: 16,
  TEXT_SIZE_16PX: 19,
  TEXT_SIZE_24PX: 27,
  SRC_MOUSE_LOCAL: 'board/image/pen.png',
  SRC_MOUSE_REMOTE: 'board/image/pen.png',
  DEFAULT_MODE: 'pen',
  MAX_SCALE: 3,
  SCALE_FACTOR: 1.05
}

function Board(
  localDrawCanvas,
  remoteDrawCanvas,
  localPointerCanvas,
  remotePointerCanvas,
  backgroundCanvas,
  parentContext
) {
  var $this = this
  this.audioManager = undefined
  this.localDrawContext = undefined
  this.remoteDrawContext = undefined
  this.localPointerContext = undefined
  this.remotePointerContext = undefined
  this.localPen = undefined
  this.localEraser = undefined
  this.localMouse = undefined
  this.mode = BoardConfig.MODE_SWIPE
  this.localText = undefined
  this.remotePen = undefined
  this.remoteEraser = undefined
  this.remoteMouse = undefined
  this.remoteText = undefined
  this.remoteMode = BoardConfig.MODE_SWIPE
  this.canvas = localDrawCanvas
  this.scrollTop = 0
  this.scrollLeft = 0
  this.firstPositionX = undefined
  this.firstPositionY = undefined
  this.lastPosition = undefined
  this.distance = 0
  this.lastDistance = 0
  this.scale = 1
  this.minScale = 1
  this.drawWidth = 0
  this.zoomCoordinates = {
    x: undefined,
    y: undefined
  }
  this.isMouseDown = false
  this.isRemoteMouseDown = false
  this.positions = []

  this.__construct = function () {
    this.audioManager = new AudioManager()
    /*
            localDrawCanvas.width = 758;
            localDrawCanvas.height = 600;
            remoteDrawCanvas.width = 758;
            remoteDrawCanvas.height = 600;
            localPointerCanvas.width = 758;
            localPointerCanvas.height = 600;
            remotePointerCanvas.width = 758;
            remotePointerCanvas.height = 600;
*/

    this.localDrawContext = localDrawCanvas.getContext('2d')
    this.localDrawContext.lineJoin = BoardConfig.DEFAULT_LINE_JOIN
    this.localDrawContext.lineCap = BoardConfig.DEFAULT_LINE_CAP
    this.localDrawContext.lineWidth = BoardConfig.DEFAULT_LINE_WIDTH
    this.localDrawContext.strokeStyle = BoardConfig.DEFAULT_STROKE_STYLE

    this.localPointerContext = localPointerCanvas.getContext('2d')

    this.remoteDrawContext = remoteDrawCanvas.getContext('2d')
    this.remoteDrawContext.lineJoin = BoardConfig.DEFAULT_LINE_JOIN
    this.remoteDrawContext.lineCap = BoardConfig.DEFAULT_LINE_CAP
    this.remoteDrawContext.lineWidth = BoardConfig.DEFAULT_LINE_WIDTH
    this.remoteDrawContext.strokeStyle = BoardConfig.DEFAULT_STROKE_STYLE

    this.remotePointerContext = remotePointerCanvas.getContext('2d')

    this.localPen = new Pen(this.localDrawContext, {
      ratioX: localDrawCanvas.width / localDrawCanvas.offsetWidth,
      ratioY: localDrawCanvas.height / localDrawCanvas.offsetHeight
    })
    this.localEraser = new Eraser(
      [this.localDrawContext, this.remoteDrawContext],
      {
        ratioX: localDrawCanvas.width / localDrawCanvas.offsetWidth,
        ratioY: localDrawCanvas.height / localDrawCanvas.offsetHeight
      }
    )
    this.localMouse = new Mouse(this.localPointerContext, {
      ratioX: localPointerCanvas.width / localPointerCanvas.offsetWidth,
      ratioY: localPointerCanvas.height / localPointerCanvas.offsetHeight,
      src_mouse: BoardConfig.SRC_MOUSE_LOCAL,
      max_width: parentContext.offsetWidth,
      max_height: parentContext.offsetHeight
    })
    this.localText = new CanvasText(this.localDrawContext, parentContext, {
      ratioX: localDrawCanvas.width / localDrawCanvas.offsetWidth,
      ratioY: localDrawCanvas.height / localDrawCanvas.offsetHeight
    })

    this.remotePen = new Pen(this.remoteDrawContext, {
      ratioX: remoteDrawCanvas.width / remoteDrawCanvas.offsetWidth,
      ratioY: remoteDrawCanvas.height / remoteDrawCanvas.offsetHeight,
      isLocal: false
    })
    this.remoteEraser = new Eraser(
      [this.localDrawContext, this.remoteDrawContext],
      {
        ratioX: remoteDrawCanvas.width / remoteDrawCanvas.offsetWidth,
        ratioY: remoteDrawCanvas.height / remoteDrawCanvas.offsetHeight,
        isLocal: false
      }
    )
    this.remoteMouse = new Mouse(this.remotePointerContext, {
      ratioX: remoteDrawCanvas.width / remoteDrawCanvas.offsetWidth,
      ratioY: remoteDrawCanvas.height / remoteDrawCanvas.offsetHeight,
      src_mouse: BoardConfig.SRC_MOUSE_REMOTE,
      isLocal: false
    })
    this.remoteText = new CanvasText(this.remoteDrawContext, parentContext, {
      ratioX: remoteDrawCanvas.width / remoteDrawCanvas.offsetWidth,
      ratioY: remoteDrawCanvas.height / remoteDrawCanvas.offsetHeight,
      isLocal: false
    })

    parentContext.addEventListener(
      'mousemove',
      function (event) {
        $this.onMouseMove(event.offsetX, event.offsetY)
      },
      false
    )
    parentContext.addEventListener(
      'mouseup',
      function (event) {
        $this.onMouseUp()
      },
      false
    )
    parentContext.addEventListener(
      'mouseout',
      function (event) {
        $this.onMouseOut()
      },
      false
    )
    parentContext.addEventListener(
      'mousedown',
      function (event) {
        $this.onMouseDown(event.offsetX, event.offsetY)
      },
      false
    )

    var drawParent = document.getElementById('draw_parent')

    parentContext.addEventListener(
      'touchmove',
      function (event) {
        // if (mode !== 5) {
        // Check if the two target touches are the same ones that started
        if (event.targetTouches.length == 2) {
          return
          //get rough estimate of new distance between fingers
          $this.distance = Math.hypot(
            event.touches[0].pageX - event.touches[1].pageX,
            event.touches[0].pageY - event.touches[1].pageY
          )
          //if fingers are closer now than when they first touched screen, they are pinching
          if ($this.lastDistance > $this.distance) {
            $this.resizeCanvas(false)
          }
          //if fingers are further apart than when they first touched the screen, they are making the zooming gesture
          if ($this.lastDistance < $this.distance) {
            $this.resizeCanvas(true)
          }
          $this.lastDistance = $this.distance
        } else {
          // event.preventDefault();
          var et = $this.getTouchEvent(event)
          var rect = document
            .getElementById('backgroundCanvas')
            .getBoundingClientRect()
          //var rect = document.getElementById("draw-area").getBoundingClientRect();
          if ($this.mode == BoardConfig.MODE_SWIPE) {
            const px = $this.scrollLeft - (et.pageX - $this.firstPositionX)
            const py = $this.scrollTop - (et.pageY - $this.firstPositionY)

            drawParent.scrollTo(px, py)
          } else {
            $this.onMouseMove(et.pageX - rect.left, et.pageY - rect.top)
          }
        }
        // }
      },
      { passive: true }
    )
    parentContext.addEventListener(
      'touchend',
      function (event) {
        $this.scrollTop = drawParent.scrollTop
        $this.scrollLeft = drawParent.scrollLeft
        event.preventDefault()
        $this.onMouseUp()
      },
      false
    )
    parentContext.addEventListener(
      'touchcancel',
      function (event) {
        event.preventDefault()
        $this.onMouseOut()
      },
      false
    )
    parentContext.addEventListener(
      'touchstart',
      function (event) {
        console.log(mode, 'aaaaaaaa')
        if (isMobile()) {
          let gmenu = $('.gmenu')
          if ($('#toggle-varioussetting').prop('checked')) {
            gmenu.hide()
            $('#toggle-varioussetting').prop('checked', false)
          }
        }
        // for testing on desktop
        // if ($this.mode == BoardConfig.MODE_SWIPE) {
        //   $this.resizeCanvas(true)
        // } else {
        //   $this.resizeCanvas(false)
        // }

        //check if two fingers touched screen
        // if (mode !== 5) {
        if (event.targetTouches.length == 2) {
          //get rough estimate of distance between two fingers
          $this.lastDistance = Math.hypot(
            event.touches[0].pageX - event.touches[1].pageX,
            event.touches[0].pageY - event.touches[1].pageY
          )
          $this.zoomCoordinates.x =
            ((event.touches[0].clientX + event.touches[1].clientX) / 2 -
              parentContext.getBoundingClientRect().left) /
            $this.scale
          $this.zoomCoordinates.y =
            ((event.touches[0].clientY + event.touches[1].clientY) / 2 -
              parentContext.getBoundingClientRect().top) /
            $this.scale
        } else {
          var et = $this.getTouchEvent(event)
          var rect = document
            .getElementById('backgroundCanvas')
            .getBoundingClientRect()
          //var rect = document.getElementById("draw-area").getBoundingClientRect();
          setTimeout(() => {
            $this.firstPositionX = et.pageX
            $this.firstPositionY = et.pageY
          }, 20)

          $this.zoomCoordinates.x =
            (et.clientX - parentContext.getBoundingClientRect().left) /
            $this.scale
          $this.zoomCoordinates.y =
            (et.clientY - parentContext.getBoundingClientRect().top) /
            $this.scale
          if ($this.mode == BoardConfig.MODE_TEXT) {
            $this.onClick(et.pageX - rect.left, et.pageY - rect.top)
          } else {
            //event.preventDefault();
            $this.onMouseDown(et.pageX - rect.left, et.pageY - rect.top)
          }
        }
        // }
      },
      { passive: true }
    )

    parentContext.addEventListener(
      'click',
      function (e) {
        $this.onClick(e.offsetX, e.offsetY)
      },
      false
    )

    this.localText.input.addEventListener('keydown', this.onInputKeydown)
    document.addEventListener('click', this.onClickOutSide)
    document.addEventListener('touchstart', this.onClickOutSide)
    // document.getElementById("draw_parent").addEventListener("scroll", function(){
    //   $this.scrollTop = this.scrollTop;
    // });
  }

  this.resizeCanvas = function (isZoomIn) {
    if (isZoomIn) {
      $this.scale = $this.scale * BoardConfig.SCALE_FACTOR
      if ($this.scale > BoardConfig.MAX_SCALE)
        $this.scale = BoardConfig.MAX_SCALE
    } else {
      $this.scale = $this.scale / BoardConfig.SCALE_FACTOR
      if ($this.scale < $this.minScale) $this.scale = $this.minScale
    }

    var newDrawWidth = $this.drawWidth * $this.scale

    $('#draw').width(
      newDrawWidth < $this.drawWidth ? $this.drawWidth : newDrawWidth
    )
    $('#draw').height($('#draw').width() * canvas_ratio)

    var canvasElement = document.getElementById('remoteDrawCanvas')
    old_width = canvasElement.width
    old_height = canvasElement.height
    $this.setRatio(
      old_width / canvasElement.clientWidth,
      old_height / canvasElement.clientHeight
    )

    var startZoomPointer = document.getElementById('start_zoom_pointer')
    startZoomPointer.style.top = `${$this.zoomCoordinates.y * $this.scale}px`
    startZoomPointer.style.left = `${$this.zoomCoordinates.x * $this.scale}px`
    startZoomPointer.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center'
    })
  }

  this.getTouchEvent = function (e) {
    if (e.touches && e.touches.length) {
      return e.touches[0]
    } else if (e.changedTouches && e.changedTouches.length) {
      return e.changedTouches[0]
    }
    return e
  }

  this.writeMessage = function (EVENT, data) {
    if (EVENT != undefined && data != undefined)
      boardListener.onEvent(EVENT, data)
  }

  this.onClickOutSide = function (e) {
    var target = e.target
    if (!target.classList.contains('draw')) {
      if ($this.mode == BoardConfig.MODE_TEXT) {
        $this.localText.onKeydown(13)
        var value = $this.localText.getText()
        $this.localText.clearText()
        $this.writeMessage(BoardConfig.EVENT_CLICK, {
          x: $this.localText.getX(),
          y: $this.localText.getY(),
          value: value
        })
      }
    }
  }

  this.onAudio = function (type, isLocal) {
    if (isLocal == undefined || isLocal == true)
      this.writeMessage(BoardConfig.EVENT_AUDIO, {
        type: type
      })
    if (type == BoardConfig.AUDIO_TYPE_TIMEUP) this.audioManager.playTimeUp()
    else if (type == BoardConfig.AUDIO_TYPE_BELL) this.audioManager.playBell()
    else if (type == BoardConfig.AUDIO_TYPE_CORRECT)
      this.audioManager.playCorrect()
    else if (type == BoardConfig.AUDIO_TYPE_FANFARE)
      this.audioManager.playFanfare()
    else if (type == BoardConfig.AUDIO_TYPE_HANDCLAP)
      this.audioManager.playHandClap()
    else if (type == BoardConfig.AUDIO_TYPE_REGRET_FULLY)
      this.audioManager.playRegretFully()
    else if (type == BoardConfig.AUDIO_TYPE_TEL) this.audioManager.playTel()
    else if (type == BoardConfig.AUDIO_TYPE_SOUND) this.audioManager.playSound()
    else if (type == BoardConfig.AUDIO_TYPE_INCORRECT)
      this.audioManager.playIncorrect()
  }

  this.onModechange = function (mode, isLocal) {
    if (isLocal == undefined || isLocal == true) {
      this.writeMessage(BoardConfig.EVENT_MODE_CHANGE, {
        mode: mode
      })
      if (this.mode == BoardConfig.MODE_TEXT) {
        this.localText.onKeydown(13)
        var value = $this.localText.getText()
        $this.localText.clearText()
        $this.writeMessage(BoardConfig.EVENT_CLICK, {
          x: $this.localText.getX(),
          y: $this.localText.getY(),
          value: value
        })
        this.localText.hide()
      }
      this.mode = mode
    } else {
      if (
        $this.remoteMode == BoardConfig.MODE_MOUSE &&
        mode != BoardConfig.MODE_MOUSE
      ) {
        this.remoteMouse.hide()
      }
      $this.remoteMode = mode
    }
  }

  this.setMode = function (mode) {
    this.onModechange(mode)
  }

  this.setRemoteMode = function () {
    this.remoteText.hide()
    this.remoteMouse.hide()
  }

  this.onInputKeydown = function (e) {
    if ($this.mode == BoardConfig.MODE_TEXT) {
      if (e.keyCode == 13) {
        var value = $this.localText.getText()
        $this.localText.clearText()
        $this.writeMessage(BoardConfig.EVENT_CLICK, {
          x: $this.localText.getX(),
          y: $this.localText.getY(),
          value: value
        })
      }
    }
  }

  this.onClick = function (x, y, value, isLocal) {
    if (isLocal == undefined || isLocal == true) {
      if ($this.mode == BoardConfig.MODE_TEXT) {
        $this.localText.onClick(x, y)
        // $this.writeMessage(BoardConfig.EVENT_CLICK, {
        //     x: $this.localText.getX(),
        //     y: $this.localText.getY(),
        //     value: $this.localText.getText()
        // })
      }
    } else {
      if ($this.remoteMode == BoardConfig.MODE_TEXT) {
        $this.remoteText.drawText(value, x, y)
      }
    }
  }

  this.onMouseMove = function (x, y) {
    if (!$this.isMouseDown) {
      return
    }
    const xNew = Math.floor(x + 0.5)
    const yNew = Math.floor(y + 0.5)
    if ($this.mode == BoardConfig.MODE_PEN) {
      $this.localPen.onMouseMove(xNew, yNew)
      $this.positions.push({
        x: Math.floor($this.localPen.getX() + 0.5),
        y: Math.floor($this.localPen.getY() + 0.5)
      })
    } else if ($this.mode == BoardConfig.MODE_ERASER) {
      $this.localEraser.onMouseMove(xNew, yNew)
      $this.positions.push({
        x: Math.floor($this.localEraser.getX() + 0.5),
        y: Math.floor($this.localEraser.getY() + 0.5)
      })
    }
  }

  this.onMouseMoveRemote = function (positions) {
    if (!$this.isRemoteMouseDown) return
    if (!positions || positions?.length == 0) return
    positions.forEach((position) => {
      const xNew = Math.floor(position.x + 0.5)
      const yNew = Math.floor(position.y + 0.5)
      if ($this.remoteMode == BoardConfig.MODE_PEN) {
        $this.remotePen.onMouseMove(xNew, yNew)
      } else if ($this.remoteMode == BoardConfig.MODE_ERASER) {
        $this.remoteEraser.onMouseMove(xNew, yNew)
      }
    })
    if ($this.remoteMode == BoardConfig.MODE_PEN) {
      $this.remotePen.onMouseUp()
    } else if ($this.remoteMode == BoardConfig.MODE_ERASER)
      $this.remoteEraser.onMouseUp()
  }

  this.onMouseUp = function (isLocal) {
    if (isLocal == undefined || isLocal == true) {
      $this.isMouseDown = false
      $this.writeMessage(BoardConfig.EVENT_MOUSE_MOVE, this.positions)
      $this.positions = []
      if ($this.mode == BoardConfig.MODE_PEN) {
        $this.localPen.onMouseUp()
      } else if ($this.mode == BoardConfig.MODE_ERASER)
        $this.localEraser.onMouseUp()
      //$this.writeMessage(BoardConfig.EVENT_MOUSE_UP, {})
    } else $this.isRemoteMouseDown = false
  }

  this.onMouseOut = function (isLocal) {
    $this.isMouseDown = false
    if (isLocal == undefined || isLocal == true) {
      $this.writeMessage(BoardConfig.EVENT_MOUSE_MOVE, this.positions)
      $this.positions = []
      if ($this.mode == BoardConfig.MODE_PEN) $this.localPen.onMouseOut()
      else if ($this.mode == BoardConfig.MODE_ERASER)
        $this.localEraser.onMouseOut()
      else if ($this.mode == BoardConfig.MODE_MOUSE)
        $this.localMouse.onMouseOut()
      if ($this.mode == BoardConfig.MODE_MOUSE) {
        $this.writeMessage(BoardConfig.EVENT_MOUSE_OUT, {})
      }
    } else if ($this.remoteMode == BoardConfig.MODE_PEN)
      $this.remotePen.onMouseOut()
    else if ($this.remoteMode == BoardConfig.MODE_ERASER)
      $this.remoteEraser.onMouseOut()
    else if ($this.remoteMode == BoardConfig.MODE_MOUSE)
      $this.remoteMouse.onMouseOut()
  }

  this.onMouseDown = function (x, y, isLocal) {
    if (isLocal == undefined || isLocal == true) $this.isMouseDown = true
    else $this.isRemoteMouseDown = true

    const xNew = Math.floor(x + 0.5)
    const yNew = Math.floor(y + 0.5)

    if (isLocal == undefined || isLocal == true) {
      if ($this.mode == BoardConfig.MODE_PEN) {
        $this.localPen.onMouseDown(xNew, yNew)
        $this.writeMessage(BoardConfig.EVENT_MOUSE_DOWN, {
          x: Math.floor($this.localPen.getX() + 0.5),
          y: Math.floor($this.localPen.getY() + 0.5)
        })
      } else if ($this.mode == BoardConfig.MODE_ERASER) {
        $this.localEraser.onMouseDown(x, y)
        $this.writeMessage(BoardConfig.EVENT_MOUSE_DOWN, {
          x: Math.floor($this.localEraser.getX() + 0.5),
          y: Math.floor($this.localEraser.getY() + 0.5)
        })
      }
    } else if ($this.remoteMode == BoardConfig.MODE_PEN)
      $this.remotePen.onMouseDown(xNew, yNew)
    else if ($this.remoteMode == BoardConfig.MODE_ERASER)
      $this.remoteEraser.onMouseDown(xNew, yNew)
  }

  this.setDrawContextLineWidth = function (width, isLocal) {
    if (isLocal == undefined || isLocal == true) {
      this.writeMessage(BoardConfig.EVENT_CONFIG, {
        draw_line_width: width
      })
      this.localPen.setWidth(width)
    } else this.remotePen.setWidth(width)
  }
  this.setDrawContextStrokeStyle = function (color, isLocal) {
    if (isLocal == undefined || isLocal == true) {
      this.writeMessage(BoardConfig.EVENT_CONFIG, {
        draw_stroke_style: color
      })
      this.localPen.setStyle(color)
    } else this.remotePen.setStyle(color)
  }

  this.setDrawContextTextColor = function (color, isLocal) {
    if (isLocal == undefined || isLocal == true) {
      this.writeMessage(BoardConfig.EVENT_CONFIG, {
        draw_text_style: color
      })
      this.localText.setStyle(color)
    } else this.remoteText.setStyle(color)
  }

  this.setDrawContextTextSize = function (size, isLocal) {
    if (isLocal == undefined || isLocal == true) {
      this.writeMessage(BoardConfig.EVENT_CONFIG, {
        draw_text_size: size
      })
      this.localText.setSize(size)
    } else this.remoteText.setSize(size)
  }

  this.clearDrawContext = function () {
    this.localDrawContext.clearRect(
      0,
      0,
      localDrawCanvas.width,
      localDrawCanvas.height
    )
    this.remoteDrawContext.clearRect(
      0,
      0,
      localDrawCanvas.width,
      localDrawCanvas.height
    )
    this.writeMessage(BoardConfig.EVENT_CLEAR, {})
  }

  this.save = function (link) {
    var canvas = document.createElement('canvas')
    // canvas.width = localDrawCanvas.width;
    // canvas.height = localDrawCanvas.height;
    if (localDrawCanvas.width > backgroundCanvas.width) {
      canvas.width = localDrawCanvas.width
      canvas.height = localDrawCanvas.height
    } else {
      canvas.width = backgroundCanvas.width
      canvas.height = backgroundCanvas.height
    }
    var canvasContext = canvas.getContext('2d')
    canvasContext.fillStyle = 'white'
    canvasContext.fillRect(0, 0, canvas.width, canvas.height)
    // canvasContext.drawImage(backgroundCanvas, 0, 0);
    // canvasContext.drawImage(remoteDrawCanvas, 0, 0);;
    // canvasContext.drawImage(localDrawCanvas, 0, 0);
    canvasContext.drawImage(backgroundCanvas, 0, 0, canvas.width, canvas.height)
    canvasContext.drawImage(remoteDrawCanvas, 0, 0, canvas.width, canvas.height)
    canvasContext.drawImage(localDrawCanvas, 0, 0, canvas.width, canvas.height)

    link.href = canvas.toDataURL()
    var dateTime = new Date()
    var date = '' + dateTime.getFullYear()
    date += addDigit(dateTime.getMonth() + 1)
    date += addDigit(dateTime.getDate())
    date += addDigit(dateTime.getHours())
    date += addDigit(dateTime.getMinutes())
    date += addDigit(dateTime.getSeconds())

    const dateTimeWhiteboard = `${moment(new Date())
      .tz('Asia/Tokyo')
      .format('YYYYMMDDHHmmss')}`

    let FileName
    // let FileNameZip
    if (fileNameTextbook) {
      if (
        document.getElementById('currPage').style.display !== 'none' &&
        numPages > 1
      ) {
        link.download = fileNameTextbook + '_Eigox_p' + pagetodisplay + '.png'
        FileName = fileNameTextbook + '_Eigox_p' + pagetodisplay + '.png'
        // FileNameZip = fileNameTextbook + '_Eigox_p' + pagetodisplay + '.zip'
      } else {
        link.download = fileNameTextbook + '_Eigox' + '.png'
        FileName = fileNameTextbook + '_Eigox' + '.png'
        // FileNameZip =  fileNameTextbook + '_Eigox' + '.zip'
      }
    } else {
      link.download = 'whiteboard_' + dateTimeWhiteboard + '.png'
      FileName = 'whiteboard_' + dateTimeWhiteboard + '.png'
      // FileNameZip = 'whiteboard_' + date + '.zip'
    }

    if (isIOS() || isIpad()) {
      if (isIpad()) {
        if (isChromeIOS()) {
          // link.click()
          setTimeout(() => {
            canvas.toBlob((blob) => {
              var data = new FormData()
              data.append('file_name', `whiteboard_${nickName}_${roomName}.png`)
              data.append('file', blob)
              fetch(`${URL_LESSON_ROOM}/whiteboard`, {
                method: 'POST',
                body: data
              }).then((response) => {
                const url = `${URL_LESSON_ROOM}/whiteboard?file_name=whiteboard_${nickName}_${roomName}.png`
                let a = document.createElement('a')
                document.body.appendChild(a)
                a.href = url
                a.download = FileName
                a.click()
                document.body.removeChild(a)
              })
            })
          }, 100)
        } else {
          setTimeout(() => {
            let downloadWindow = window.open('about:blank', '_blank')
            downloadWindow.onpageshow = function (event) {
              if (event.persisted) {
                downloadWindow.close()
              }
            }
            canvas.toBlob((blob) => {
              var data = new FormData()
              data.append('file_name', `whiteboard_${nickName}_${roomName}.png`)
              data.append('file', blob)
              fetch(`${URL_LESSON_ROOM}/whiteboard`, {
                method: 'POST',
                body: data
              }).then((response) => {
                const url = `${URL_LESSON_ROOM}/whiteboard?file_name=whiteboard_${nickName}_${roomName}.png&is_zip=true`
                downloadWindow.location.href = url
                downloadWindow.location.replace(url)
                const checkClosed = setInterval(() => {
                  downloadWindow.close()
                  if (downloadWindow.closed) {
                    setTimeout(() => {
                      clearInterval(checkClosed)
                    }, 5000)
                  }
                }, 2000)
              })
            })
          }, 100)
        }
      } else {
        if (isChromeIOS()) {
          // link.click()
          canvas.toBlob((blob) => {
            var data = new FormData()
            data.append('file_name', `whiteboard_${nickName}_${roomName}.png`)
            data.append('file', blob)
            fetch(`${URL_LESSON_ROOM}/whiteboard`, {
              method: 'POST',
              body: data
            }).then((response) => {
              const url = `${URL_LESSON_ROOM}/whiteboard?file_name=whiteboard_${nickName}_${roomName}.png`
              let a = document.createElement('a')
              document.body.appendChild(a)
              a.href = url
              a.download = FileName
              a.click()
              document.body.removeChild(a)
            })
          })
        } else {
          setTimeout(() => {
            let downloadWindow = window.open('about:blank', '_blank')
            downloadWindow.onpageshow = function (event) {
              if (event.persisted) {
                downloadWindow.close()
              }
            }
            canvas.toBlob((blob) => {
              var data = new FormData()
              data.append('file_name', `whiteboard_${nickName}_${roomName}.png`)
              data.append('file', blob)
              fetch(`${URL_LESSON_ROOM}/whiteboard`, {
                method: 'POST',
                body: data
              }).then((response) => {
                const url = `${URL_LESSON_ROOM}/whiteboard?file_name=whiteboard_${nickName}_${roomName}.png&is_zip=true`
                downloadWindow.location.href = url
                downloadWindow.location.replace(url)
                const checkClosed = setInterval(() => {
                  downloadWindow.close()
                  if (downloadWindow.closed) {
                    setTimeout(() => {
                      clearInterval(checkClosed)
                    }, 5000)
                  }
                }, 2000)
              })
            })
          }, 100)
        }
      }
    } else link.click()

    delete canvasContext
    delete canvas
  }

  this.onRemoteEvent = function (msg) {
    if (msg.event != undefined && msg.data != undefined) {
      if (msg.event == BoardConfig.EVENT_MODE_CHANGE) {
        if (msg.data.mode != undefined) $this.onModechange(msg.data.mode, false)
      } else if (msg.event == BoardConfig.EVENT_MOUSE_DOWN)
        this.onMouseDown(msg.data.x, msg.data.y, false)
      else if (msg.event == BoardConfig.EVENT_MOUSE_MOVE)
        this.onMouseMoveRemote(msg.data)
      else if (msg.event == BoardConfig.EVENT_MOUSE_UP) this.onMouseUp(false)
      else if (msg.event == BoardConfig.EVENT_MOUSE_OUT) $this.onMouseOut(false)
      else if (msg.event == BoardConfig.EVENT_CLICK) {
        if (
          msg.data.x != undefined &&
          msg.data.y != undefined &&
          msg.data.value != undefined
        )
          this.onClick(msg.data.x, msg.data.y, msg.data.value, false)
      } else if (msg.event == BoardConfig.EVENT_CONFIG) {
        if (msg.data.draw_line_width != undefined)
          this.setDrawContextLineWidth(msg.data.draw_line_width, false)
        else if (msg.data.draw_stroke_style != undefined)
          this.setDrawContextStrokeStyle(msg.data.draw_stroke_style, false)
        else if (msg.data.draw_text_style != undefined)
          this.setDrawContextTextColor(msg.data.draw_text_style, false)
        else if (msg.data.draw_text_size != undefined)
          this.setDrawContextTextSize(msg.data.draw_text_size, false)
      } else if (msg.event == BoardConfig.EVENT_CLEAR) {
        this.localDrawContext.clearRect(
          0,
          0,
          localDrawCanvas.width,
          localDrawCanvas.height
        )
        this.remoteDrawContext.clearRect(
          0,
          0,
          localDrawCanvas.width,
          localDrawCanvas.height
        )
      } else if (msg.event == BoardConfig.EVENT_AUDIO) {
        this.onAudio(msg.data.type, false)
      }
    }
  }

  this.resetRatio = function (parentWidth, parentHeight) {
    this.localPen.setRatioX(localDrawCanvas.width / parentWidth)
    this.localText.setRatioX(localDrawCanvas.width / parentWidth)
    this.localEraser.setRatioX(localDrawCanvas.width / parentWidth)
    this.localMouse.setRatioX(localDrawCanvas.width / parentWidth)
    this.remotePen.setRatioX(localDrawCanvas.width / parentWidth)
    this.remoteText.setRatioX(localDrawCanvas.width / parentWidth)
    this.remoteEraser.setRatioX(localDrawCanvas.width / parentWidth)
    this.remoteMouse.setRatioX(localDrawCanvas.width / parentWidth)

    this.localPen.setRatioY(localDrawCanvas.height / parentHeight)
    this.localText.setRatioY(localDrawCanvas.height / parentHeight)
    this.localEraser.setRatioY(localDrawCanvas.height / parentHeight)
    this.localMouse.setRatioY(localDrawCanvas.height / parentHeight)
    this.remotePen.setRatioY(localDrawCanvas.height / parentHeight)
    this.remoteText.setRatioY(localDrawCanvas.height / parentHeight)
    this.remoteEraser.setRatioY(localDrawCanvas.height / parentHeight)
    this.remoteMouse.setRatioY(localDrawCanvas.height / parentHeight)
  }

  this.setRatio = function (newWidth, newHeight) {
    this.localPen.setRatioX(newWidth)
    this.localText.setRatioX(newWidth)
    this.localEraser.setRatioX(newWidth)
    this.localMouse.setRatioX(newWidth)
    this.remotePen.setRatioX(newWidth)
    this.remoteText.setRatioX(newWidth)
    this.remoteEraser.setRatioX(newWidth)
    this.remoteMouse.setRatioX(newWidth)

    this.localPen.setRatioY(newHeight)
    this.localText.setRatioY(newHeight)
    this.localEraser.setRatioY(newHeight)
    this.localMouse.setRatioY(newHeight)
    this.remotePen.setRatioY(newHeight)
    this.remoteText.setRatioY(newHeight)
    this.remoteEraser.setRatioY(newHeight)
    this.remoteMouse.setRatioY(newHeight)
  }

  this.setMinScale = function (scale) {
    this.scale = scale
    this.minScale = scale
  }

  this.setDefaultDrawWidth = function (width) {
    this.drawWidth = width
  }

  this.resetScale = function () {
    this.scale = this.minScale
  }

  this.resetBoard = function () {
    if (!!this.drawWidth) {
      $('#draw').width('100%')
      this.drawWidth = $('#draw').width()

      var newDrawWidth = $this.drawWidth * $this.scale

      $('#draw').width(
        newDrawWidth < $this.drawWidth ? $this.drawWidth : newDrawWidth
      )
      $('#draw').height($('#draw').width() * canvas_ratio)

      var startZoomPointer = document.getElementById('start_zoom_pointer')
      startZoomPointer.style.top = `${$this.zoomCoordinates.y * $this.scale}px`
      startZoomPointer.style.left = `${$this.zoomCoordinates.x * $this.scale}px`
      startZoomPointer.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
      })

      var canvasElement = document.getElementById('remoteDrawCanvas')
      old_width = canvasElement.width
      old_height = canvasElement.height
      $this.setRatio(
        old_width / canvasElement.clientWidth,
        old_height / canvasElement.clientHeight
      )
    }
  }

  this.__construct()
}
