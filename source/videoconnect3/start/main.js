const LIST_VIEW = 'list'
const THUMBNAIL_VIEW = 'thumbnail'

/*********************************************
 *              Common Variable
 *********************************************/
const CHAT_MAX_LINE_NUM = 5 // チャットの入力可能最大行数

const LOGFLAG = true //デバッグの表示・非表示を表す
var viewType = 4 //画面のタイル・スポットライト・サイドバーを表す
var displayMember = false //参加者欄の表示・非表示を表す
var displayChat = true //チャット欄の表示・非表示を表す
var displayPaint = false
var displayFullScreen = false //画面の通常・最大化を表す
var displayScreenVideo = false //画面共有の映像の実行中・終了を表す
var displayScreenAudio = false //画面共有の音声の実行中・終了を表す

var viewShareMode = false // 画面共有・ホワイトボード等の画面を大きくする
var spotUser = undefined //注目されている参加者

var useMic = true //マイクのミュート・アンミュートを表す
var useCamera = true //カメラの表示・非表示を表す

var deviceCameraId //使用中のカメラデバイスIDを保持
var deviceMicId //使用中のマイクデバイスIDを保持
var deviceOutputId //使用中の出力先IDを保持

var count = 1 //表示順位を紐づけするため 参加順に付ける
var member = [] //自分を含む参加者の { name : ニックネーム , priority : 表示順 } を格納する
var nickName //自分の名前 (他人と区別するため)
var roomName //部屋名
var userType

// modal fadeSpeed
var FADE_SPEED = 200 //モーダルの表示速度を表す

var Converter //コンバータクラス 実行先となるJSの処理を連結させるもの

var gainNode
// audioGraph
var localContext
var analyser
var javascriptNode

var remoteAudio = []

// check click file chat
let dataUpload = null
let displayFileChat = false
let ObjectFileChat = null
let isPDF = false
let isExtend = false

// save temp name image
let tempUrlImage = null
let tempUrlTextBook = null
let fileNameTextbook = null
let isTextBook = null
let toolModeCanvas = 'swipe'

// save DeviceDropList
var videoConfig
var audioConfig
var screenConfig

var isScreenShare = false

//mode : 0-home 1-canvas 2-screen 3-select 4-text
var mode = 0
var nextmode = 0

var localStream

var language = 'jp'

//部屋
var startTime = ''
var endTime = ''
var beforeTime = 0
var afterTime = 0

var startDate //開始時刻
var endDate //終了時刻
var waitDate //待機可能時刻

var isStart = false
var isEnd = false
var isExit = false
// var isBackTextbook = false
var lessonTimerID
var isDownloadFileChat = false
var note

var tempUserName = ''
// タイプ
var user_type = 0 // 0 生徒 1 講師
var ready_send_files = []

var canvas_ratio = 1.414285714285714
var total_height
var total_width
var start_x
var start_y
var thePDF = null
var numPages
var currPage
var pdf_padding_ratio = 0.01
var pdf_padding = 10
var canvasData_recvlocal
var canvasData_recvremote
var cumulativesum_pdf
var cumulativesum_recvlocal
var cumulativesum_recvremote
var canvasDataLocal_array
var canvasDataRemote_array
var canvasDataBackground_array
var pagetodisplay
var shareScreenStreamCopy
var localStreamCopy
var textbookChannel
var titleEN
var titleJA
var categoryId
var newSelection
var textbookURL
var textbookPDF
let windowHeightOrigin = 0
var isChatShare = false
var canvasLoaded = false
var checkExit = false
var checkOnConnectSuccess = false
let AllChat = false
let JoinWithoutCam = false
let previousCameraCount = 0

// リロードブラウザバック判定
if (isSafari()) {
  window.addEventListener('pagehide', () => {
    if (vsWebRTCClient && vsWebRTCClient.isConnected()) {
      if (!$partner) {
        if (!checkExit) {
          sendExitLog()
          logoutLog()
        }
      } else {
        vsWebRTCClient.sendMessage(
          $room,
          $partner,
          JSON.stringify({
            name: nickName,
            channel: 'exitRoom'
          }),
          false,
          'device'
        )
      }
    }
  })
} else {
  window.addEventListener('beforeunload', () => {
    if (vsWebRTCClient && vsWebRTCClient.isConnected()) {
      if (!$partner) {
        if (!checkExit) {
          sendExitLog()
          logoutLog()
        }
      } else {
        vsWebRTCClient.sendMessage(
          $room,
          $partner,
          JSON.stringify({
            name: nickName,
            channel: 'exitRoom'
          }),
          false,
          'device'
        )
      }
    }
  })
}

function getTimeData() {
  var dateTime = new Date()

  // var year = dateTime.getFullYear()
  // var month = dateTime.getMonth() + 1
  // var day = dateTime.getDate()
  // var hour = addDigit(dateTime.getHours())
  // var min = addDigit(dateTime.getMinutes())

  // console.log(
  //   `${moment(new Date(dateTime)).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm')}`,
  //   '9999999',
  //   year + '/' + month + '/' + day + ' ' + hour + ':' + min
  // )
  // return year + '/' + month + '/' + day + ' ' + hour + ':' + min

  return `${moment(new Date(dateTime))
    .tz('Asia/Tokyo')
    .format('YYYY/MM/DD HH:mm')}`
}

function setCanvasSize(element, width, height) {
  if (element) {
    element.width = width
    element.height = height
  }
}

function setAllCanvasRatio() {
  var canvasElementList = []
  canvasElementList.push(document.getElementById('remoteDrawCanvas'))
  canvasElementList.push(document.getElementById('localDrawCanvas'))
  canvasElementList.push(document.getElementById('localPointerCanvas'))
  canvasElementList.push(document.getElementById('remotePointerCanvas'))
  canvasElementList.push(document.getElementById('backgroundCanvas'))
  canvasElementList.forEach(function (element) {
    element.height = element.width * canvas_ratio
  })
}

function setAllCanvasSize(width, height) {
  var canvasElementList = []
  // canvasElementList.push(document.getElementById('remoteDrawCanvas'))
  // canvasElementList.push(document.getElementById('localDrawCanvas'))
  canvasElementList.push(document.getElementById('localPointerCanvas'))
  canvasElementList.push(document.getElementById('remotePointerCanvas'))
  canvasElementList.push(document.getElementById('backgroundCanvas'))
  canvasElementList.forEach(function (element) {
    setCanvasSize(element, width, height)
  })

  var canvasRemoteDraw = document.getElementById('remoteDrawCanvas')
  var canvasLocalDraw = document.getElementById('localDrawCanvas')
  if (canvasRemoteDraw && canvasLocalDraw) {
    canvasRemoteDraw.height = (canvasRemoteDraw.width * height) / width
    canvasLocalDraw.height = (canvasLocalDraw.width * height) / width
  }
}

function myHandler(e) {
  e.preventDefault()
}

//作成時のキャンバスの大きさを保持
var old_width
var old_height
var languageType
window.onload = function () {
  var expires = ''
  var date = new Date()
  date.setTime(date.getTime() + 730 * 24 * 60 * 60 * 1000)
  expires = '; expires=' + date.toUTCString()
  document.cookie = 'version' + '=' + VERSION + expires + '; path=/'

  let mainContent = document.getElementById('stream-contents')
  mainContent.addEventListener('mouseup', sendTextSelection)
  mainContent.addEventListener('keyup', sendTextSelection)
  mainContent.addEventListener('touchend', sendTextSelection)

  let versionText = document.getElementById('version')
  versionText.innerText = VERSION

  document.exitFullscreen =
    document.exitFullscreen ||
    document.cancelFullScreen ||
    document.mozCancelFullScreen ||
    document.webkitCancelFullScreen ||
    document.msExitFullscreen
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {}
  }
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      var getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia
      if (!getUserMedia) {
        return Promise.reject(
          new Error('getUserMedia is not implemented in this browser')
        )
      }
      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject)
      })
    }
  }

  document
    .getElementsByClassName('main-board')[0]
    .addEventListener('touchmove', myHandler, {
      passive: false
    })

  // スクロール無効
  // document.getElementById('draw_component').addEventListener(
  //   'touchmove',
  //   function (e) {
  //     e.preventDefault()
  //   },
  //   {
  //     passive: false
  //   }
  // )
  // document
  //   .getElementById('title_bar')
  //   .addEventListener('touchmove', myHandler, {
  //     passive: false
  //   })
  // document
  //   .getElementById('video-contents')
  //   .addEventListener('touchmove', myHandler, {
  //     passive: false
  //   })
  // document
  //   .getElementById('title_bar')
  //   .addEventListener('touchmove', myHandler, {
  //     passive: false
  //   })
  // document
  //   .getElementById('video-contents')
  //   .addEventListener('touchmove', myHandler, {
  //     passive: false
  //   })
  /*
  document.getElementById('stream-contents').addEventListener('touchmove', myHandler, {
    passive: false
  });*/
  //映像要素右クリック禁止
  var videoElements = document.getElementsByTagName('video')
  for (i = 0; i < videoElements.length; i++) {
    videoElements[i].addEventListener('contextmenu', function (e) {
      e.preventDefault()
    })
  }
  // setting Language
  if (localStorage.getItem('languageType')) {
    languageType = Number(localStorage.getItem('languageType'))
  } else {
    if (
      (
        navigator.browserLanguage ||
        navigator.language ||
        navigator.userLanguage
      ).substr(0, 2) === 'ja'
    ) {
      languageType = 1
    } else {
      languageType = 0
    }
  }

  changeLanguage(languageType)
  var remainingList = document.getElementsByClassName('time-remaining')
  for (let i = 0; i < remainingList.length; i++) {
    if (
      languageType % 2 == 1 &&
      remainingList[i].className.indexOf('jp') != -1
    ) {
      $(remainingList[i]).hide()
    }
    if (
      languageType % 2 == 0 &&
      remainingList[i].className.indexOf('en') != -1
    ) {
      $(remainingList[i]).hide()
    }
  }
  var remaining = document.getElementsByClassName('remaining')
  for (let i = 0; i < remaining.length; i++) {
    if (languageType % 2 == 1 && remaining[i].className.indexOf('jp') != -1) {
      $(remaining[i]).hide()
    }
    if (languageType % 2 == 0 && remaining[i].className.indexOf('en') != -1) {
      $(remaining[i]).hide()
    }
  }
  // URL Parameter get
  let sessionParam = getQueryString()
  let decodedString = atob(sessionParam['session'])
  let param = getQueryStringFromDecodeURL(decodedString)
  var namedata
  if (param != undefined) {
    if (param['room_id']) {
      roomName = param['room_id']
    }
    if (param['username']) {
      nickName = param['username']
    }
    if (param['usertype']) {
      userType = param['usertype']
      switch (param['usertype']) {
        case 'teacher':
          user_type = 1

          break
        case 'student':
          user_type = 0

          break
        default:
          user_type = 0
          break
      }
    }
  }
  /*
  namedata = namedata.split('_');
  nickName = namedata[1];
  switch (namedata[0]) {
    case "teacher":
      user_type = 1;
      break;
    case "student":
      user_type = 0;
      break;
    default:
      user_type = 0;
      break;
  }*/

  // userAgent function
  var ua = window.navigator.userAgent.toLowerCase()
  if (ua.indexOf('iphone') > 0 && ua.indexOf('mobile') > 0) {
    // autoGain false
    agc = false
  }
  if (isMobile()) {
    //画面共有ボタンを隠す
    $('#share-button').addClass('hide-contents')
    $('#record-button').addClass('hide-contents')
  } else {
    //チャットボタンを隠す
    $('#chat-button').addClass('hide-contents')
  }
  // toast setting
  jsFrame = new JSFrame()
  initPDF()

  getRoom(roomName)
  // note = new Note()
  // note.init('#editor', '#toolbar-container')
}

//時間確認の処理
function checkTime() {
  var st = Date.parse(startTime.replace(/-/g, '/'))
  var et = Date.parse(endTime.replace(/-/g, '/'))
  //現在時間
  var nowTime = new Date()
  //タイムゾーンの補正
  var timeDiff = nowTime.getTimezoneOffset() + 540
  //無制限設定がされている場合
  if (beforeTime == null) {
    beforeTime = 2592000000
  }
  if (afterTime == null) {
    afterTime = 2592000000
  }
  //主要時間の計算
  startDate = new Date(st - beforeTime * 60 * 1000 - timeDiff * 60 * 1000)
  endDate = new Date(et - timeDiff * 60 * 1000)
  waitDate = new Date(et + afterTime * 60 * 1000 - timeDiff * 60 * 1000)
  //一秒毎に実行
  //lessonTimerID = setInterval('dateTimeDisplay()', 1000);

  //予約が存在しない かつ 強制時刻より後
  if (startDate == undefined || waitDate <= nowTime) {
    endView()
  } else {
    lessonTimerID = setInterval('dateTimeDisplay()', 1000)
    if (nowTime < startDate) {
      isStart = false
      //$("#time-view").text(getTimeText(startDate));
      // $('#time-view').text(getTimeText(new Date(st - timeDiff * 60 * 1000)))

      if (languageType % 2 == 1) {
        moment.locale('ja')
        $('#time-view').text(
          `${moment(new Date(st - timeDiff * 60 * 1000), 'YYYY-MM-DD HH:mm:ss')
            .tz('Asia/Tokyo')
            .format('MMMMDo HH:mm')}（日本時間）`
        )
      } else {
        moment.locale('en')
        $('#time-view').text(
          `${moment(new Date(st - timeDiff * 60 * 1000), 'YYYY-MM-DD HH:mm:ss')
            .tz('Asia/Tokyo')
            .format('MMM. DD HH:mm')} (JP time)`
        )
      }

      $('#before-contents').show()
    } else {
      start()
    }
  }
}

function getTimeText(targetTime) {
  var timeText
  var dateTime = new Date(targetTime)
  var year = dateTime.getFullYear()
  var month = dateTime.getMonth() + 1
  var day = dateTime.getDate()
  var hour = addDigit(dateTime.getHours())
  var min = addDigit(dateTime.getMinutes())
  if (languageType % 2 == 1) {
    timeText = year + '年' + month + '月' + day + '日 ' + hour + ':' + min
    // timeText = year + '/' + month + '/' + day + ' ' + hour + ':' + min
  } else {
    timeText = year + '/' + month + '/' + day + ' ' + hour + ':' + min
  }

  return timeText
}

function endView() {
  isStart = false
  $('#background-Contents').show()
  $('#after-contents').show()
  $('#main-contents').hide()
}

function exitView() {
  $('#background-Contents').show()
  $('#exit-contents').show()
  $('#after-contents').hide()
  $('#main-contents').hide()
  $('.lessonend-modal').fadeOut(FADE_SPEED)
}

function start() {
  $('#background-Contents').hide()
  $('#before-contents').hide()
  $('#main-contents').show()
  isStart = true
  isExit = false
  const dateTime = new Date()

  if (dateTime.getTime() >= startDate.getTime() + beforeTime * 60 * 1000) {
    var beforeList = document.getElementsByClassName('time-before')
    while (beforeList.length) {
      beforeList.item(0).remove()
    }

    var remainingList = document.getElementsByClassName('time-remaining')

    for (let i = 0; i < remainingList.length; i++) {
      if (
        languageType % 2 == 1 &&
        remainingList[i].className.indexOf('jp') != -1
      ) {
        $(remainingList[i]).show()
      }
      if (
        languageType % 2 == 0 &&
        remainingList[i].className.indexOf('en') != -1
      ) {
        $(remainingList[i]).show()
      }
    }

    var remaining = document.getElementsByClassName('remaining')
    for (let i = 0; i < remaining.length; i++) {
      if (languageType % 2 == 1 && remaining[i].className.indexOf('jp') != -1) {
        $(remaining[i]).show()
      }
      if (languageType % 2 == 0 && remaining[i].className.indexOf('en') != -1) {
        $(remaining[i]).show()
      }
    }
  }

  //自分の追加
  addMember(nickName)
  //デバイスの許可・ドロップリストの作成
  getDevicePermission()
  //サイドコンテンツの表示
  sideContentsView()
  //ホワイトボードの作成設定
  var canvasElementList = []
  canvasElementList.push(document.getElementById('remoteDrawCanvas'))
  canvasElementList.push(document.getElementById('localDrawCanvas'))
  canvasElementList.push(document.getElementById('localPointerCanvas'))
  canvasElementList.push(document.getElementById('remotePointerCanvas'))
  canvasElementList.push(document.getElementById('backgroundCanvas'))
  canvasElementList.forEach(function (element) {
    setCanvasSize(element, 840, 1188)
  })
  initBoard()

  var userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.indexOf('chrome') == -1) {
    var speakerList = document.getElementsByClassName('speaker-select')
    for (let i = 0; i < speakerList.length; i++) {
      $(speakerList[i]).hide()
    }
  }
  window.addEventListener(
    'resize',
    function () {
      var canvasElement = document.getElementById('draw')
      if (!$('#toggle-board').prop('checked')) {
        $('#draw').height($('#draw').width() * canvas_ratio)
      } else {
        $('#draw').height($('#draw').width() * canvas_ratio)
      }
      board.setRatio(
        old_width / canvasElement.clientWidth,
        old_height / canvasElement.clientHeight
      )

      if (!isMobile()) {
        scaleTextbook($('#draw').innerWidth())
      }
    },
    false
  )

  let limitChat = 30
  let dataChat
  let CheckLoading = false

  $('#chat-area').on('scroll', async function () {
    const scrollPosition = $('#chat-area').scrollTop()
    const messageHeight = $('#chat-parent').height()

    // console.log(scrollPosition, CheckLoading, AllChat)

    //check for scrollposition and height
    if (scrollPosition < 1 && !CheckLoading && !AllChat) {
      //here load next messages
      limitChat += 30

      // console.log(checkOnConnectSuccess)

      // if (limitChat <= countChat || !countChat) {
      if (!checkOnConnectSuccess) {
        CheckLoading = true
        showLoadingChat('top')
        checkOnConnectSuccess = true
        dataChat = await chatRecovery(limitChat, true)

        AllChat = dataChat.checkAllChat

        if (!AllChat) {
          if (limitChat <= dataChat.countChat) {
            setTimeout(() => {
              scrollControl(
                document.getElementById('chat-area'),
                'loadMore',
                messageHeight * 30
              )
            }, 0)
          } else {
            setTimeout(() => {
              scrollControl(
                document.getElementById('chat-area'),
                'loadMore',
                (30 - (messageHeight - dataChat.countChat)) * messageHeight
              )
            }, 0)
          }
        }
        removeLoadingChat()
        CheckLoading = false
      } else {
        showLoadingChat('top')
        const checkLoadingInterval = setInterval(() => {
          if (!checkOnConnectSuccess) {
            removeLoadingChat()
            clearInterval(checkLoadingInterval)

            setTimeout(() => {
              scrollControl(
                document.getElementById('chat-area'),
                'loadMore',
                messageHeight * 15
              )
            }, 0)
          }
        }, 100)
      }

      // }
    }
  })
}

function restart() {
  location.replace(location.href)
}

var jsFrame

/*********************************************
 *              Member functions
 *********************************************/
function addMember(userName) {
  member.push({
    name: userName,
    priority: count++
  })
}

function removeMember(userName) {
  member = member.filter(function (user) {
    return user.name != userName
  })
}

const resizeBoard = (delay = 1000) => {
  setTimeout(() => {
    var canvasElement = document.getElementById('draw')
    var canvasRemoteDraw = document.getElementById('remoteDrawCanvas')
    old_width = canvasRemoteDraw.width
    old_height = canvasRemoteDraw.height

    var scale = canvasRemoteDraw.width / total_width

    if (board) {
      board.setMinScale(scale)
      //document.getElementById('draw_parent').scrollTo(0, 0)
      $('#draw').width('100%')
      $('#draw').height($('#draw').width() * canvas_ratio)
      board.setDefaultDrawWidth($('#draw').width())
      board.setRatio(
        old_width / canvasElement.clientWidth,
        old_height / canvasElement.clientHeight
      )
    }
  }, delay)
}

const changeExtendLayout = ({ isMe }) => {
  // Change layout
  $('#video-contents').css({ height: '20%' })
  $('#share-contents').css({ height: '80%' })
  $('#draw_component').css({ height: '80%' })
  $('#materialSelect-contents').css({ height: '80%' })
  $('#side-contents').css({ height: '80%' })

  $('#title_bar').hide()
  if (!isIpad()) {
    $('#main-contents').css({
      height: 'calc(100% - min(15vw, 80px) * 1.1 - 9px)'
    })
  } else {
    $('#main-contents').css({
      height: 'calc(100% - min(15vw, 80px))'
    })
  }

  $('#draw_parent').css({ background: 'white' })

  // Change video layout
  $('#main-videocontents').css({ display: 'flex' })
  $('#remoteVideo-parent').css({
    width: '50%',
    'box-shadow': 'unset',
    'border-radius': 0,
    border: 0,
    // 'border-right': '5px solid black',
    'border-top-left-radius': '5px',
    'border-bottom-left-radius': '5px'
  })
  $('#remoteVideo').css({ width: '104%' })
  $('#localVideo-parent').css({
    width: '50%',
    position: 'relative',
    height: '100%',
    top: '0px',
    left: '0px',
    'max-width': 'unset',
    'max-height': 'unset',
    border: 0,
    // 'border-left': '5px solid black',
    'border-radius': 0,
    'border-top-right-radius': '5px',
    'border-bottom-right-radius': '5px'
  })
  // $('.local-usertext').css({})

  $('#localName').text(nickName)

  // Change icon
  $('#btn-extend-up').hide()
  $('#btn-extend-down').show()

  resizeBoard(200)

  if (isMe && $partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        isExtend: true,
        channel: 'extendLayout'
      }),
      false,
      'device'
    )
  }
}

const resetExtendLayout = ({ isMe }) => {
  // Change layout
  document.querySelector('#video-contents').style.removeProperty('height')
  document.querySelector('#share-contents').style.removeProperty('height')
  document.querySelector('#draw_component').style.removeProperty('height')
  document
    .querySelector('#materialSelect-contents')
    .style.removeProperty('height')

  document.querySelector('#side-contents').style.removeProperty('height')

  $('#title_bar').show()
  if (!isIpad()) {
    document.querySelector('#main-contents').style.removeProperty('height')
  } else {
    document.querySelector('#main-contents').style.removeProperty('height')
  }
  document.querySelector('#draw_parent').style.removeProperty('background')

  // Reset video layout
  document.querySelector('#remoteVideo-parent').style.removeProperty('width')
  document
    .querySelector('#remoteVideo-parent')
    .style.removeProperty('box-shadow')
  document
    .querySelector('#remoteVideo-parent')
    .style.removeProperty('border-radius')
  document
    .querySelector('#remoteVideo-parent')
    .style.removeProperty('border-right')

  document.querySelector('#remoteVideo').style.removeProperty('width')

  document.querySelector('#localVideo-parent').style.removeProperty('width')
  document.querySelector('#localVideo-parent').style.removeProperty('position')
  document.querySelector('#localVideo-parent').style.removeProperty('height')
  document.querySelector('#localVideo-parent').style.removeProperty('top')
  document.querySelector('#localVideo-parent').style.removeProperty('left')
  document.querySelector('#localVideo-parent').style.removeProperty('max-width')
  document
    .querySelector('#localVideo-parent')
    .style.removeProperty('max-height')
  document.querySelector('#localVideo-parent').style.removeProperty('border')
  document
    .querySelector('#localVideo-parent')
    .style.removeProperty('border-radius')

  // Change icon
  $('#btn-extend-up').show()
  $('#btn-extend-down').hide()

  if (nickName && nickName.length > 5 && isMobile()) {
    tempUserName = nickName.slice(0, 5) + '...'
  } else if (username && nickName.length > 10) {
    tempUserName = nickName.slice(0, 10) + '...'
  } else {
    tempUserName = nickName
  }
  $('#localName').text(tempUserName)

  resizeBoard(200)

  if (isMe && $partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        isExtend: false,
        channel: 'extendLayout'
      }),
      false,
      'device'
    )
  }
}

const changeExtendLayoutLandscape = ({ isMe }) => {
  // Change layout

  $('#draw_parent').css({ background: 'white' })
  $('#stream-contents').css({ 'max-width': '15%', flex: '0 0 15%' })
  if (!isIpad()) {
    $('#side-contents').css({ 'max-width': '76%', flex: '0 0 76%' })
    $('#draw_component').css({ right: '-76vw', width: '76.1vw' })
    $('#materialSelect-contents').css({ right: '-77vw', width: '77.1vw' })
    $('#share-contents').css({ right: '-77vw', width: '77.1vw' })
  } else {
    $('#side-contents').css({ 'max-width': '85%', flex: '0 0 85%' })
    $('#draw_component').css({ right: '-85vw', width: '85.1vw' })
    $('#materialSelect-contents').css({ right: '-85vw', width: '85.1vw' })
    $('#share-contents').css({ right: '-85vw', width: '85.1vw' })
  }
  $('#main-videocontents').css({ 'flex-direction': 'column' })

  // Change video layout
  $('#main-videocontents').css({ display: 'flex' })
  $('#remoteVideo-parent').css({
    width: '100%',
    'box-shadow': 'unset',
    'border-radius': 0,
    border: 0,
    height: '50%',
    // 'border-right': '5px solid black',
    'border-top-left-radius': '5px',
    'border-top-right-radius': '5px'
  })
  $('#remoteVideo').css({ width: '104%' })
  $('#localVideo-parent').css({
    width: '100%',
    position: 'relative',
    height: '50%',
    top: '0px',
    left: '0px',
    'max-width': 'unset',
    'max-height': 'unset',
    border: 0,
    // 'border-left': '5px solid black',
    'border-radius': 0,
    'border-bottom-left-radius': '5px',
    'border-bottom-right-radius': '5px'
  })
  // $('.local-usertext').css({})

  $('#localName').text(nickName)

  // Change icon
  $('#btn-extend-false').hide()
  $('#btn-extend-true').show()

  resizeBoard(200)

  if (isMe && $partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        isExtend: true,
        channel: 'extendLayout'
      }),
      false,
      'device'
    )
  }
}

const resetExtendLayoutLandscape = ({ isMe }) => {
  // Change icon
  $('#btn-extend-false').show()
  $('#btn-extend-true').hide()

  document.querySelector('#draw_parent').style.removeProperty('background')
  document.querySelector('#stream-contents').style.removeProperty('max-width')
  document.querySelector('#stream-contents').style.removeProperty('flex')
  document.querySelector('#side-contents').style.removeProperty('max-width')
  document.querySelector('#side-contents').style.removeProperty('flex')

  document.querySelector('#main-videocontents').style.removeProperty('display')
  document
    .querySelector('#main-videocontents')
    .style.removeProperty('flex-direction')

  document.querySelector('#draw_component').style.removeProperty('right')
  document.querySelector('#draw_component').style.removeProperty('width')
  document.querySelector('#share-contents').style.removeProperty('right')
  document.querySelector('#share-contents').style.removeProperty('width')
  document
    .querySelector('#materialSelect-contents')
    .style.removeProperty('right')
  document
    .querySelector('#materialSelect-contents')
    .style.removeProperty('width')

  document.querySelector('#remoteVideo-parent').style.removeProperty('width')
  document
    .querySelector('#remoteVideo-parent')
    .style.removeProperty('box-shadow')
  document
    .querySelector('#remoteVideo-parent')
    .style.removeProperty('border-radius')
  document.querySelector('#remoteVideo-parent').style.removeProperty('border')
  document.querySelector('#remoteVideo-parent').style.removeProperty('height')
  document
    .querySelector('#remoteVideo-parent')
    .style.removeProperty('border-top-left-radius')
  document
    .querySelector('#remoteVideo-parent')
    .style.removeProperty('border-top-right-radius')

  // ================================
  document.querySelector('#localVideo-parent').style.removeProperty('width')
  document.querySelector('#localVideo-parent').style.removeProperty('position')
  document.querySelector('#localVideo-parent').style.removeProperty('height')
  document.querySelector('#localVideo-parent').style.removeProperty('top')
  document.querySelector('#localVideo-parent').style.removeProperty('left')
  document.querySelector('#localVideo-parent').style.removeProperty('max-width')
  document
    .querySelector('#localVideo-parent')
    .style.removeProperty('max-height')
  document.querySelector('#localVideo-parent').style.removeProperty('border')
  document
    .querySelector('#localVideo-parent')
    .style.removeProperty('border-radius')

  document
    .querySelector('#localVideo-parent')
    .style.removeProperty('border-bottom-left-radius')
  document
    .querySelector('#localVideo-parent')
    .style.removeProperty('border-bottom-right-radius')

  if (nickName && nickName.length > 5 && isMobile()) {
    tempUserName = nickName.slice(0, 5) + '...'
  } else if (username && nickName.length > 10) {
    tempUserName = nickName.slice(0, 10) + '...'
  } else {
    tempUserName = nickName
  }
  $('#localName').text(tempUserName)

  resizeBoard(200)

  if (isMe && $partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        isExtend: false,
        channel: 'extendLayout'
      }),
      false,
      'device'
    )
  }
}

// ===============================================
function exitShareMode() {
  // if (isMobile()) {
  //   $('#side-contents').css({ position: 'absolute', bottom: 0, 'z-index': 1 })
  // }

  displayFileChat = false
  if ($('#toggle-board').prop('checked')) {
    nextmode = 0
    $('.whiteboard-modal').fadeIn(FADE_SPEED)
  } else {
    //画面共有が有効の場合
    if ($('#toggle-screenshare').prop('checked')) {
      nextmode = 0
      // $('.screenshare-modal').fadeIn(FADE_SPEED)
      acceptExitShareScreen()
      return
    }
    //教材ホワイトボードが有効の場合
    if ($('#toggle-textshare').prop('checked')) {
      nextmode = 0
      // $('.teachingMaterials-modal').fadeIn(FADE_SPEED)
      acceptExitTextbook()
      return
    }
    //教材選択が有効の場合
    if ($('#toggle-textbook').prop('checked')) {
      $('#toggle-textbook').prop('checked', false)
    }
    //キャンバスの表示
    resetCanvas()
    $('#draw_component').show()
    if (isMobile()) {
      $('#draw_component').css({ 'z-index': 1, position: 'absolute' })
      $('#stream-contents').css({ height: '100%' })
      $('#side-contents').css({ 'z-index': 0 })
      // $('#video-contents').css({ height: '40%' })
    }
    $('#video-contents').hide()
    $('#share-contents').hide()
    $('#materialSelect-contents').hide()
    videoContentsView(true)
    var canvasElement = document.getElementById('draw')
    $('#draw').height($('#draw').width() * canvas_ratio)
    var canvasElement = document.getElementById('remoteDrawCanvas')
    old_width = canvasElement.width
    old_height = canvasElement.height
    board.setRatio(
      old_width / canvasElement.clientWidth,
      old_height / canvasElement.clientHeight
    )

    modeChange(0)
  }
}

const scaleTextbook = (containerWidth) => {
  $('#page-container')?.css({
    'transform-origin': '0% 0%',
    transform: `scale(${containerWidth / 800})`
  })
}

// ========================================= ======

/*********************************************
 *              Button functions
 *********************************************/
$(function () {
  //音声ボタン ====================
  console.log(useMic, 'useMic')

  if (isIpad()) {
    document.querySelector('.body-wrapper').classList.add('ipad')
  }

  $('#toggle-mic').prop('checked', !useMic)
  $('#toggle-submic').prop('checked', !useMic)

  $('#toggle-camera').prop('checked', !useCamera)
  $('#toggle-subcamera').prop('checked', !useCamera)

  if (window?.innerWidth <= 500 || isIpad() || isMobile()) {
    $('#tooltip-textbook').attr('tooltip', '')
    $('.tooltip-en').attr('tooltip', '')
    $('.tooltip-jp').attr('tooltip', '')
  }

  // Mobile
  // Mobile landscape
  // Ipad
  // Ipad landscape

  const portraitLayout = () => {
    $('#btn-extend').show()
    $('#btn-extend-landscape').hide()

    if (isExtend) {
      resetExtendLayoutLandscape({ isMe: false })
      changeExtendLayout({ isMe: false })
    }
  }
  const landscapeLayout = () => {
    $('#btn-extend').hide()
    $('#btn-extend-landscape').show()

    if (isExtend) {
      resetExtendLayout({ isMe: false })
      changeExtendLayoutLandscape({ isMe: false })
    }
  }

  const mobileCondition = () => {
    if (isMobile() && window.innerWidth <= 500) {
      portraitLayout()
    } else if (isMobile() && !isIpad() && window.innerWidth > 600) {
      landscapeLayout()
      // isExtend = true
    }
  }

  const ipadCondition = () => {
    console.log(window.innerWidth, window.innerHeight)
    if (isIpad()) {
      // Ipad - address bar
      if (window.innerWidth <= 850 && window.innerHeight >= 1024 - 150) {
        portraitLayout()
      }
      if (window.innerWidth >= 1024 && window.innerHeight <= 850) {
        landscapeLayout()
        // isExtend = true
      }
      // Ipad pro - address bar
      if (window.innerWidth <= 1024 && window.innerHeight >= 1366 - 150) {
        portraitLayout()
      }
      if (window.innerWidth >= 1366 && window.innerHeight <= 1024) {
        landscapeLayout()
        // isExtend = true
      }
    }
  }

  $(window).on('orientationchange', () => {
    setTimeout(() => {
      mobileCondition()
      ipadCondition()

      createNewVideo()
    }, 200)
  })

  if (isMobile()) {
    windowHeightOrigin = window.innerHeight
    $('.hide-btn').css({ display: 'none' })
    $('#side-contents').css({
      position: 'absolute',
      bottom: 0,
      right: 0
    })
    $('.file-attach').css({ display: 'none' })

    mobileCondition()
    ipadCondition()

    if (!isIpad()) {
      if (window.innerWidth <= 500) {
        $('.body-wrapper').css({
          height: `min(calc(${window.innerHeight}px + min(15vw, 80px) * 1.1 - 9px - 50px), 100vh)`
        })
      } else {
        $('.body-wrapper').css({
          height: `min(calc(${window.innerHeight}px + min(15vw, 80px) * 1.1 - 9px - 80px), 100vh)`
        })
      }
    } else {
      $('.body-wrapper').css({
        height: `min(calc(${window.innerHeight}px + min(15vw, 80px) * 1.1 - 9px - 80px), 100vh)`
      })
    }

    const iosVer = iOSversion() && iOSversion()[0]
    console.log(iosVer)
    // if (iosVer >= 16) {
    //   $('.empty-div').css({ height: '0px' })
    // } else {
    $('.empty-div').css({ height: '80px' })
    // }

    $('.empty-div').show()

    const specifiedElement = document.getElementById('send-area')
    var blurTimeout = null

    document.addEventListener('click', (event) => {
      if ($('#tab1').prop('checked')) {
        const isClickInside = specifiedElement.contains(event.target)

        if (!isClickInside) {
          if (!isIpad()) {
            $('.body-wrapper').css({
              height: `min(calc(${
                window.innerHeight
              }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
                window.scrollY,
                80
              )}px), 100vh)`
            })
          } else {
            $('.body-wrapper').css({
              height: `min(calc(${
                window.innerHeight
              }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
                window.scrollY,
                80
              )}px), 100vh)`
            })
          }
        } else {
          clearTimeout(blurTimeout)
        }
      }
    })

    document.querySelector('#chat-input').addEventListener('blur', (e) => {
      blurTimeout = window.setTimeout(() => {
        if (!isIpad()) {
          $('.body-wrapper').css({
            height:
              iosVer < 16
                ? `min(calc(${
                    window.innerHeight
                  }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
                    window.scrollY,
                    80
                  )}px), 100vh)`
                : `min(calc(${
                    window.innerHeight
                  }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
                    window.scrollY,
                    80
                  )}px), 100vh)`
          })
        } else {
          $('.body-wrapper').css({
            height: `min(calc(${
              window.innerHeight
            }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
              window.scrollY,
              80
            )}px), 100vh)`
          })
        }
      }, 500)
    })

    $('#chat-input').focus(() => {
      clearTimeout(blurTimeout)

      // $('.empty-div').css({ height: 0 })
      setTimeout(() => {
        if (!isIpad() && isIOS()) {
          const isBottomAddressBar =
            window.innerHeight - window.visualViewport.height < 10 ||
            window.innerHeight - window.visualViewport.height > 210

          console.log(
            window.innerHeight - window.visualViewport.height,
            'window.innerHeight - window.visualViewport.height'
          )

          $('.body-wrapper').css({
            height:
              iosVer < 16
                ? `min(calc(${
                    window.innerHeight / 2
                  }px + min(15vw, 80px) * 1.1 + 50px + ${Math.min(
                    window.scrollY,
                    80
                  )}px), 100vh)`
                : isBottomAddressBar
                ? window.visualViewport.height + 80
                : window.visualViewport.height + 45
          })
        } else if (isIpad()) {
          $('.body-wrapper').css({
            height: calHeightFocus()
          })
        }
      }, 700)
    })
    $('#Note-contents').click(() => {
      console.log('aaaaaa', window?.quill?.hasFocus())
      clearTimeout(blurTimeout)

      // $('.empty-div').css({ height: 0 })
      setTimeout(() => {
        if (!isIpad() && isIOS()) {
          console.log(window.innerHeight, 'window.innerHeight')
          console.log(
            window.innerHeight - window.visualViewport.height,
            'window.innerHeight - window.visualViewport.height'
          )
          const isBottomAddressBar =
            window.innerHeight - window.visualViewport.height < 10 ||
            window.innerHeight - window.visualViewport.height > 210
          console.log(isBottomAddressBar, 'isBottomAddressBar')
          $('.body-wrapper').css({
            height:
              iosVer < 16
                ? `min(calc(${
                    window.innerHeight / 2
                  }px + min(15vw, 80px) * 1.1 + 50px + ${Math.min(
                    window.scrollY,
                    80
                  )}px), 100vh)`
                : isBottomAddressBar
                ? window.visualViewport.height + 80
                : window.visualViewport.height + 45
          })
        } else if (isIpad()) {
          $('.body-wrapper').css({
            height:
              iosVer < 16
                ? `min(calc(${
                    window.innerHeight / 2
                  }px + min(15vw, 80px) * 1.1 + 180px + ${Math.min(
                    window.scrollY,
                    80
                  )}px), 100vh)`
                : `min(calc(${
                    window.innerHeight / 2
                  }px + min(15vw, 80px) * 1.1 + 180px + ${Math.min(
                    window.scrollY,
                    80
                  )}px), 100vh)`
          })
        }
      }, 700)
    })

    var scrollTimeout
    $(window).scroll(() => {
      console.log(window.visualViewport.height, 'window.innerHeight blur')

      const chatBoxBlur =
        !$('#chat-input').is(':focus') && $('#tab1').prop('checked')
      const noteBlur = !window?.quill?.hasFocus() && $('#tab2').prop('checked')
      const checkBlur = chatBoxBlur || noteBlur
      console.log(checkBlur, 'hasFocus')

      if (noteBlur && (isIOS() || isIpad())) {
        blurTimeout = window.setTimeout(() => {
          if (!isIpad()) {
            $('.body-wrapper').css({
              height:
                iosVer < 16
                  ? `min(calc(${
                      window.innerHeight
                    }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
                      window.scrollY,
                      80
                    )}px), 100vh)`
                  : `min(calc(${
                      window.innerHeight
                    }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
                      window.scrollY,
                      80
                    )}px), 100vh)`
            })
          } else {
            $('.body-wrapper').css({
              height: `min(calc(${
                window.innerHeight
              }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
                window.scrollY,
                80
              )}px), 100vh)`
            })
          }
        }, 500)
      } else if (!isIOS() && !isIpad()) {
        if (window.innerWidth <= 500) {
          $('.body-wrapper').css({
            height: `min(calc(${
              window.innerHeight
            }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
              window.scrollY,
              80
            )}px), 100vh)`
          })
        } else {
          $('.body-wrapper').css({
            height: `min(calc(${
              window.innerHeight
            }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
              window.scrollY,
              80
            )}px), 100vh)`
          })
        }
      }
      if (checkBlur && (isIOS() || isIpad())) {
        if (!isIpad()) {
          if (window.innerWidth <= 500) {
            if ($('#tab1').prop('checked')) {
              $('.body-wrapper').css({
                height: `min(calc(${
                  window.innerHeight
                }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
                  window.scrollY,
                  80
                )}px), 100vh)`
              })
            } else {
              $('.body-wrapper').css({
                height: `min(calc(${
                  window.innerHeight
                }px + min(15vw, 80px) * 1.1 - 9px - 70px + ${Math.min(
                  window.scrollY,
                  80
                )}px), 100vh)`
              })
            }
          } else {
            $('.body-wrapper').css({
              height: `min(calc(${
                window.innerHeight
              }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
                window.scrollY,
                80
              )}px), 100vh)`
            })
          }
        } else {
          $('.body-wrapper').css({
            height: `min(calc(${
              window.innerHeight
            }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
              window.scrollY,
              80
            )}px), 100vh)`
          })
        }
      } else if (!isIOS() && !isIpad()) {
        if (window.innerWidth <= 500) {
          $('.body-wrapper').css({
            height: `min(calc(${
              window.innerHeight
            }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
              window.scrollY,
              80
            )}px), 100vh)`
          })
        } else {
          $('.body-wrapper').css({
            height: `min(calc(${
              window.innerHeight
            }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
              window.scrollY,
              80
            )}px), 100vh)`
          })
        }
      }

      // if (!(window.innerWidth > 500 && window.innerHeight <= 500)) {
      clearTimeout(scrollTimeout)
      if (window.innerHeight - windowHeightOrigin <= 100) {
        scrollTimeout = window.setTimeout(() => {
          if (
            ($('#chat-input').is(':focus') || window?.quill?.hasFocus()) &&
            window.innerWidth > 500 &&
            window.innerHeight <= 500 &&
            isIOS()
          ) {
            window.scrollTo(0, 70)
          } else if (
            isIpad() &&
            window.innerWidth >= 1024 &&
            window.innerHeight < 850 &&
            ($('#chat-input').is(':focus') || window?.quill?.hasFocus())
          ) {
            // window.scrollTo(0, 250)
          } else {
            window.scrollTo(0, 1)
          }
        }, 300)
      } else {
        clearTimeout(scrollTimeout)
      }
      // }
    })
    $(window).resize(() => {
      console.log(window.innerHeight - windowHeightOrigin)
      const chatBoxBlur =
        !$('#chat-input').is(':focus') && $('#tab1').prop('checked')
      const noteBlur = !window?.quill?.hasFocus() && $('#tab2').prop('checked')
      const checkBlur = chatBoxBlur || noteBlur

      console.log(window?.quill?.hasFocus(), 'window?.quill?.hasFocus()')

      if (checkBlur && (isIOS() || isIpad())) {
        if (!isIpad()) {
          if (window.innerWidth <= 500) {
            $('.body-wrapper').css({
              height: `min(calc(${
                window.innerHeight
              }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
                window.scrollY,
                80
              )}px), 100vh)`
            })
          } else {
            $('.body-wrapper').css({
              height: `min(calc(${
                window.innerHeight
              }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
                window.scrollY,
                80
              )}px), 100vh)`
            })
          }
        } else {
          $('.body-wrapper').css({
            height: `min(calc(${
              window.innerHeight
            }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
              window.scrollY,
              80
            )}px), 100vh)`
          })
        }
      } else if (!isIOS() && !isIpad()) {
        if (window.innerWidth <= 500) {
          $('.body-wrapper').css({
            height: `min(calc(${
              window.innerHeight
            }px + min(15vw, 80px) * 1.1 - 9px - 50px + ${Math.min(
              window.scrollY,
              80
            )}px), 100vh)`
          })
        } else {
          $('.body-wrapper').css({
            height: `min(calc(${
              window.innerHeight
            }px + min(15vw, 80px) * 1.1 - 9px - 80px + ${Math.min(
              window.scrollY,
              80
            )}px), 100vh)`
          })
        }
      }

      if (window.innerHeight - windowHeightOrigin > 50) {
        if (isIOS()) {
          $('.empty-div').css({ height: '5px' })
        } else {
          $('.empty-div').css({ height: '0' })
        }
        console.log('Extend')
      } else {
        $('.empty-div').css({ height: '80px' })
      }
    })
  } else {
    $('.file-attach').css({ display: 'flex' })
    $('#btn-extend').hide()
    $('#btn-extend-landscape').hide()
    $('.body-wrapper').css({ height: '100vh' })
    $('.empty-div').hide()
  }
  function waitForPauseMic() {
    var checked = Converter.pauseTrack('audio')
    if (checked) {
      useMic = false
      $('#toggle-submic').prop('checked', true)
    } else {
      setTimeout(waitForPauseMic, 1000)
    }
  }
  function waitForPauseMicFunction() {
    var checked = converterDone(Converter.pauseTrack)
    if (checked) {
      waitForPauseMic()
    } else {
      setTimeout(waitForPauseMicFunction, 1000)
    }
  }
  $('#type-done-btn').on('click', () => {
    $('chat-input').blur()
  })
  $('#btn_mic').on('click', function () {
    if (!$('#toggle-mic').prop('checked')) {
      waitForPauseMicFunction()
    } else {
      if (converterDone(Converter.resumeTrack)) {
        Converter.resumeTrack('audio')
        $('#toggle-submic').prop('checked', false)
        useMic = true
      }
    }
    if (converterDone(Converter.sendStatus)) {
      Converter.sendStatus(!$('#toggle-mic').prop('checked'))
    }

    // if (audioTrack) {
    //   audioTrack.enabled = useMic
    // }
  })

  $('#btn-extend').on('click', () => {
    if (!isExtend && isMobile() && (window.innerWidth < 500 || isIpad())) {
      changeExtendLayout({ isMe: true })
    } else if (
      isMobile() &&
      isExtend &&
      (window.innerWidth < 500 || isIpad())
    ) {
      resetExtendLayout({ isMe: true })
    }
    isExtend = !isExtend
  })

  $('#btn-extend-landscape').on('click', () => {
    if (!isExtend && isMobile()) {
      changeExtendLayoutLandscape({ isMe: true })
    } else if (isMobile() && isExtend) {
      resetExtendLayoutLandscape({ isMe: true })
    }
    isExtend = !isExtend
  })
  //映像ボタン ====================
  $('#btn_camera').on('click', function () {
    useCamera = !useCamera
    if (!$('#toggle-camera').prop('checked')) {
      if (converterDone(Converter.pauseTrack)) {
        Converter.pauseTrack('video')
        $('#toggle-subcamera').prop('checked', true)
      }
    } else {
      if (converterDone(Converter.resumeTrack)) {
        Converter.resumeTrack('video')
        $('#toggle-subcamera').prop('checked', false)
      }
    }

    if (converterDone(Converter.sendCameraStatus)) {
      Converter.sendCameraStatus(!$('#toggle-camera').prop('checked'))
    }
  })
  //設定 ====================
  $('.setting-modal-open').on('click', function () {
    if (document.getElementById('loader').style.visibility == 'visible') return
    createAudioGraph(Converter.getLocalStream('device'))
    $('.setting-modal').fadeIn(FADE_SPEED)
    return false
  })
  $('.setting-modal-close').on('click', function () {
    javascriptNode.disconnect(localContext)
    $('.setting-modal').fadeOut(FADE_SPEED)
    return false
  })
  $('#btn_setting').on('click', function () {
    // changeDeviceList()
    if (localStorage.getItem('micId')) {
      selectDropList(
        JSON.parse(localStorage.getItem('micId')).id,
        document.getElementById('config_mic'),
        displayScreenAudio
      )
    } else {
      getDeviceList().then(function (results) {
        let defaultMic = results.filter(
          (item) => item.deviceId === 'default' && item.kind === 'audioinput'
        )

        let selectMic = results.filter(
          (item) =>
            item.deviceId !== 'default' &&
            defaultMic[0].label.includes(item.label)
        )
        selectDropList(
          selectMic[0].deviceId,
          document.getElementById('config_mic'),
          displayScreenAudio
        )
      })
    }
    return false
  })
  //映像ドロップリストが変更された
  $('#config_camera').change(function () {
    deviceCameraId = $('#config_camera').val()
    videoConfig.changeDeviceId(deviceCameraId)
    changeDeviceStream('video')
  })
  //映像ドロップリストが変更された
  $('#first_camera').change(function () {
    deviceCameraId = $('#first_camera').val()
  })
  //音声ドロップリストが変更された
  $('#config_mic').change(function () {
    var targetElement = document.getElementById('config_mic')
    var targetIndex = targetElement.selectedIndex
    deviceMicId = targetElement.options[targetIndex].value
    localStorage.setItem(
      'micId',
      JSON.stringify({
        id: deviceMicId,
        name: nickName
      })
    )
    audioConfig.changeDeviceId(deviceMicId)
    changeDeviceStream('audio')
  })
  //映像ドロップリストが変更された
  $('#first_mic').change(function () {
    deviceMicId = $('#first_mic').val()
  })
  //出力ドロップリストが更新された
  $('#config_output').change(function () {
    changeAudioOutput(document.getElementById('remoteVideo'))
  })
  //音量調整が更新された
  $('#config_volumn').change(function (e) {
    if (converterDone(Converter.sendVolumn)) {
      Converter.sendVolumn($(this).val())
    }
  })
  //画面共有  ====================
  $('#btn_screenshare').on('click', function () {
    if (document.getElementById('loader').style.visibility == 'visible') return
    if ($('#toggle-screenshare').prop('checked')) {
      nextmode = 0
      // $('.screenshare-modal').fadeIn(FADE_SPEED)
      acceptExitShareScreen()
    } else {
      if ($('#toggle-board').prop('checked')) {
        nextmode = 2
        $('.whiteboard-modal').fadeIn(FADE_SPEED)
        return
      }
      //教材ホワイトボードが有効の場合
      if ($('#toggle-textshare').prop('checked')) {
        nextmode = 2
        // $('.teachingMaterials-modal').fadeIn(FADE_SPEED)
        acceptExitTextbook()
        return
      }
      //教材選択が有効の場合
      if ($('#toggle-textbook').prop('checked')) {
        $('#toggle-textbook').prop('checked', false)
      }
      vsWebRTCClient.makeStream(
        [StreamHandler.TRACK_KIND_SCREEN],
        onMakeScreen,
        onFailScreen,
        StreamHandler.TRACK_CREATE_NEW,
        true,
        'screen' + nickName
      )

      isScreenShare = true
    }
  })
  $('#sharescreen_accept').on('click', function () {
    if (displayFileChat) {
      alterShowFileChat(dataUpload)
      displayFileChat = false
      $('#toggle-screenshare').prop('checked', false)
      acceptChangeView(true)
      return false
    }
    acceptChangeView(true)
    resetCanvas()
    getMaterialGroup()

    //send signal
    if ($('#toggle-textbook').prop('checked')) {
      sendSignalGetTextBook()
    }
    return false
  })
  $('#sharescreen_reject').on('click', function () {
    rejectChangeView()
    $('.screenshare-modal').fadeOut(FADE_SPEED)
    return false
  })
  $('.screenshare-modal-close').on('click', function () {
    $('.screenshare-modal').fadeOut(FADE_SPEED)
    return false
  })
  $('#btn_fullshare').on('click', function () {
    if ($('#toggle-fullshare').prop('checked')) {
      document.getElementById('share-contents').classList.remove('fullSizeTest')
    } else {
      document.getElementById('share-contents').classList.add('fullSizeTest')
    }
  })
  $('#btn_fullscreenpartner').on('click', function () {
    if ($('#toggle-fullscreenpartner').prop('checked')) {
      document
        .getElementById('remoteVideo-parent')
        .classList.remove('fullSizeTest')
    } else {
      document
        .getElementById('remoteVideo-parent')
        .classList.add('fullSizeTest')
    }
  })
  //ホワイトボード  ====================
  // if (isMobile()) {
  //   $('#side-contents').css({ 'z-index': 1 })
  // }
  $('#btn_chat').on('click', () => {
    if ($('#toggle-chat').prop('checked')) {
      $('#side-contents').css({ 'z-index': 0 })

      if (isMobile()) {
        $('#share-contents').css({ 'z-index': 2 })
      }
    } else if (
      $('#toggle-board').prop('checked') ||
      $('#toggle-textbook').prop('checked') ||
      mode === 2
    ) {
      $('#side-contents').css({
        position: 'absolute',
        bottom: 0,
        'z-index': 1,
        right: 0
      })
      if (isMobile()) {
        $('#share-contents').css({ 'z-index': 1 })
      }
    }
  })

  $('#btn-pen').on('click', () => {
    if ($('#mode-pen').prop('checked')) {
      setMode('swipe')
    } else {
      $('#mode-eraser').prop('checked', false)
    }
  })
  $('#btn-eraser').on('click', () => {
    if ($('#mode-eraser').prop('checked')) {
      setMode('swipe')
    } else {
      $('#mode-pen').prop('checked', false)
    }
  })

  $('#btn_board').on('click', function () {
    if (document.getElementById('loader').style.visibility == 'visible') return
    //ホワイトボードが有効の場合

    if (!$('#toggle-textbook').prop('checked')) {
      showBackTextbook(false)
    }

    $('#side-contents').css({ 'z-index': 0 })
    $('#toggle-chat').prop('checked', false)
    if ($('#toggle-board').prop('checked')) {
      nextmode = 0

      $('.whiteboard-modal').fadeIn(FADE_SPEED)
    } else {
      // whiteboard: show download button
      $('#download-whiteboard').show()
      $('#download-textbook').hide()

      // showBackTextbook(false)
      //画面共有が有効の場合
      if ($('#toggle-screenshare').prop('checked')) {
        nextmode = 1
        // $('.screenshare-modal').fadeIn(FADE_SPEED)
        acceptExitShareScreen()
        setTimeout(() => {
          $('#toggle-board').prop('checked', true)
          createNewVideo()
        }, 100)

        // return
      }
      //教材ホワイトボードが有効の場合
      if ($('#toggle-textshare').prop('checked')) {
        nextmode = 1
        // $('.teachingMaterials-modal').fadeIn(FADE_SPEED)
        acceptExitTextbook()
        setTimeout(() => {
          $('#toggle-board').prop('checked', true)
        }, 100)
        return
      }
      //教材選択が有効の場合
      if ($('#toggle-textbook').prop('checked')) {
        $('#toggle-textbook').prop('checked', false)
      }
      //キャンバスの表示
      resetCanvas()
      resetTextbookHtml()
      $('#draw_component').show()
      $('#btn-pen').show()
      $('#btn-eraser').show()

      if (isMobile()) {
        $('#draw_component').css({ 'z-index': 1, position: 'absolute' })
        $('#stream-contents').css({ height: '100%' })
        $('#side-contents').css({ 'z-index': 0 })
        // $('#video-contents').css({ height: '40%' })
      }

      $('#video-contents').hide()
      $('#share-contents').hide()
      $('#materialSelect-contents').hide()
      videoContentsView(true)

      hideButtonPrevNext()

      fileNameTextbook = null
      var canvasElement = document.getElementById('draw')
      var canvasRemoteDraw = document.getElementById('remoteDrawCanvas')
      old_width = canvasRemoteDraw.width
      old_height = canvasRemoteDraw.height

      var scale = canvasRemoteDraw.width / total_width
      board.setMinScale(scale)
      //document.getElementById('draw_parent').scrollTo(0, 0)
      $('#draw').width('100%')
      $('#draw').height($('#draw').width() * canvas_ratio)
      board.setDefaultDrawWidth($('#draw').width())
      board.setRatio(
        old_width / canvasElement.clientWidth,
        old_height / canvasElement.clientHeight
      )
      // var canvasElement = document.getElementById('draw')
      // $('#draw').height($('#draw').width() * canvas_ratio)
      // board.setDefaultDrawWidth($('#draw').width())

      // var canvasElement = document.getElementById('remoteDrawCanvas')
      // old_width = canvasElement.width
      // old_height = canvasElement.height
      // board.setRatio(
      //   old_width / canvasElement.clientWidth,
      //   old_height / canvasElement.clientHeight
      // )
      modeChange(1)
    }
  })

  //ホワイトボード終了する
  $('#whiteboard_accept').on('click', function () {
    // showBackTextbook(false)
    $('#backTextbook').hide()
    if (displayFileChat) {
      displayFileChat = false
      acceptChangeView(true)
      alterShowFileChat(dataUpload)
      return false
    }
    if (isMobile() && !$('#toggle-textbook').prop('checked')) {
      $('#side-contents').css({
        position: 'absolute',
        bottom: 0,
        'z-index': 0
      })
    }

    resetIsChatShareFunc()
    resetCanvas()
    resetBackCanvas()
    resetTextbookHtml()
    acceptChangeView(true)
    getMaterialGroup()

    //send signal
    if ($('#toggle-textbook').prop('checked')) {
      sendSignalGetTextBook()
    }
    return false
  })
  //ホワイトボード終了しない
  $('#whiteboard_reject').on('click', function () {
    rejectChangeView()
    $('.whiteboard-modal').fadeOut(FADE_SPEED)
    return false
  })
  $('.whiteboard-modal-close').on('click', function () {
    $('.whiteboard-modal').fadeOut(FADE_SPEED)

    return false
  })
  //教材共有  ====================
  //  $('#btn_teachingMaterials').on('click', function() {
  $('#btn_textbook').on('click', function () {
    if (document.getElementById('loader').style.visibility == 'visible') return
    //選択画面にいる場合
    $('#side-contents').css({ 'z-index': 0 })
    $('#toggle-chat').prop('checked', false)
    if ($('#toggle-textbook').prop('checked')) {
      if ($('#toggle-textshare').prop('checked')) {
        nextmode = 0
        // $('.teachingMaterials-modal').fadeIn(FADE_SPEED)
        acceptExitTextbook()
        setTimeout(() => {
          $('#toggle-textbook').prop('checked', false)
        }, 100)
      } else {
        nextmode = 0
        resetCanvas()
        resetBackCanvas()
        resetTextbookList()
        acceptChangeView(true)
        $('#toggle-textbook').prop('checked', true)
        // nextmode = 0
        // $('#materialSelect-contents').hide()
        // $('#video-contents').show()
        // $('#toggle-chat').prop('checked', true)
        // videoContentsView(false)
        //modeChange(0);
      }
    } else {
      // textbook: show download button
      $('#download-whiteboard').hide()
      $('#download-textbook').show()

      // 選択画面ではない
      //テキスト共有している場合
      if ($('#toggle-textshare').prop('checked')) {
        // nextmode = 0
        // $('.teachingMaterials-modal').fadeIn(FADE_SPEED)
        nextmode = 3
        $('.whiteboard-modal').fadeIn(FADE_SPEED)
        /*
        nextmode = 0;
        $("#materialSelect-contents").hide();
        $("#video-contents").show();
        videoContentsView(false);
        modeChange(0);
        */
      } else {
        //画面共有が有効の場合
        if ($('#toggle-screenshare').prop('checked')) {
          nextmode = 3
          // $('.screenshare-modal').fadeIn(FADE_SPEED)
          acceptExitShareScreen()
          setTimeout(() => {
            $('#toggle-textbook').prop('checked', true)
          }, 100)
          return
        }
        //ホワイトボードが有効の場合
        if ($('#toggle-board').prop('checked')) {
          nextmode = 3
          $('.whiteboard-modal').fadeIn(FADE_SPEED)
          return
        }
        $('#materialSelect-contents').show()

        //send signal
        sendSignalGetTextBook()

        getMaterialGroup()
        if (isMobile()) {
          $('#materialSelect-contents').css({
            'z-index': 1,
            position: 'absolute'
            // width: '100%'
          })
          $('#stream-contents').css({ height: '100%' })
          $('.view-mode-group').css({ display: 'none' })
          $('#side-contents').css({ 'z-index': 0 })
          // $('#video-contents').css({ height: '40%' })
        }

        $('#video-contents').hide()
        $('#share-contents').hide()
        $('#draw_component').hide()
        videoContentsView(true)
        //modeChange(3); // 通知しない
      }
    }
  })

  $('#teachingMaterials_accept').on('click', function () {
    if (displayFileChat) {
      alterShowFileChat(dataUpload)
      displayFileChat = false
      acceptChangeView(true)
      return false
    }
    // 教材許可
    resetCanvas()
    resetBackCanvas()
    acceptChangeView(true)

    if (isMobile() && !$('#toggle-board').prop('checked')) {
      $('#side-contents').css({
        position: 'absolute',
        bottom: 0,
        'z-index': 1
      })
    }
    return false
  })
  $('#teachingMaterials_reject').on('click', function () {
    // 教材拒否
    rejectChangeView()
    $('.teachingMaterials-modal').fadeOut(FADE_SPEED)
    return false
  })
  $('.teachingMaterials-modal-close').on('click', function () {
    $('.teachingMaterials-modal').fadeOut(FADE_SPEED)
    return false
  })
  $('#btn_filter').on('click', function () {
    getTeachingMaterial(createPDFElement)
  })
  //メッセージ送信ボタン
  // $('#btn-send').click(function () {
  //   var inputElement = document.getElementById('chat-input')
  //   var message = inputElement.value.trim()

  //   debugLog('チャット', '送信完了', 'pink')
  //   if (converterDone(Converter.sendChat)) {
  //     Converter.sendChat(message, ready_send_files)
  //   }
  //   if (message.length > 0) {
  //     var dataTime = new Date()
  //     var hour = addDigit(dataTime.getHours())
  //     var min = addDigit(dataTime.getMinutes())
  //     //吹き出しを作成
  //     createChatBubble(
  //       Converter.getMyUserName(),
  //       inputElement.value,
  //       undefined,
  //       false
  //     )
  //     //入力欄の初期化
  //     inputElement.value = ''
  //   }
  // })

  $('#btn-send').on('click', function (e) {
    e.preventDefault()
    var inputElement = document.getElementById('chat-input')
    var message = inputElement.value.trim()

    if (message.length > 60000) {
      if (languageType % 2 === 0) {
        alert('Please enter no more than 60000 characters')
      } else {
        alert('60000文字以下入力してください。')
      }
    } else {
      debugLog('チャット', '送信完了', 'pink')
      if (converterDone(Converter.sendChat)) {
        Converter.sendChat(message)
      }
      inputElement.value = ''
      if (
        !(
          window.innerWidth >= 414 &&
          window.innerWidth <= 992 &&
          window.innerHeight <= 414
        )
      ) {
        inputElement.focus()
      }
    }
  })

  // 言語ボタン
  $('#btn_language').on('click', function () {
    languageType++
    changeLanguage(languageType % 2)
    dateTimeDisplay()
    var remaining = document.getElementsByClassName('remaining')
    var remainingList = document.getElementsByClassName('time-remaining')

    var dateTime = new Date()
    var time = endDate - dateTime
    var remainingTime = Math.ceil(time / 60 / 1000) //切り上げ
    remainingTime = Math.min(remainingTime, 14400000)

    if (dateTime.getTime() < startDate.getTime() + beforeTime * 60 * 1000) {
      for (let i = 0; i < remaining.length; i++) {
        if (
          languageType % 2 == 1 &&
          remaining[i].className.indexOf('jp') != -1
        ) {
          $(remaining[i]).hide()
        }
        if (
          languageType % 2 == 0 &&
          remaining[i].className.indexOf('en') != -1
        ) {
          $(remaining[i]).hide()
        }

        if (
          languageType % 2 == 1 &&
          remainingList[i].className.indexOf('jp') != -1
        ) {
          $(remainingList[i]).hide()
        }
        if (
          languageType % 2 == 0 &&
          remainingList[i].className.indexOf('en') != -1
        ) {
          $(remainingList[i]).hide()
        }
      }
    }

    return false
  })
  //退出ボタン
  function exitRecord() {
    if ($partner != undefined) {
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          text: 'stop',
          channel: 'record'
        }),
        false,
        'device'
      )
    }
    recordingLog('stop')
    button.recordRTC.stopRecording(function (url) {
      changeStatusRecord()
      saveToDiskOrOpenNewTab(button.recordRTC)
      stopStream()
    })
  }
  $('#btn_exit').on('click', function () {
    if (streamInterval) clearInterval(streamInterval)
    isExit = true
    isStart = false
    // if (recording) {
    //   exitRecord()
    // }
    if ($partner) {
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          name: nickName,
          channel: 'exitRoom'
        }),
        false,
        'device'
      )
    } else {
      checkExit = true
      sendExitLog()
      logoutLog()
    }
    exit()
    document.getElementById('localVideo').srcObject = undefined
    document.getElementById('remoteVideo').srcObject = undefined
    exitView()
    if ($('#toggle-screenshare').prop('checked')) {
      stopShareScreenAndSound()
    }
  })
  //初回モーダル
  $('.first-modal-close').on('click', function () {
    changeDeviceList()
    clientload()
    $('.first-modal').fadeOut(FADE_SPEED)
    return false
  })
  //自動再生モーダル
  $('.autoplay-modal-close').on('click', function () {
    $('.autoplay-modal').fadeOut(FADE_SPEED)
    return false
  })
  //終了モーダル
  $('#after-close').on('click', function () {
    exit()
  })
  $('.lessonend-modal-close').on('click', function () {
    $('.lessonend-modal').fadeOut(FADE_SPEED)
    return false
  })
  $('#restart').on('click', function () {
    restart()
  })
  $('#rejoinEN').on('click', function () {
    restart()
  })
  $('#rejoinJP').on('click', function () {
    restart()
  })
  $('#cancel_rejoinEN').on('click', function () {
    $('#notifiReload').fadeOut(200)
  })
  $('#cancel_rejoinJP').on('click', function () {
    $('#notifiReload').fadeOut(200)
  })
  $('#cancel_bg').on('click', function () {
    $('#notifiReload').fadeOut(200)
  })

  $('.gmenu li').click(function () {
    switch ($(this).attr('name')) {
      case 'various-mic': //サブマイク
        $('#btn_mic').click()
        return false
        break
      case 'various-camera': //サブカメラ
        $('#btn_camera').click()
        return false
        break
      case 'various-language': //サブ言語
        $('#btn_language').click()
        return false
        break
      case 'various-setting': //サブ設定
        $('#btn_setting').click()
        return false
        break
      case 'various-backgroundEdit': //サブ背景合成
        // $('#btn_subbackgroundEdit').click()

        return false
        break
      case 'various-close':
        $('.gmenu').hide()
        $('#toggle-varioussetting').prop('checked', false)
        return false
        break
      default:
        //その他
        break
    }
  })

  async function preExportData(data) {
    data = await data.replaceAll('<p><br>', '\n')
    data = await data.replaceAll('</p><p>', '\n')
    data = await data.replaceAll('<p>', '')
    data = await data.replaceAll('</p>', '')
    data = await data.replaceAll('<br>', '\n')
    data = await data.replaceAll('<strong>', '')
    data = await data.replaceAll('</strong>', '')
    data = await data.replaceAll('<em>', '')
    data = await data.replaceAll('</em>', '')
    data = await data.replaceAll('<i>', '')
    data = await data.replaceAll('</i>', '')
    data = await data.replaceAll('<u>', '')
    data = await data.replaceAll('</u>', '')
    return data
  }

  //export note content to csv file
  $('.download-note-file').click(async function () {
    // const filename = $("input[name='filenote']").val()
    // const filename = `Eigox_Note_${getCurrentDateTime()}`
    // let content = await document.querySelector('#editor > div.ql-editor')
    //   .innerHTML
    // content = await preExportData(content)
    // let link
    // if (document.getElementById('export-note-csv') == null) {
    //   link = document.createElement('a')
    // } else {
    //   link = document.getElementById('export-note-csv')
    // }
    // link.id = 'export-note-csv'
    // link.setAttribute(
    //   'href',
    //   'data:text/plain;charset=utf-8,\ufeff' + encodeURIComponent(content)
    // )
    // link.setAttribute('download', `${filename ? filename : 'note'}.txt`)
    // document.body.appendChild(link)
    // document.querySelector('#export-note-csv').click()
    // debugLog('Export note to csv file', 'Done', 'orange')
    // $("input[name='filenote']").val(null)
    // $('.download-note-modal').fadeOut(200)
  })

  $('.export-note-content').click(async function () {
    // $('.download-note-modal').fadeIn(200)

    var loadingNote = document.getElementById('loadingDownloadNote')

    this.style.pointerEvents = 'none'
    this.style.display = 'none'
    loadingNote.style.display = 'block'
    // const filename = `Eigox_Note_${getCurrentDateTime()}`

    const filename = `Eigox_Note_${moment(new Date())
      .tz('Asia/Tokyo')
      .format('YYYYMMDDHHmmss')}`

    let content = await document.querySelector('#editor > div.ql-editor')
      .innerHTML
    content = await preExportData(content)
    if (isIOS() || isIpad()) {
      if (isIpad()) {
        if (isChromeIOS()) {
          // setTimeout(() => {
          //   let downloadWindow = window.open('about:blank', '_blank')
          //   setTimeout(function () {
          //     const downloadUrl = `${URL_LESSON_ROOM}/download_note?content=${encodeURIComponent(
          //       content
          //     )}`
          //     downloadWindow.location.href = downloadUrl
          //     downloadWindow.location.replace(downloadUrl)
          //   }, 1000)
          // }, 100)
          let link
          link = document.createElement('a')
          const downloadUrl = `${URL_LESSON_ROOM}/download_note?content=${encodeURIComponent(
            content
          )}&is_zip=true`
          link.setAttribute('download', `${filename ? filename : 'note'}.txt`)
          link.href = downloadUrl
          link.click()
        } else {
          setTimeout(() => {
            const downloadUrl = `${URL_LESSON_ROOM}/download_note?content=${encodeURIComponent(
              content
            )}&is_zip=true`
            window.open(downloadUrl)
          }, 100)
        }
      } else {
        //iphone
        if (isChromeIOS()) {
          //chrome iphone
          let link
          if (document.getElementById('export-note-csv') == null) {
            link = document.createElement('a')
          } else {
            link = document.getElementById('export-note-csv')
          }
          link.id = 'export-note-csv'
          console.log(encodeURIComponent(content))
          link.setAttribute(
            'href',
            'data:text/plain;charset=utf-8,\ufeff' + encodeURIComponent(content)
          )

          link.setAttribute('download', `${filename ? filename : 'note'}.txt`)
          document.body.appendChild(link)
          document.querySelector('#export-note-csv').click()
        } else {
          //safari iphone

          setTimeout(() => {
            const downloadUrl = `${URL_LESSON_ROOM}/download_note?content=${encodeURIComponent(
              content
            )}&is_zip=true`
            window.open(downloadUrl)
          }, 100)
        }
      }
    } else {
      let link
      if (document.getElementById('export-note-csv') == null) {
        link = document.createElement('a')
      } else {
        link = document.getElementById('export-note-csv')
      }
      link.id = 'export-note-csv'
      console.log(encodeURIComponent(content))
      link.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,\ufeff' + encodeURIComponent(content)
      )

      link.setAttribute('download', `${filename ? filename : 'note'}.txt`)
      document.body.appendChild(link)
      document.querySelector('#export-note-csv').click()
    }

    setTimeout(() => {
      this.style.pointerEvents = 'initial'
      this.style.display = 'initial'
      loadingNote.style.display = 'none'
    }, 2000)
  })

  $('.button-close-notefile').click(function () {
    $("input[name='filenote']").val(null)
    $('.download-note-modal').fadeOut(FADE_SPEED)
  })

  // export chat content to csv file
  function downloadAttachFile(fileName) {
    const url = `${URL_LESSON_ROOM}/chatdownload/${roomName}/${fileName}`
    if (isIpad() || isIOS()) {
      // window.open(url, '_blank')
      // window.open(url)
      if (isChromeIOS()) {
        let link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `${fileName}`)
        link.click()
      } else {
        setTimeout(() => {
          window.open(url)
        }, 100)
      }
    } else {
      if (isMobile()) {
        let link = document.createElement('a')
        link.id = 'download-chat'
        link.setAttribute('href', url)
        link.setAttribute('download', `${fileName}`)
        link.click()
      } else {
        if (isSafari()) {
          const checkNewWindow = window.open(url)
          setInterval(() => {
            checkNewWindow.close()
            if (checkNewWindow.closed) {
              setTimeout(() => {
                clearInterval(checkNewWindow)
              }, 5000)
            }
          }, 3000)
        } else {
          //PC
          window.open(url)
        }
      }
    }
  }

  $('.download-file').click(function () {
    // const fileName = $("input[name='filename']").val()

    const fileName = `Eigox_Chat_${getCurrentDateTime()}`

    downloadAttachFile(fileName)
    $("input[name='filename']").val(null)
    $('.download-modal').fadeOut(FADE_SPEED)

    // var data = JSON.stringify({
    //   room_id: roomName
    // })
    // var csvData = `Name, Time, Chat, File`;

    // that = this
    // return fetch(`${URL_LESSON_ROOM}/chatrecovery`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: data
    // })
    //   .then(function (response1) {
    //     return response1.json()
    //   })
    //   .then(function (data1) {
    //     var json = JSON.stringify(data1)
    //     var parsed = JSON.parse(json)
    //     if (parsed.result == 0) {
    //       parsed.chat_histories.forEach(function (histories) {
    //         var username = histories.username
    //         var messageData = histories.message
    //         let fileName = histories.file_name
    //         dateTime = new Date(histories.created_at)
    //         var year = dateTime.getFullYear()
    //         var month = addDigit(dateTime.getMonth() + 1)
    //         var day = addDigit(dateTime.getDate())
    //         var hour = addDigit(dateTime.getHours())
    //         var min = addDigit(dateTime.getMinutes())
    //         dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + min

    //         if (messageData || fileName) {
    //           csvData += '\n';
    //           csvData += `[${username}],${dateTime},${messageData ? messageData.trim().replace(/\n/g, ' ') : ''},${fileName ? fileName : ''}`;
    //         }
    //       })

    //       let link
    //       if (document.getElementById('export-chat-csv') == null) {
    //         link = document.createElement('a')
    //       } else {
    //         link = document.getElementById('export-chat-csv')
    //       }
    //       link.id = 'export-chat-csv'
    //       link.setAttribute(
    //         'href',
    //         'data:text/plain;charset=utf-8,\ufeff' + encodeURIComponent(csvData)
    //       )
    //       link.setAttribute('download', `${file ? file : 'chat'}.csv`)
    //       document.body.appendChild(link)
    //       document.querySelector('#export-chat-csv').click()
    //       $('.download-modal').fadeOut(FADE_SPEED);
    //       debugLog('Export chat to csv file', 'Done', 'orange')
    //     } else {
    //       debugLog(
    //         'chatRecovery',
    //         'error! ' + parsed.error_message['room_id'],
    //         'red'
    //       )
    //       $('.download-modal').fadeOut(FADE_SPEED);
    //     }
    //   })
    //   .catch(function (e) {
    //     $('.download-modal').fadeOut(FADE_SPEED);
    //   })
  })

  $('.button-close-download').click(function () {
    $("input[name='filename']").val(null)
    $('.download-modal').fadeOut(FADE_SPEED)
  })
  $('#export-chat-content').click(function () {
    // $('.download-modal').fadeIn(200)
    var icon = document.getElementById('export-icon')
    var loadingDownload = document.getElementById('loadingDownloadAllChat')
    loadingDownload.style.display = 'initial'
    icon.style.display = 'none'

    // const fileName = `Eigox_Chat_${getCurrentDateTime()}`
    const fileName = `Eigox_Chat_${moment(new Date())
      .tz('Asia/Tokyo')
      .format('YYYYMMDDHHmmss')}`

    downloadAttachFile(fileName)
    setTimeout(() => {
      icon.style.display = 'block'
      loadingDownload.style.display = 'none'
    }, 4000)
  })

  if (isAdvancedUpload()) {
    $('#chat-contents')
      .on('drag dragstart dragend dragover dragenter dragleave drop', (e) => {
        e.preventDefault()
        e.stopPropagation()
      })
      .on('dragover', () => {
        $('#chat-contents').addClass('chat-box')
        $('#chat-area').addClass('disable-pointer')
        $('#chat-message').addClass('disable-pointer')
      })
      .on('dragleave dragend drop', () => {
        $('#chat-contents').removeClass('chat-box')
      })
      .on('drop dragend', (e) => {
        $('#chat-area').removeClass('disable-pointer')
        $('#chat-message').removeClass('disable-pointer')
      })
      .on('mouseenter', (e) => {
        $('#chat-area').removeClass('disable-pointer')
        $('#chat-message').removeClass('disable-pointer')
      })
  }
  // ドラッグが重なる・ドラッグが侵入する
  // $('#chat-contents').on('dragover dragenter ', function (e) {
  //   // $('#chat-contents').addClass('is-dragover')
  //   $('#chat-contents').addClass('chat-box')
  //   e.preventDefault()
  //   e.stopPropagation()
  // })

  // ドロップリストの動作
  $('#chat-contents').on('drop', function (e) {
    if (e.originalEvent.dataTransfer) {
      if (e.originalEvent.dataTransfer.files.length) {
        // $('#chat-contents').removeClass('chat-box')
        e.preventDefault()
        e.stopPropagation()
        const files = e.originalEvent.dataTransfer.files
        var info = {
          room_id: roomName,
          username: nickName
        }
        uploadFiles(info, files)
      }
    }
  })

  // ドラッグが離れる
  // $('#chat-contents').on('dragleave', function (e) {
  //   $('#chat-contents').removeClass('chat-box')
  //   e.preventDefault()
  //   e.stopPropagation()
  // })

  $('#btn_backgroundEdit').click(function () {
    //if (!isIOS()) {
    viewEditModel()
    //}
    return false
  })
  $('#btn_subbackgroundEdit').click(function () {
    // if (!isIOS()) {
    viewEditModel()
    // }
    return false
  })
})

const uploadFiles = (info, files) => {
  showLoadingChat('bottom')

  const sendFiles = [...files]
  if (sendFiles.length > 5) {
    if (languageType % 2 === 0) {
      alert('Too many files. Import no more than 5 files at the same time.')
    } else {
      alert(
        'ファイルが多すぎます。同時にファイルが５つ以下インポートしてください。'
      )
    }
    removeLoadingChat()
  } else {
    for (let i = 0; i < sendFiles.length; i++) {
      const maxSize = 10485760
      if (sendFiles[i].size > maxSize) {
        if (languageType % 2 === 0) {
          alert('Your file is too large. Maximum size is 10MB')
        } else {
          alert('ファイルサイズが大きすぎます。10MB以下にしてください。')
        }
        removeLoadingChat()
        continue
      }
      const formData = new FormData()
      const newData = { ...info, message: '', file: sendFiles[i] }
      for (const name in newData) {
        formData.append(name, newData[name])
      }

      fetch(`${URL_LESSON_ROOM}/chatregister`, {
        method: 'POST',
        body: formData
      })
        .then(function (response1) {
          return response1.json()
        })
        .then(function (data1) {
          var isPdfOrImageExt = /(\.pdf|\.jpeg|\.jpg|\.png)$/i
          if (!isPdfOrImageExt.exec(sendFiles[i].name)) {
            createFileBubble(
              Converter.getMyUserName(),
              sendFiles[i].name,
              undefined,
              data1.id,
              false,
              data1.file_link
            )
            if ($partner != undefined)
              vsWebRTCClient.sendMessage(
                $room,
                $partner,
                JSON.stringify({
                  text: sendFiles[i].name,
                  chatId: data1.id,
                  fileLink: data1.file_link,
                  channel: 'chat_file'
                }),
                false,
                'device'
              )
          } else {
            setTimeout(() => {
              showFileOnChatContent(
                data1.id,
                sendFiles[i].name,
                null,
                true,
                data1.username,
                data1.file_link
              )
              vsWebRTCClient.sendMessage(
                $room,
                $partner,
                JSON.stringify({
                  filename: sendFiles[i].name,
                  chatId: data1.id,
                  fileLink: data1.file_link,
                  channel: 'chat_pdf_img'
                }),
                false,
                'device'
              )
              vsWebRTCClient.sendMessage(
                $room,
                $partner,
                JSON.stringify({
                  channel: 'scrollToBottomChat'
                }),
                false,
                'device'
              )
              // upload(sendFiles[i], data1)
            }, i * 1000)
          }
          var json = JSON.stringify(data1)
          var parsed = JSON.parse(json)
          setTimeout(() => {
            scrollControl(document.getElementById('chat-area'), 'end')
          }, 1000)
          removeLoadingChat()
          if (parsed.result == 0) {
            //正常な処理
            debugLog('chatRegister', 'Done', 'orange')
          } else {
            errorLog(parsed.error_code, parsed.error_message['room_id'])
          }
        })
        .catch(function (e) {
          removeLoadingChat()

          debugLog('chatRegister', 'error!', 'red')
        })
    }
  }
}

$('#upload-file').change((event) => {
  const { files } = event.target
  var info = {
    room_id: roomName,
    username: nickName
  }
  uploadFiles(info, files)
  $('#upload-file').val('')
})

// showFileOnChatContent(
//   msgObj.chatId,
//   msgObj.filename,
//   null,
//   false,
//   partner.getName(),
//   msgObj.fileLink
// )

// チャットの上でファイルを表示する
async function showFileOnChatContent(
  idEl,
  name,
  data,
  isMe,
  username,
  fileLink
) {
  if (fileLink) {
    var isPdfFileExt = /(\.pdf)$/i // ファイル名からPDFか判定する。
    var uploadId = 'upload_el_' + idEl
    // var hour = addDigit(new Date().getHours())
    // var min = addDigit(new Date().getMinutes())
    // var timetext = hour + ':' + min
    timetext = `${moment(new Date(), 'YYYY-MM-DD HH:mm:ss')
      .tz('Asia/Tokyo')
      .format('HH:mm')}`
    if (isPdfFileExt.exec(name)) {
      var template = document.getElementById('chat_template')
      var clone = template.content.cloneNode(true)
      if (idEl)
        clone
          .getElementById('chat-parent')
          .setAttribute('data-value', `chat_text_${idEl}`)

      if (username != undefined) {
        var btnDownload = document.createElement('div')
        var loadingDownload = document.createElement('img')
        loadingDownload.setAttribute('src', './svg/spinerLoadingChat.svg')
        loadingDownload.classList.add('loadingChat')
        loadingDownload.style.display = 'none'

        btnDownload.classList.add('download-file-button')
        btnDownload.onclick = function downloadFile() {
          btnDownload.style.display = 'none'
          loadingDownload.style.display = 'initial'
          const url = `${URL_LESSON_ROOM}/download_message/${idEl}`
          const urlZIP = `${URL_LESSON_ROOM}/download_message/${idEl}?is_zip=true`
          if (recording) isDownloadFileChat = true
          //downloadDataFromUrl(url, name)
          if (isMobile()) {
            if (isIpad() || isIOS()) {
              fetchDataFromUrl(urlZIP, data, name)
            } else {
              fetchDataFromUrl(url, data, name, urlZIP)
            }
          } else {
            fetchDataFromUrl(url, data, name)
          }

          setTimeout(() => {
            btnDownload.style.display = 'initial'
            loadingDownload.style.display = 'none'
          }, 2000)
          return false
        }

        if (!isDeleted)
          clone.getElementById('chat-bubble').appendChild(loadingDownload)
        if (!isDeleted)
          clone.getElementById('chat-bubble').appendChild(btnDownload)
        if (username == Converter.getMyUserName()) {
          clone.getElementById('chat-right').innerText = username
          clone.getElementById('chat-right').classList.add('chat-name')
          clone.getElementById('chat-left').innerText = timetext
          clone.getElementById('chat-bubble').classList.add('bubble-mine')
          clone.getElementById('chat-header').classList.add('bubble-other')
          var btnDeleteFile = document.createElement('div')
          btnDeleteFile.classList.add('chat-delete-right')
          btnDeleteFile.onclick = () =>
            handleDeleteChat(eleId, btnDeleteFile, btnDownload)
          if (!isDeleted)
            clone.getElementById('chat-bubble').appendChild(btnDeleteFile)
        } else {
          clone.getElementById('chat-left').innerText = timetext
          clone.getElementById('chat-right').innerText = username
          clone.getElementById('chat-right').classList.add('chat-name')
          clone.getElementById('chat-bubble').classList.add('bubble-other')
          clone.getElementById('chat-header').classList.add('bubble-mine')
        }
        clone.getElementById('chat-text').classList.add('file-text-chat')
        clone.getElementById('chat-text').classList.add('file-text-chat_pdf')

        clone.getElementById('chat-text').setAttribute('id', uploadId)
        clone.getElementById(uploadId).onclick = function () {
          if ($('#toggle-screenshare').prop('checked')) {
            stopShareScreenAndSound()
          }
          tempUrlImage = fileLink
          ObjectFileChat = event.target
          dataUpload = tempUrlImage
          displayFileChat = true
          fileNameTextbook = name.slice(0, name.length - 4)
          isPDF = true
          if (confirmModal()) {
            isChatShare = true
            showFilePDFChat(tempUrlImage)
          }
          assignTextBook()
        }

        clone.getElementById(
          uploadId
        ).innerHTML = `<span class="file-icon"><i class="fa fa-file" aria-hidden="true"></i></span> ${name}`
        document.getElementById('chat-area').appendChild(clone)
        setTimeout(() => {
          scrollControl(document.getElementById('chat-area'), 'end')
        }, 1000)
        // scrollControl(document.getElementById('chat-area'), 'end')
      }
    } else {
      var template = document.getElementById('chat_template')
      var clone = template.content.cloneNode(true)
      if (idEl)
        clone
          .getElementById('chat-parent')
          .setAttribute('data-value', `chat_text_${idEl}`)
      var btnDownload = document.createElement('div')
      var loadingDownload = document.createElement('img')
      loadingDownload.setAttribute('src', './svg/spinerLoadingChat.svg')
      loadingDownload.classList.add('loadingChat')
      loadingDownload.style.display = 'none'
      btnDownload.classList.add('download-file-button')
      btnDownload.onclick = function downloadFile() {
        btnDownload.style.display = 'none'
        loadingDownload.style.display = 'initial'
        const url = `${URL_LESSON_ROOM}/download_message/${idEl}`
        const urlZIP = `${URL_LESSON_ROOM}/download_message/${idEl}?is_zip=true`
        if (recording) isDownloadFileChat = true
        //downloadDataFromUrl(url, name)
        // fetchDataFromUrl(url, fileLink, name)
        if (isMobile()) {
          if (isIpad() || isIOS()) {
            fetchDataFromUrl(urlZIP, fileLink, name)
          } else {
            fetchDataFromUrl(url, fileLink, name, urlZIP)
          }
        } else {
          fetchDataFromUrl(url, fileLink, name)
        }
        setTimeout(() => {
          btnDownload.style.display = 'initial'
          loadingDownload.style.display = 'none'
        }, 2000)
        return false
      }
      var isDeleted = false
      if (!isDeleted)
        clone.getElementById('chat-bubble').appendChild(loadingDownload)
      if (!isDeleted)
        clone.getElementById('chat-bubble').appendChild(btnDownload)
      if (isMe) {
        clone.getElementById('chat-right').innerText = username
        clone.getElementById('chat-right').classList.add('chat-name')
        clone.getElementById('chat-left').innerText = timetext
        clone.getElementById('chat-bubble').classList.add('bubble-mine')
        clone.getElementById('chat-header').classList.add('bubble-other')
        var btnDeleteFile = document.createElement('div')
        btnDeleteFile.classList.add('chat-delete-right')
        btnDeleteFile.onclick = () =>
          handleDeleteChat(idEl, btnDeleteFile, btnDownload, name)
        if (!isDeleted)
          clone.getElementById('chat-bubble').appendChild(btnDeleteFile)
      } else {
        clone.getElementById('chat-right').innerText = username
        clone.getElementById('chat-left').innerText = timetext
        clone.getElementById('chat-right').classList.add('chat-name')
        clone.getElementById('chat-bubble').classList.add('bubble-other')
        clone.getElementById('chat-header').classList.add('bubble-mine')
      }

      var imgChat = document.createElement('img')
      imgChat.style.width = '100%'
      imgChat.setAttribute('id', uploadId)
      imgChat.onclick = function () {
        if ($('#toggle-screenshare').prop('checked')) {
          stopShareScreenAndSound()
        }
        // showBackTextbook(false)
        tempUrlImage = fileLink
        ObjectFileChat = event.target
        dataUpload = tempUrlImage
        displayFileChat = true
        fileNameTextbook = name.slice(0, name.length - 4)
        isPDF = false
        if (confirmModal()) {
          isChatShare = true
          showFileChat(tempUrlImage)
        }
        sendImageChat()
      }
      clone.getElementById('chat-text').appendChild(imgChat).src = fileLink
      const tempWrapper = document.createElement('div')
      clone.getElementById('chat-text').classList.add('file-text-chat')
      document.getElementById('chat-area').appendChild(clone)
      // scrollControl(document.getElementById('chat-area'), 'end')
    }
  }
}

async function showFileOnChatLoad(
  idEl,
  name,
  data,
  isMe,
  beforeElement,
  timeText,
  username,
  IsloadMore = false
) {
  let url_file = data
  var uploadId = 'upload_el_' + idEl
  var isPdfFileExt = /(\.pdf)$/i // ファイル名からPDFか判定する。
  // var hour = addDigit(new Date(timeText).getHours())
  // var min = addDigit(new Date(timeText).getMinutes())
  // var timeTextCreated = hour + ':' + min
  timeTextCreated = `${moment(new Date(timeText), 'YYYY-MM-DD HH:mm:ss')
    .tz('Asia/Tokyo')
    .format('HH:mm')}`

  if (isPdfFileExt.exec(name)) {
    var template = document.getElementById('chat_template')
    var clone = template.content.cloneNode(true)
    if (idEl)
      clone
        .getElementById('chat-parent')
        .setAttribute('data-value', `chat_text_${idEl}`)

    if (username != undefined) {
      var btnDownload = document.createElement('div')
      var loadingDownload = document.createElement('img')
      loadingDownload.setAttribute('src', './svg/spinerLoadingChat.svg')
      loadingDownload.classList.add('loadingChat')
      loadingDownload.style.display = 'none'

      btnDownload.classList.add('download-file-button')
      btnDownload.onclick = function downloadFile() {
        btnDownload.style.display = 'none'
        loadingDownload.style.display = 'initial'
        const url = `${URL_LESSON_ROOM}/download_message/${idEl}`

        const urlZIP = `${URL_LESSON_ROOM}/download_message/${idEl}?is_zip=true`
        if (recording) isDownloadFileChat = true
        //downloadDataFromUrl(url, name)
        if (isMobile()) {
          if (isIpad() || isIOS()) {
            fetchDataFromUrl(urlZIP, data, name)
          } else {
            fetchDataFromUrl(url, data, name, urlZIP)
          }
        } else {
          fetchDataFromUrl(url, data, name)
        }

        setTimeout(() => {
          btnDownload.style.display = 'initial'
          loadingDownload.style.display = 'none'
        }, 2000)
        return false
      }
      if (!isDeleted)
        clone.getElementById('chat-bubble').appendChild(loadingDownload)
      if (!isDeleted)
        clone.getElementById('chat-bubble').appendChild(btnDownload)
      if (username == Converter.getMyUserName()) {
        clone.getElementById('chat-right').innerText = username
        clone.getElementById('chat-right').classList.add('chat-name')
        clone.getElementById('chat-left').innerText = timeTextCreated
        clone.getElementById('chat-bubble').classList.add('bubble-mine')
        clone.getElementById('chat-header').classList.add('bubble-other')
        var btnDeleteFile = document.createElement('div')
        btnDeleteFile.classList.add('chat-delete-right')
        btnDeleteFile.onclick = () =>
          handleDeleteChat(eleId, btnDeleteFile, btnDownload)
        if (!isDeleted)
          clone.getElementById('chat-bubble').appendChild(btnDeleteFile)
      } else {
        clone.getElementById('chat-left').innerText = timeTextCreated
        clone.getElementById('chat-right').innerText = username
        clone.getElementById('chat-right').classList.add('chat-name')
        clone.getElementById('chat-bubble').classList.add('bubble-other')
        clone.getElementById('chat-header').classList.add('bubble-mine')
      }
      clone.getElementById('chat-text').classList.add('file-text-chat')
      clone.getElementById('chat-text').classList.add('file-text-chat_pdf')

      clone.getElementById('chat-text').setAttribute('id', uploadId)
      clone.getElementById(uploadId).onclick = function () {
        if ($('#toggle-screenshare').prop('checked')) {
          stopShareScreenAndSound()
        }
        tempUrlImage = url_file
        ObjectFileChat = event.target
        dataUpload = tempUrlImage
        displayFileChat = true
        fileNameTextbook = name.slice(0, name.length - 4)
        isPDF = true
        if (confirmModal()) {
          isChatShare = true
          showFilePDFChat(tempUrlImage)
        }
        assignTextBook()
      }

      clone.getElementById(
        uploadId
      ).innerHTML = `<span class="file-icon"><i class="fa fa-file" aria-hidden="true"></i></span> ${name}`
      document.getElementById('chat-area').appendChild(clone)
      if (!IsloadMore) {
        setTimeout(() => {
          scrollControl(document.getElementById('chat-area'), 'end')
        }, 1000)
      }
    }
  } else {
    var template = document.getElementById('chat_template')
    var clone = template.content.cloneNode(true)
    if (idEl) {
      clone
        .getElementById('chat-parent')
        .setAttribute('data-value', `chat_text_${idEl}`)
    }
    var wrapper = clone

    var btnDownload = document.createElement('div')
    var loadingDownload = document.createElement('img')
    loadingDownload.setAttribute('src', './svg/spinerLoadingChat.svg')
    loadingDownload.classList.add('loadingChat')
    loadingDownload.style.display = 'none'
    btnDownload.classList.add('download-file-button')
    btnDownload.onclick = function downloadFile() {
      btnDownload.style.display = 'none'
      loadingDownload.style.display = 'initial'
      const url = `${URL_LESSON_ROOM}/download_message/${idEl}`
      const urlZIP = `${URL_LESSON_ROOM}/download_message/${idEl}?is_zip=true`
      if (recording) isDownloadFileChat = true
      //downloadDataFromUrl(url, name)
      if (isMobile()) {
        if (isIpad() || isIOS()) {
          fetchDataFromUrl(urlZIP, data, name)
        } else {
          fetchDataFromUrl(url, data, name, urlZIP)
        }
      } else {
        fetchDataFromUrl(url, data, name)
      }
      setTimeout(() => {
        btnDownload.style.display = 'initial'
        loadingDownload.style.display = 'none'
      }, 2000)
      return false
    }
    var isDeleted = false
    if (!isDeleted)
      clone.getElementById('chat-bubble').appendChild(loadingDownload)
    if (!isDeleted) clone.getElementById('chat-bubble').appendChild(btnDownload)
    if (isMe) {
      clone.getElementById('chat-right').innerText = username
      clone.getElementById('chat-right').classList.add('chat-name')
      clone.getElementById('chat-left').innerText = timeTextCreated
      clone.getElementById('chat-bubble').classList.add('bubble-mine')
      clone.getElementById('chat-header').classList.add('bubble-other')
      var btnDeleteFile = document.createElement('div')
      btnDeleteFile.classList.add('chat-delete-right')
      btnDeleteFile.onclick = () =>
        handleDeleteChat(idEl, btnDeleteFile, btnDownload, name)
      if (!isDeleted)
        clone.getElementById('chat-bubble').appendChild(btnDeleteFile)
    } else {
      clone.getElementById('chat-right').innerText = username
      clone.getElementById('chat-left').innerText = timeTextCreated
      clone.getElementById('chat-right').classList.add('chat-name')
      clone.getElementById('chat-bubble').classList.add('bubble-other')
      clone.getElementById('chat-header').classList.add('bubble-mine')
    }

    var imgChat = document.createElement('img')
    imgChat.style.width = '100%'
    imgChat.setAttribute('id', uploadId)
    imgChat.onclick = function () {
      if ($('#toggle-screenshare').prop('checked')) {
        stopShareScreenAndSound()
      }
      // showBackTextbook(false)
      tempUrlImage = url_file
      ObjectFileChat = event.target
      dataUpload = tempUrlImage
      displayFileChat = true
      fileNameTextbook = name.slice(0, name.length - 4)
      isPDF = false
      if (confirmModal()) {
        isChatShare = true
        showFileChat(tempUrlImage)
      }
      sendImageChat()
    }
    clone.getElementById('chat-text').appendChild(imgChat).src = data
    clone.getElementById('chat-text').classList.add('file-text-chat')
    beforeElement.parentNode?.insertBefore(wrapper, beforeElement.nextSibling)
  }
}

//show file Pdf
function showFilePDFChat(dataUpload) {
  tempUrlTextBook = dataUpload
  // changeTextShareMode()
  resetCanvas()
  resetBackCanvas()
  // notifyUseAsBgWhiteboard(0, dataUpload)
  if (member.length > 1) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        canvasURL: dataUpload,
        fileName: fileNameTextbook,
        isChatShare,
        channel: 'recvPDFURL'
      }),
      false,
      'device'
    )
  }
  drawPDFOnCanvas(dataUpload)
  nextmode = 5
  // modeChange(5)
  acceptChangeView(true)
}
// show direct
function showFileChat(dataUpload) {
  loading('#draw_parent', true)
  isChatShare = true
  // changeTextShareMode()
  resetCanvas()
  resetBackCanvas()
  notifyUseAsBgWhiteboard(0, dataUpload, fileNameTextbook)
  drawImageOnCanvas(true)
  nextmode = 5
  // modeChange(5)
  acceptChangeView(true)
}

// show from click modal
function alterShowFileChat(dataUpload) {
  loading('#draw_parent', true)
  isChatShare = true

  tempUrlTextBook = dataUpload
  // changeTextShareMode()
  resetCanvas()
  resetBackCanvas()
  nextmode = 5
  // modeChange(5)
  acceptChangeView(true)
  if (isPDF && member.length > 1) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        canvasURL: dataUpload,
        fileName: fileNameTextbook,
        isChatShare,
        channel: 'recvPDFURL'
      }),
      false,
      'device'
    )
  } else {
    notifyUseAsBgWhiteboard(0, dataUpload, fileNameTextbook)
  }
  //alterDrawImageOnCanvas(true, ObjectFileChat)
  if (isPDF) {
    drawPDFOnCanvas(dataUpload)
  } else {
    alterDrawImageOnCanvas(true, ObjectFileChat)
  }
}

function alterDrawImageOnCanvas(isSend, obj) {
  viewTextURL = obj.src || event.currentTarget.getAttribute('data-img')
  const pdfURL = obj.id || event.currentTarget.id
  $('#draw_component').show()
  if (isMobile()) {
    $('#draw_component').css({ 'z-index': 1, position: 'absolute' })
    $('#stream-contents').css({ height: '100%' })
    $('#side-contents').css({ 'z-index': 0 })
    // $('#video-contents').css({ height: '40%' })
  }
  //$("#video-contents").hide();
  $('#share-contents').hide()
  $('#materialSelect-contents').hide()
  // var canvasElement = document.getElementById('remoteDrawCanvas')
  // var canvasContext = document.getElementById('backgroundCanvas').getContext('2d')

  hideButtonPrevNext()
  var dummyImg = new Image()
  dummyImg.onload = myImageOnload
  // dummyImg.addEventListener(
  //   'load',
  //   function () {
  //     canvas_ratio = dummyImg.height / dummyImg.width
  //     //setAllCanvasRatio()
  //     setAllCanvasSize(dummyImg.width, dummyImg.height)
  //     $('#draw').height($('#draw').width() * canvas_ratio)
  //     old_width = canvasElement.width
  //     old_height = canvasElement.height
  //     //キャンバスの描写倍率を変更
  //     board.setRatio(
  //       old_width / canvasElement.clientWidth,
  //       old_height / canvasElement.clientHeight
  //     )
  //     var scale = canvasElement.width / dummyImg.naturalWidth
  //     board.setMinScale(scale)
  //     // if (dummyImg.naturalHeight * scale > canvasElement.height) {
  //     //   scale = canvasElement.height / dummyImg.naturalHeight
  //     // }
  //     canvasContext.fillStyle = 'rgb(127, 127, 127)'
  //     canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height)
  //     canvasContext.drawImage(
  //       dummyImg,
  //       0,
  //       0,
  //       dummyImg.naturalWidth,
  //       dummyImg.naturalHeight
  //     )
  //   },
  //   false
  // )

  //dummyImg.src = viewTextURL
  fetch(viewTextURL, {
    cache: 'reload' // reload cache to prevent tainted canvas
  })
    .then((response) => response.blob())
    .then((file) => {
      dummyImg.src = window.URL.createObjectURL(file)
    })
}

function myImageOnload() {
  var canvasRemoteDraw = document.getElementById('remoteDrawCanvas')
  var canvasContext = document
    .getElementById('backgroundCanvas')
    .getContext('2d')
  canvas_ratio = this.height / this.width
  //setAllCanvasRatio()
  setAllCanvasSize(this.width, this.height)
  $('#draw').width('100%')
  $('#draw').height($('#draw').width() * canvas_ratio)
  old_width = canvasRemoteDraw.width
  old_height = canvasRemoteDraw.height
  //キャンバスの描写倍率を変更
  board.setRatio(
    old_width / canvasRemoteDraw.clientWidth,
    old_height / canvasRemoteDraw.clientHeight
  )
  var scale = canvasRemoteDraw.width / this.naturalWidth
  board.setMinScale(scale)
  board.setDefaultDrawWidth($('#draw').width())
  // if (dummyImg.naturalHeight * scale > canvasRemoteDraw.height) {
  //   scale = canvasRemoteDraw.height / dummyImg.naturalHeight
  // }
  // canvasContext.fillStyle = 'rgb(127, 127, 127)'
  // canvasContext.fillRect(0, 0, canvasRemoteDraw.width, canvasRemoteDraw.height)
  canvasContext.drawImage(this, 0, 0, this.naturalWidth, this.naturalHeight)
  isloadingCavasBackground = false
  destroyLoading()
}

function remoteDrawCanvasImageOnload() {
  var canvas = document.getElementById('remoteDrawCanvas')
  var ctx = canvas.getContext('2d')
  ctx.drawImage(this, 0, 0, canvas.width, canvas.height)
  isloadingCavasRemote = false
}

function localDrawCanvasImageOnload() {
  var canvas = document.getElementById('localDrawCanvas')
  var ctx = canvas.getContext('2d')
  ctx.drawImage(this, 0, 0, canvas.width, canvas.height)
  isloadingCavasLocal = false
}

function confirmModal() {
  if (
    $('#toggle-textbook').prop('checked') &&
    ($('#backTextbook').is(':visible') ||
      (mode === 5 && $('#backTextbook').is(':hidden')))
  ) {
    $('.teachingMaterials-modal').fadeIn(FADE_SPEED)
    return false
  } else if ($('#toggle-screenshare').prop('checked')) {
    // $('.screenshare-modal').fadeIn(FADE_SPEED)
    acceptExitShareScreen()
    setTimeout(() => {
      createNewVideo()
    }, 100)
    return false
  } else if ($('#toggle-board').prop('checked')) {
    $('.whiteboard-modal').fadeIn(FADE_SPEED)
    return false
  }
  return true
}

$('#toggle-textbook').click(function () {
  if (document.getElementById('loader').style.visibility == 'visible') {
    if (mode == 3) $('#toggle-textbook').prop('checked', true)
    else $('#toggle-textbook').prop('checked', false)
    return
  }
  displayFileChat = false
})
$('#toggle-board').click(function () {
  if (document.getElementById('loader').style.visibility == 'visible') {
    if (mode == 1) $('#toggle-board').prop('checked', true)
    else $('#toggle-board').prop('checked', false)
    return
  }

  displayFileChat = false
})
$('#toggle-varioussetting').click(function () {
  if (document.getElementById('loader').style.visibility == 'visible')
    $('#toggle-varioussetting').prop('checked', false)
})

$('#toggle-screenshare').click(function () {
  if (document.getElementById('loader').style.visibility == 'visible') {
    $('#toggle-screenshare').prop('checked', false)
    return
  }
  displayFileChat = false
})

$('#toggle-record').click(function () {
  if (document.getElementById('loader').style.visibility == 'visible')
    $('#toggle-record').prop('checked', false)
})
function showToWhiteboard(isPdf, elId) {
  hideButtonPrevNext()
  showBackTextbook(false)
  canvasLoaded = false

  var imgsrc
  var dummyImg = new Image()
  dummyImg.onload = myImageOnload
  if (document.getElementById(elId)) {
    imgsrc = document.getElementById(elId).src
  } else {
    imgsrc = tempUrlImage
  }
  // destroyLoading()

  //dummyImg.src = imgsrc
  fetch(imgsrc, {
    cache: 'reload' // reload cache to prevent tainted canvas
  })
    .then((response) => response.blob())
    .then((file) => {
      dummyImg.src = window.URL.createObjectURL(file)

      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          channel: 'send-file-done'
        }),
        false,
        'device'
      )
      destroyLoading()
    })
  // canvasLoaded = true

  /*
  if (isPdf == 0) {
    htmlContent = '<img style="width:100%; height:fit-content" src="' + document.getElementById(elId).src + '"/>';
  } else {
    var pdfData = document.getElementById(elId).data;
    htmlContent = '<object data="' + pdfData + '#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf" style="width:100%;height:100%;position:absolute;top:0">' +
      'alt : <a href="' + pdfData + '#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf">"' + pdfData + '#toolbar=0&navpanes=0&scrollbar=0"</a>' +
      '</object>';
  }
  document.getElementById("backgroundFileContent").innerHTML = htmlContent;
  */
}

var isShare = true

//画面共有作成
function onMakeScreen(stream) {
  // stream.getTracks().forEach(function (track) {})
  if (stream.getTracks().length > 0) {
    modeChange(2)
    $('#share-contents').show()
    $('#video-contents').hide()
    $('#draw_component').hide()
    $('#materialSelect-contents').hide()
    videoContentsView(true)
    //画面共有を有効にする
    $('#toggle-screenshare').prop('checked', true)
    //ホワイトボードを無効にする
    if ($('#toggle-board').prop('checked')) {
      $('#toggle-board').prop('checked', false)
    }
    //教材ホワイトボードが有効の場合
    if ($('#toggle-textshare').prop('checked')) {
      $('#toggle-board').prop('checked', false)
      return
    }
    //教材選択が有効の場合
    if ($('#toggle-textbook').prop('checked')) {
      $('#toggle-textbook').prop('checked', false)
    }
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      //画面共有終了
      vsWebRTCClient.stopMediaCommunication(
        $room,
        $partner,
        'screen' + nickName
      )
      if ($('#toggle-fullshare').prop('checked')) {
        if (isIOS() && isSafari()) {
          $('#btn_fullshare').parent().show()
        }
        $('#toggle-fullshare').prop('checked', false)
        document.exitFullscreen()
      }
      if (
        !$('#toggle-screenshare').prop('checked') &&
        $('#toggle-fullscreenpartner').prop('checked')
      ) {
        if (isIOS() && isSafari()) {
          $('#toggle-fullscreenpartner').parent().show()
        }
        $('#toggle-fullscreenpartner').prop('checked', false)
        document.exitFullscreen()
      }
      $('#toggle-screenshare').prop('checked', false)
      modeChange(0)
      screenElement.srcObject = undefined
      //ホーム画面に戻す
      $('#draw_component').hide()
      $('#share-contents').hide()
      $('#materialSelect-contents').hide()
      $('#video-contents').show()
      videoContentsView(false)
      isScreenShare = false
    })
    var screenElement = document.getElementById('share_video')
    if ($partner != undefined) {
      vsWebRTCClient.startMediaCommunication(
        $room,
        $partner,
        'screen' + nickName
      )
    }
    // shareScreenStreamCopy = stream.clone()
    // if (shareScreenStreamCopy.getAudioTracks()[0]) {
    //   shareScreenStreamCopy.removeTrack(
    //     shareScreenStreamCopy.getAudioTracks()[0]
    //   )
    // }
    // vsWebRTCClient.showStream(screenElement, shareScreenStreamCopy)

    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        channel: 'onSoundVideoShare'
      }),
      false,
      'device'
    )

    vsWebRTCClient.showStream(screenElement, stream, true)
  } else {
    $('#toggle-screenshare').prop('checked', false)
  }
}

function onFailScreen(err) {}

//表示画面の変更
function modeChange(type) {
  mode = type
  if ($partner != undefined) {
    // 変更されたことを通知する。
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        modeType: mode,
        channel: 'mode'
      }),
      false,
      'device'
    )
  }
}

//キャンセルボタンの動作
function rejectChangeView() {
  console.log(isChatShare, mode, nextmode)
  if (nextmode == 0) {
    // 同一ボタンを連続選択
    switch (mode) {
      case 0:
        break
      case 1:
        $('#toggle-board').prop('checked', true)
        break
      case 2:
        $('#toggle-screenshare').prop('checked', true)
        break
      case 3:
        $('#toggle-textbook').prop('checked', true)
        break
      case 5:
        if (isChatShare) {
          $('#toggle-board').prop('checked', true)
        } else {
          $('#toggle-textbook').prop('checked', true)
        }
        break
    }
  } else {
    //異なるボタンを選択
    switch (nextmode) {
      case 0:
        $('#toggle-board').prop('checked', false)
        $('#toggle-screenshare').prop('checked', false)
        $('#toggle-textbook').prop('checked', false)
        break
      case 1:
        $('#toggle-board').prop('checked', false)
        break
      case 2:
        $('#toggle-screenshare').prop('checked', false)
        break
      case 3:
        $('#toggle-textbook').prop('checked', false)
        break
    }
  }
}

function acceptChangeView(isMe) {
  // reset mode
  setMode('swipe')
  $('#mode-pen').prop('checked', false)
  $('#mode-eraser').prop('checked', false)
  $('#chat-input').blur()
  showBackTextbook(false)
  $('#material-content').show()
  // resetTextbookList()
  $('#material-list').hide()
  resetTextbookHtml()
  /*
  if (isMe && mode == 1) { // 実行者を判定する
    if ($partner != undefined) {
      vsWebRTCClient.sendMessage($room, $partner, JSON.stringify({
        "channel": "canvasDelete"
      }), false, "device");
    }
  }*/
  //  resetCanvas();
  //  resetBackCanvas();
  switch (
    nextmode // 移動する画面遷移先
  ) {
    case 0: // 通話画面
      if (mode == 2) {
        // 画面共有が有効の場合
        vsWebRTCClient.stopStream(['screen'])
        shareScreenStreamCopy?.getTracks().forEach((track) => track.stop())
        vsWebRTCClient.stopMediaCommunication(
          $room,
          $partner,
          'screen' + nickName
        )
        isScreenShare = false
      }
      resetCanvas()
      resetBackCanvas()
      resetTextbookList()
      $('.whiteboard-modal').fadeOut(FADE_SPEED)
      // 自コンテンツの表示
      $('#video-contents').show()
      // コンテンツの非表示
      $('#draw_component').hide() // キャンバス
      $('#share-contents').hide() // 画面共有
      $('#materialSelect-contents').hide() // テキスト共有
      //ボタンの状態を初期化
      $('#toggle-screenshare').prop('checked', false)
      $('#toggle-board').prop('checked', false)
      $('#toggle-textbook').prop('checked', false)
      $('#toggle-textshare').prop('checked', false)
      $('#toggle-chat').prop('checked', true)
      //　映像中心のデザインにする
      videoContentsView(false)
      if (isMe) {
        modeChange(0)
      }
      break
    case 1: // キャンバス
      if (mode == 2) {
        // 画面共有が有効の場合
        vsWebRTCClient.stopStream(['screen'])
        shareScreenStreamCopy?.getTracks().forEach((track) => track.stop())
        vsWebRTCClient.stopMediaCommunication(
          $room,
          $partner,
          'screen' + nickName
        )
        isScreenShare = false
      }
      resetCanvas()
      resetBackCanvas()
      resetTextbookHtml()
      // 自コンテンツの表示
      $('#draw_component').show()
      $('#backTextbook').hide()
      $('#btn-pen').show()
      $('#btn-eraser').show()

      // whiteboard: show download button
      $('#download-whiteboard').show()
      $('#download-textbook').hide()

      if (isMobile()) {
        $('#draw_component').css({ 'z-index': 1, position: 'absolute' })
        $('#stream-contents').css({ height: '100%' })
        $('#side-contents').css({ 'z-index': 0 })
        // $('#video-contents').css({ height: '40%' })
      }

      // 他コンテンツの非表示
      $('#video-contents').hide()
      $('#share-contents').hide()
      $('#materialSelect-contents').hide()
      // 自ボタンの有効化
      $('#toggle-board').prop('checked', true)
      // 他ボタンの状態を初期化
      $('#toggle-screenshare').prop('checked', false)
      $('#toggle-textbook').prop('checked', false)
      $('#toggle-textshare').prop('checked', false)
      $('#toggle-chat').prop('checked', false)
      // サイドコンテンツのデザインにする
      videoContentsView(true)

      hideButtonPrevNext()

      fileNameTextbook = null
      var canvasElement = document.getElementById('draw')
      var canvasRemoteDraw = document.getElementById('remoteDrawCanvas')
      old_width = canvasRemoteDraw.width
      old_height = canvasRemoteDraw.height

      var scale = canvasRemoteDraw.width / total_width
      board.setMinScale(scale)
      //document.getElementById('draw_parent').scrollTo(0, 0)
      $('#draw').width('100%')
      $('#draw').height($('#draw').width() * canvas_ratio)
      board.setDefaultDrawWidth($('#draw').width())
      board.setRatio(
        old_width / canvasElement.clientWidth,
        old_height / canvasElement.clientHeight
      )

      // var canvasElement = document.getElementById('remoteDrawCanvas')
      // old_width = canvasElement.width
      // old_height = canvasElement.height
      // var canvasElement = document.getElementById('draw')
      // $('#draw').height($('#draw').width() * canvas_ratio)
      // board.setRatio(
      //   old_width / canvasElement.clientWidth,
      //   old_height / canvasElement.clientHeight
      // )
      if (isMe) {
        modeChange(1)
      }
      break
    case 2: // 画面共有
      if (isMe) {
        modeChange(0) // 選択完了までは一時的に通話画面に移動する
        $('#video-contents').show()
        $('#draw_component').hide()
        $('#share-contents').hide()
        $('#materialSelect-contents').hide()
        videoContentsView(false)
        vsWebRTCClient.makeStream(
          [StreamHandler.TRACK_KIND_SCREEN],
          onMakeScreen,
          onFailScreen,
          StreamHandler.TRACK_CREATE_NEW,
          true,
          'screen' + nickName
        )
        isScreenShare = true
      } else {
        mode = 2
        $('#share-contents').show()
        $('#materialSelect-contents').hide()
        $('#video-contents').hide()
        $('#draw_component').hide()
        videoContentsView(true)
      }
      resetCanvas()
      resetBackCanvas()
      //画面共有用設定
      $('#toggle-screenshare').prop('checked', true)
      // 他ボタンの状態を初期化
      $('#toggle-board').prop('checked', false)
      $('#toggle-textbook').prop('checked', false)
      $('#toggle-textshare').prop('checked', false)
      $('#toggle-chat').prop('checked', false)
      break
    case 3: // 教材選択
      if (mode == 2) {
        // 画面共有が有効の場合
        vsWebRTCClient.stopStream(['screen'])
        shareScreenStreamCopy?.getTracks().forEach((track) => track.stop())
        vsWebRTCClient.stopMediaCommunication(
          $room,
          $partner,
          'screen' + nickName
        )
        isScreenShare = false
      }
      resetCanvas()
      resetBackCanvas()
      $('#materialSelect-contents').show()

      // textbook: show download button
      $('#download-whiteboard').hide()
      $('#download-textbook').show()

      if (isMobile()) {
        $('#materialSelect-contents').css({
          'z-index': 1,
          position: 'absolute'
        })
        $('#stream-contents').css({ height: '100%' })
        $('.view-mode-group').css({ display: 'none' })
        $('#side-contents').css({ 'z-index': 0 })
        // $('#video-contents').css({ height: '40%' })
      }

      $('#video-contents').hide()
      $('#share-contents').hide()
      $('#draw_component').hide()
      $('#toggle-textbook').prop('checked', true)
      $('#toggle-screenshare').prop('checked', false)
      $('#toggle-board').prop('checked', false)
      $('#toggle-chat').prop('checked', false)
      videoContentsView(true)
      if (isMe) {
        modeChange(3)
      }
      break
    case 4: // 教材
      drawImageOnCanvas() //?
      if (isMe) {
        modeChange(4)
      }
      break
    case 5: // 教材キャンバス共有
      resetCanvas()
      resetBackCanvas()
      resetTextbookHtml()

      loading('#draw_parent', true)
      if (!isChatShare) {
        showBackTextbook(true)
        $('#btn-pen').hide()
        $('#btn-eraser').hide()
        $('.tooltip-en').attr('tooltip', 'Download textbook as PDF')
        $('.tooltip-jp').attr('tooltip', 'テキストをPDFでダウンロード')
      } else {
        $('#btn-pen').show()
        $('#btn-eraser').show()
        $('.tooltip-en').attr('tooltip', '')
        $('.tooltip-jp').attr('tooltip', '')
      }

      if (window?.innerWidth <= 500 || isIpad() || isMobile()) {
        $('.tooltip-en').attr('tooltip', '')
        $('.tooltip-jp').attr('tooltip', '')
      }

      //コンテンツ
      $('#draw_component').show()

      $('#download-whiteboard').hide()
      $('#download-textbook').show()

      if (isMobile()) {
        $('#draw_component').css({ 'z-index': 1, position: 'absolute' })
        $('#stream-contents').css({ height: '100%' })
        $('#side-contents').css({ 'z-index': 0 })
        // $('#video-contents').css({ height: '40%' })
      }
      $('#video-contents').hide()
      $('#share-contents').hide()
      $('#materialSelect-contents').hide()
      //ボタン
      $('#toggle-screenshare').prop('checked', false)
      if (isChatShare) {
        $('#toggle-board').prop('checked', isChatShare)
        $('#toggle-textbook').prop('checked', !isChatShare)

        if (mode == 2) {
          // 画面共有が有効の場合
          vsWebRTCClient.stopStream(['screen'])
          shareScreenStreamCopy?.getTracks().forEach((track) => track.stop())
          vsWebRTCClient.stopMediaCommunication(
            $room,
            $partner,
            'screen' + nickName
          )
          isScreenShare = false
        }
      } else {
        $('#toggle-textbook').prop('checked', !isChatShare)
        hideButtonPrevNext()
      }

      $('#toggle-textshare').prop('checked', true)
      $('#toggle-chat').prop('checked', false)
      videoContentsView(true)
      var canvasElementRemote = document.getElementById('remoteDrawCanvas')
      if (canvasElementRemote) {
        old_width = canvasElementRemote.width
        old_height = canvasElementRemote.height
      }

      var canvasElement = document.getElementById('draw')
      $('#draw').height($('#draw').width() * canvas_ratio)
      $('#draw').css('background-color', 'white')
      board.setRatio(
        old_width / canvasElement.clientWidth,
        old_height / canvasElement.clientHeight
      )
      if (isMe) {
        modeChange(5)
      }
      break
  }
}

//言語変換 0-English 1-Japanses
function changeLanguage(mode) {
  x = document.getElementsByClassName('chat-text-delete')
  if (x) {
    for (var i = 0; i < x.length; i++) {
      if (
        x[i].innerText == '--- deleted ---' ||
        x[i].innerText == '--- 削除済み ---'
      ) {
        x[i].innerText = mode ? '--- 削除済み ---' : '--- deleted ---'
      }
    }
  }
  if (mode === 1) {
    localStorage.setItem('languageType', 1)
    // document.querySelector('.chat-text-delete').innerHTML = 'JP'
    document.getElementById('delete-confirm').innerHTML =
      'このメッセージを削除しますか？'
    document.getElementById('delete-confirm-file').innerHTML =
      'このファイルを削除しますか？'
    document.getElementById('delete-cancel').innerHTML = 'キャンセル'
    document.getElementById('delete-yes').innerHTML = '削除'
  } else {
    localStorage.setItem('languageType', 0)
    // document.querySelector('.chat-text-delete').innerHTML = 'EN'
    document.getElementById('delete-confirm').innerHTML =
      'Do you want to delete this message?'
    document.getElementById('delete-confirm-file').innerHTML =
      'Do you want to delete this file?'
    document.getElementById('delete-cancel').innerHTML = 'Cancel'
    document.getElementById('delete-yes').innerHTML = 'Delete'
  }

  var showLanguage
  var hideLanguage
  switch (mode) {
    case 0:
      showLanguage = 'en'
      hideLanguage = 'jp'
      // if (isMobile()) {
      //   document.getElementsByClassName('prev')[0].innerText = '<'
      //   document.getElementsByClassName('next')[0].innerText = '>'
      // } else {
      //   document.getElementsByClassName('prev')[0].innerText = 'Prev'
      //   document.getElementsByClassName('next')[0].innerText = 'Next'
      // }

      break
    case 1:
      showLanguage = 'jp'
      hideLanguage = 'en'
      // if (isMobile()) {
      //   document.getElementsByClassName('prev')[0].innerText = '<'
      //   document.getElementsByClassName('next')[0].innerText = '>'
      // } else {
      //   document.getElementsByClassName('prev')[0].innerText = '前へ'
      //   document.getElementsByClassName('next')[0].innerText = '次へ'
      // }
      break
  }
  $('#toggle-language').prop('checked', !$('#toggle-language').prop('checked'))
  $('#toggle-sublanguage').prop(
    'checked',
    $('#toggle-language').prop('checked')
  )
  var languageElements = document.getElementsByClassName(hideLanguage)
  for (let i = 0; i < languageElements.length; i++) {
    $(languageElements[i]).hide()
  }
  var languageElements = document.getElementsByClassName(showLanguage)
  for (let i = 0; i < languageElements.length; i++) {
    $(languageElements[i]).show()
  }
}

//send Image File Chat
function sendImageChat() {
  isTextBook = false
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      isTextBook: false,
      canvasURL: tempUrlImage,
      channel: 'saveImage'
    }),
    false,
    'device'
  )
}

function assignTextBook() {
  isTextBook = true
  if (member.length > 1) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        isTextBook: true,
        isChatShare,
        channel: 'assignTextBook'
      }),
      false,
      'device'
    )
  }
}

//教材共有
var viewTextURL

function drawImageOnCanvas(isSend) {
  //mode = 5;
  //$("#toggle-textshare").prop("checked",true);//教材共有の有効化
  //Click Image Event
  var obj = event.target
  viewTextURL = obj.src || event.currentTarget.getAttribute('data-img')
  const pdfURL = obj.id || event.currentTarget.id
  $('#draw_component').show()
  if (isMobile()) {
    $('#draw_component').css({ 'z-index': 1, position: 'absolute' })
    $('#stream-contents').css({ height: '100%' })
    $('#side-contents').css({ 'z-index': 0 })
    // $('#video-contents').css({ height: '40%' })
  }
  //$("#video-contents").hide();
  $('#share-contents').hide()
  $('#materialSelect-contents').hide()
  // var canvasElement = document.getElementById('remoteDrawCanvas')
  // var canvasContext = document.getElementById('backgroundCanvas').getContext('2d')

  hideButtonPrevNext()
  showBackTextbook(false)

  var dummyImg = new Image()
  dummyImg.onload = myImageOnload
  // destroyLoading()

  $('#btn-pen').show()
  $('#btn-eraser').show()
  // dummyImg.addEventListener(
  //   'load',
  //   function () {
  //     canvas_ratio = dummyImg.height / dummyImg.width
  //     //setAllCanvasRatio()
  //     setAllCanvasSize(dummyImg.width, dummyImg.height)
  //     $('#draw').height($('#draw').width() * canvas_ratio)
  //     old_width = canvasElement.width
  //     old_height = canvasElement.height
  //     //キャンバスの描写倍率を変更
  //     board.setRatio(
  //       old_width / canvasElement.clientWidth,
  //       old_height / canvasElement.clientHeight
  //     )
  //     var scale = canvasElement.width / dummyImg.naturalWidth
  //     board.setMinScale(scale)
  //     // if (dummyImg.naturalHeight * scale > canvasElement.height) {
  //     //   scale = canvasElement.height / dummyImg.naturalHeight
  //     // }
  //     canvasContext.fillStyle = 'rgb(127, 127, 127)'
  //     canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height)
  //     canvasContext.drawImage(
  //       dummyImg,
  //       0,
  //       0,
  //       dummyImg.naturalWidth,
  //       dummyImg.naturalHeight
  //     )
  //     board.setDefaultDrawWidth($('#draw').width())
  //   },
  //   false
  // )

  //dummyImg.src = viewTextURL
  fetch(viewTextURL, {
    cache: 'reload' // reload cache to prevent tainted canvas
  })
    .then((response) => response.blob())
    .then((file) => {
      dummyImg.src = window.URL.createObjectURL(file)
      destroyLoading()
    })
    .catch((err) => {
      console.log(err)
    })

  // if (isSend) {
  //   drawWhiteboard()
  //   vsWebRTCClient.sendMessage(
  //     $room,
  //     $partner,
  //     JSON.stringify({
  //       canvasURL: viewTextURL,
  //       channel: 'recvPDFURL'
  //     }),
  //     false,
  //     'device'
  //   )
  // }
}

function drawPDFOnCanvas(pdfURL) {
  $('#draw_component').show()
  showBackTextbook(false)

  if (isMobile()) {
    $('#draw_component').css({ 'z-index': 1, position: 'absolute' })
    $('#stream-contents').css({ height: '100%' })
    $('#side-contents').css({ 'z-index': 0 })
    // $('#video-contents').css({ height: '40%' })
  }
  //$("#video-contents").hide();
  $('#share-contents').hide()
  $('#materialSelect-contents').hide()
  //resetCanvasData(0)
  hideButtonPrevNext()
  loading('#draw_parent', true)
  var loadingTask = pdfjsLib.getDocument(pdfURL)
  loadingTask.promise
    .then(function (pdf) {
      loading('#draw_parent', false)
      destroyLoading()
      total_height = 0
      total_width = 0
      start_x = 0
      start_y = 0
      thePDF = pdf
      numPages = pdf.numPages
      currPage = 1 //Pages are 1-based not 0-based

      // Page 1 Rendering To Canvas -> draw Image
      //renderPages()

      resetCanvasDataInMemory()
      pagetodisplay = 1
      renderPagesToMemory()
      $('#btn-pen').show()
      $('#btn-eraser').show()
    })
    .catch((error) => {
      loading('#draw_parent', false)
      console.error(error)
    })
}

var width = 1
var color = 1
var pen = 1

function exit() {
  if (converterDone(Converter.disconnect)) {
    Converter.disconnect()
  }
}

/*********************************************
 *             Drop List functions
 *********************************************/
function getDevicePermission() {
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true
    })
    .then(function (stream) {
      var videoTrack = stream.getVideoTracks()[0]
      var audioTrack = stream.getAudioTracks()[0]
      if (typeof videoTrack == 'undefined') {
        debugLog('デバイス取得', 'カメラが取得出来ませんでした。', 'olive')
      }
      if (typeof audioTrack == 'undefined') {
        debugLog('デバイス取得', 'マイクが取得出来ませんでした。', 'olive')
      }
      var tracks = stream.getTracks()
      tracks.forEach(function (track) {
        track.stop()
      })
      stream = undefined
      if (
        typeof videoTrack != 'undefined' ||
        typeof audioTrack != 'undefined'
      ) {
        changeDeviceList()
        firstCameraList()
      } else {
        $('.permission-modal').fadeIn(200)
        debugLog('デバイス取得', 'デバイスが取得出来ませんでした。', 'olive')
      }
      clientload()
    })
    .catch(function (e) {
      JoinWithoutCam = true
      if (JoinWithoutCam) {
        $('.notifiNoCamWrapper').css('display', 'block')
        $('#wrapperNotifiNoCam').removeClass('hiddenElement')

        $('#config_camera').addClass('hiddenElement')
      }
      navigator.mediaDevices
        .getUserMedia({
          audio: true
        })
        .then(function (stream) {
          var audioTrack = stream.getAudioTracks()[0]

          if (typeof audioTrack == 'undefined') {
            debugLog('デバイス取得', 'マイクが取得出来ませんでした。', 'olive')
          }
          var tracks = stream.getTracks()
          tracks.forEach(function (track) {
            track.stop()
          })
          stream = undefined
          if (typeof audioTrack != 'undefined') {
            changeDeviceList()
            firstCameraList()
          } else {
            $('.permission-modal').fadeIn(200)
            debugLog(
              'デバイス取得',
              'デバイスが取得出来ませんでした。',
              'olive'
            )
          }
          clientload()
        })
        .catch(function (e) {
          var message

          switch (e.name) {
            case 'AbortError':
              message = 'デバイスの許可はされていますが、利用できない状況です。'
              break
            case 'NotAllowedError':
              $('.permission-modal').fadeIn(200)
              message = 'デバイスの接続許可がされていません。'
              break
            case 'NotFoundError':
              message = '条件を満たす種類のデバイスが存在しません。'
              break
            case 'NotReadableError':
              message =
                'デバイスの許可はされていますが、デバイスにアクセスできませんでした。'
              break
            case 'OverconstrainedError':
              message = '条件を満たすデバイスが存在しません。'
              break
            case 'SecurityError':
              message = 'メディアのサポートが有効ではありません。'
              break
            case 'TypeError':
              message = '条件の値が正しくありません。'
              break
            default:
              message = '失敗しました。'
              return
          }
          debugLog('デバイス認証エラー', message, 'red')
          debugLog('デバイス認証エラー詳細', e.message, 'red')
        })
    })
}
//デバイス一覧の取得
function getDeviceList() {
  return new Promise(function (resolve, reject) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      reject({
        name: 'mediaDevices does not exist',
        message: 'デバイス認識に対応していないブラウザです。'
      })
    }
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      resolve(devices)
    })
  })
}
//IOSの最初に表示するモーダルのリスト更新
function firstDeviceList() {
  getDeviceList().then(function (results) {
    //デバイスリストの取得
    setDropList(results, 'first_mic', 'audioinput')
    selectDropList(
      deviceMicId,
      document.getElementById('first_mic'),
      displayScreenAudio
    )
    if (deviceMicId == undefined) {
      deviceMicId = $('#first_mic').val()
      audioConfig = new audioConstraints(deviceMicId)
    }
    setDropList(results, 'first_camera', 'videoinput')
    selectDropList(
      deviceCameraId,
      document.getElementById('first_camera'),
      displayScreenVideo
    )
    if (deviceCameraId == undefined) {
      deviceCameraId = $('#first_camera').val()
      videoConfig = new videoConstraints(deviceCameraId)
    }
  })
}

navigator.mediaDevices.ondevicechange = (event) => {
  console.log('check change device')
  changeDeviceList()
  getDeviceList().then(function (results) {
    const listCam = results.filter((item) => item.kind === 'videoinput')

    if (listCam.length === 1) {
      if (JoinWithoutCam) {
        if (previousCameraCount !== listCam.length)
          $('#notifiReload').fadeIn(200)
      } else {
        deviceCameraId = $('#config_camera').val()
        videoConfig.changeDeviceId(deviceCameraId)
        changeDeviceStream('video', true)
        vsWebRTCClient.sendMessage(
          $room,
          $partner,
          JSON.stringify({
            name: nickName,
            channel: 'hiddenTextDisconectCam'
          }),
          false,
          'device'
        )
      }
    } else if (listCam.length === 0 && !JoinWithoutCam) {
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          name: nickName,
          channel: 'showTextDisconectCam'
        }),
        false,
        'device'
      )
    }

    if (listCam.length !== previousCameraCount) {
      previousCameraCount = listCam.length
    }
  })
}

//ドロップリストの変更
function changeDeviceList() {
  getDeviceList().then(function (results) {
    //デバイスリストの取得
    setDropList(results, 'config_mic', 'audioinput')
    if (deviceMicId == undefined) {
      deviceMicId = $('#config_mic').val()
      audioConfig = new audioConstraints(deviceMicId)
    }
    // selectDropList(
    //   deviceMicId,
    //   document.getElementById('config_mic'),
    //   displayScreenAudio
    // )
    setDropList(results, 'config_camera', 'videoinput')
    if (deviceCameraId == undefined) {
      deviceCameraId = $('#config_camera').val()
      videoConfig = new videoConstraints(deviceCameraId)
    }
    selectDropList(
      deviceCameraId,
      document.getElementById('config_camera'),
      displayScreenVideo
    )
    setDropList(results, 'config_output', 'audiooutput')
    selectDropList(
      deviceOutputId,
      document.getElementById('config_output'),
      false
    )
    if (deviceOutputId == undefined) {
      deviceOutputId = $('#config_output').val()
    }
  })
  if (!isMobile()) {
    screenConfig = new screenConstraints(true)
  }
}
//ドロップリストの作成
function setDropList(devices, elementName, kind) {
  $('#' + elementName).empty()
  var devicelist = devices.filter(function (device, i, self) {
    return (
      device.kind === kind &&
      self.indexOf(device) === i &&
      device.deviceId !== 'default' &&
      device.deviceId !== 'communications'
    )
  })
  devicelist.forEach(function (device) {
    $('#' + elementName).append(
      "<option value='" + device.deviceId + "'>" + device.label + '</option>'
    )
  })
  debugLog('デバイスリスト', kind + 'のリストを更新しました。', 'sky')
}
//ドロップリストの初期値
function selectDropList(deviceId, targetElement, isShare) {
  if (deviceId != undefined) {
    if (isShare) {
      //画面共有中は未選択状態にする。
      targetElement.selectedIndex = -1
    } else {
      //現在指定している値を選択しておく。
      var optionlist = targetElement.options
      for (var i = 0; i < optionlist.length; i++) {
        if (optionlist[i].value == deviceId) {
          optionlist[i].selected = true
        }
      }
    }
  }
}

//出力の変更
function changeAudioOutput(element) {
  if (!element.paused) {
    element
      .setSinkId($('#config_output').val())
      .then(function () {
        debugLog('音声出力', '出力先を変更しました!', 'orange')
        output_id = $('#config_output').val()
      })
      .catch(function (err) {
        debugLog('音声出力', '出力先の変更に失敗しました。', 'red')
        debugLog('エラー詳細', err, 'red')
      })
  }
}

/*********************************************
 *           CreateElement Function
 *********************************************/
//*************** 映像要素の作成 ***************
function createVideoElement(
  stream,
  username,
  connectionId,
  micstate,
  camstate,
  isMe
) {
  var videoElement
  if (isMe) {
    if (username && username.length > 5 && isMobile()) {
      tempUserName = username.slice(0, 5) + '...'
    } else if (username && username.length > 10) {
      tempUserName = username.slice(0, 10) + '...'
    } else {
      tempUserName = username
    }
    $('#localName').text(tempUserName)
    $('#localName').css({ 'white-space': 'nowrap' })
    videoElement = document.getElementById('localVideo')
  } else {
    videoElement = document.getElementById('remoteVideo')
  }
  //映像の設定
  if (stream != undefined) {
    localStream = stream
    videoElement.addEventListener('loadeddata', function () {
      if (
        stream.getVideoTracks()[0] &&
        stream.getVideoTracks()[0].label != undefined
      ) {
        selectDropList(
          stream.getVideoTracks()[0].label,
          document.getElementById('config_camera'),
          displayScreenAudio
        )
      }
      if (localStorage.getItem('micId') && $partner) {
        audioConfig.changeDeviceId(JSON.parse(localStorage.getItem('micId')).id)
        changeDeviceStream('audio')
      }
      // if (
      //   stream.getAudioTracks()[0] &&
      //   stream.getAudioTracks()[0].label != undefined
      // ) {
      //   console.log('hello xin chao', stream.getAudioTracks()[0].label)
      //   selectDropList(
      //     stream.getAudioTracks()[0].label,
      //     document.getElementById('config_mic'),
      //     displayScreenAudio
      //   )
      // }

      var promise = videoElement.play()
      promise
        .catch((error) => {
          videoElement.pause()
          $('#autoplay_accept').on('click', function () {
            videoElement.play()
            if (converterDone(Converter.loadedStream)) {
              Converter.loadedStream()
              videoElement.muted = true
            }
            return false
          })
          debugLog(
            '自動再生',
            'このページはメディアの自動再生が許可されていません。',
            'red'
          )
          $('.autoplay-modal').fadeIn(200)
          return
        })
        .then(() => {
          debugLog('自動再生', '自動再生に成功しました。', 'green')
          if (username == nickName) {
            if (converterDone(Converter.loadedStream)) {
              Converter.loadedStream()
              videoElement.muted = true
            }
          } else {
            videoElement.muted = false
          }
        })
    })
    videoElement.setAttribute('playsinline', '')
    if (isMe) {
      localStreamCopy = stream.clone()
      // localStreamCopy.removeTrack(localStreamCopy.getAudioTracks()[0])

      vsWebRTCClient.showStream(videoElement, localStreamCopy)
    } else {
      vsWebRTCClient.showStream(videoElement, stream)
    }
  }
  // if (micstate) {
  //   stream.getAudioTracks()[0].enabled = false
  // }
  // if (camstate) {
  //   stream.getVideoTracks()[0].enabled = false
  // }

  stream.getAudioTracks()[0].enabled = micstate
  if (stream.getVideoTracks()[0]) stream.getVideoTracks()[0].enabled = camstate
  //メンバーの作成
  //createMemberElement(username, connectionId, micstate, camstate);
}

//*************** 参加者のラベル作成 ***************
/*
function createMemberElement(username, connectionId, micstate, camstate) {
  var template = document.getElementById('member_template');
  var clone = template.content.cloneNode(true);
  var infoContents = clone.querySelector(".membertext");
  var userLabel = clone.querySelector(".user-name-label");
  var micState = clone.querySelector(".min-offmic-icon");
  var camState = clone.querySelector(".min-offcam-icon");
  //情報枠の設定
  document.getElementById("member-area").appendChild(clone);
  infoContents.id = connectionId + "_label";

  micState.id = connectionId + "_membermic";
  camState.id = connectionId + "_membercam";
  //名前テキストの設定
  userLabel.innerText = username;
  //追加
  infoContents.addEventListener('click', function() {
    if (typeof spotUser !== "undefined") {
      document.getElementById(spotUser + "_label").classList.remove("spotText");
    }
    infoContents.classList.add("spotText");
    spotUser = userLabel.innerHTML;
  }, false);
  if (username == nickName) {
    changeMicButtonIcon(micstate);
  }
  changeMicState(username, micstate);
}*/
function replaceURLs(message) {
  if (!message) return

  var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g
  return message.replace(urlRegex, function (url) {
    var hyperlink = url
    if (!hyperlink.match('^https?://')) {
      hyperlink = 'http://' + hyperlink
    }
    return `<a href="${hyperlink}" target="_blank" style="white-space: normal;"> ${url}</a>`
  })
}
function createChatBubble(userId, message, time, isSave, eleId, isDeleted) {
  console.log('buble')
  var template = document.getElementById('chat_template')
  var clone = template.content.cloneNode(true)
  var timetext
  var dataTime

  if (time == undefined) {
    dataTime = new Date()
    // var hour = addDigit(dataTime.getHours())
    // var min = addDigit(dataTime.getMinutes())
    // timetext = hour + ':' + min
    timetext = `${moment(new Date(dataTime), 'YYYY-MM-DD HH:mm:ss')
      .tz('Asia/Tokyo')
      .format('HH:mm')}`
  } else {
    dataTime = new Date(time)
    // var hour = addDigit(dataTime.getHours())
    // var min = addDigit(dataTime.getMinutes())
    // timetext = hour + ':' + min
    timetext = `${moment(new Date(dataTime), 'YYYY-MM-DD HH:mm:ss')
      .tz('Asia/Tokyo')
      .format('HH:mm')}`
  }
  if (userId != undefined) {
    if (userId == Converter.getMyUserName()) {
      clone.getElementById('chat-right').innerText = userId
      clone.getElementById('chat-right').classList.add('chat-name')
      clone.getElementById('chat-left').innerText = timetext
      clone.getElementById('chat-bubble').classList.add('bubble-mine')
      clone.getElementById('chat-header').classList.add('bubble-other')
      // var btnDelete = document.createElement('div')
      // btnDelete.classList.add('chat-delete-right')
      // clone.getElementById('chat-bubble').appendChild(btnDelete)
      if (isSave) {
        logData.push({
          type: 1,
          username: userId,
          time: dataTime.getTime(),
          message: message
        })
      }
    } else {
      clone.getElementById('chat-left').innerText = timetext
      clone.getElementById('chat-right').innerText = userId
      clone.getElementById('chat-right').classList.add('chat-name')

      if (isSave) {
        logData.push({
          type: 2,
          username: userId,
          time: dataTime.getTime(),
          message: message
        })
      }
      clone.getElementById('chat-bubble').classList.add('bubble-other')
      clone.getElementById('chat-header').classList.add('bubble-mine')
    }
    var btnDelete = document.createElement('div')
    btnDelete.classList.add('chat-delete-right')
    if (eleId) {
      clone
        .getElementById('chat-parent')
        .setAttribute('data-value', `chat_text_${eleId}`)
      btnDelete.onclick = () => handleDeleteChat(eleId, btnDelete)
    }
    if (userId && userId == Converter.getMyUserName() && !isDeleted)
      clone.getElementById('chat-bubble').appendChild(btnDelete)

    if (/<\/?[a-z][\s\S]*>/i.test(message)) {
      clone.getElementById('chat-text').innerText = message
    } else {
      message = replaceURLs(message)
      let innerText = document.createRange().createContextualFragment(message)
      clone.getElementById('chat-text').append(innerText)
    }

    document.getElementById('chat-area').appendChild(clone)
    // scrollControl(document.getElementById('chat-area'), 'end')
  }
}

const getDigitDateTime = (time) => {
  let year = addDigit(time.getFullYear())
  let month = addDigit(time.getMonth() + 1)
  let day = addDigit(time.getDate())
  let hour = addDigit(time.getHours())
  let min = addDigit(time.getMinutes())
  return { year, month, day, hour, min }
}
function createInfoBubble(userId, type, time, isSave, eleId) {
  var dataTime = time ? new Date(time) : new Date()
  const { day, month, year, hour, min } = getDigitDateTime(dataTime)

  // var timetext =
  //   type === 'join' || type === 'exit'
  //     ? `${year}/${month}/${day} ${hour}:${min}`
  //     : `${hour}:${min}`

  var timetext =
    type === 'join' || type === 'exit'
      ? `${moment(new Date(dataTime), 'YYYY-MM-DD HH:mm:ss')
          .tz('Asia/Tokyo')
          .format('YYYY/MM/DD HH:mm')}`
      : `${moment(new Date(dataTime), 'YYYY-MM-DD HH:mm:ss')
          .tz('Asia/Tokyo')
          .format('HH:mm')}`

  var template = document.getElementById('chat_template')
  var clone = template.content.cloneNode(true)
  if (eleId)
    clone
      .getElementById('chat-parent')
      .setAttribute('data-value', `chat_text_${eleId}`)

  var jpInfoElement = document.createElement('div')
  var enInfoElement = document.createElement('div')
  jpInfoElement.classList.add('jp')
  enInfoElement.classList.add('en')
  jpInfoElement.innerText = ''
  enInfoElement.innerText = ''
  clone.getElementById('chat-left').appendChild(jpInfoElement)
  clone.getElementById('chat-left').appendChild(enInfoElement)

  clone.getElementById('chat-right').innerText = timetext
  clone.getElementById('chat-left').classList.add('chat-name')
  clone.getElementById('chat-parent').classList.add('bubble-system')
  // clone.getElementById('chat-bubble').classList.add('bubble-system')
  if (isSave) {
    logData.push({
      type: 0,
      username: userId,
      time: dataTime.getTime(),
      message: type
    })
  }
  var jpText
  var enText
  switch (type) {
    case 'join':
      jpText = userId + ' が入室しました。'
      enText = userId + ' has entered the room.'
      break
    case 'exit':
      jpText = userId + ' が退室しました。'
      enText = userId + ' has exited the room.'
      break
  }
  var jpTextElement = document.createElement('div')
  var enTextElement = document.createElement('div')
  jpTextElement.classList.add('jp')
  enTextElement.classList.add('en')
  jpTextElement.innerText = jpText
  enTextElement.innerText = enText
  clone.getElementById('chat-text').appendChild(jpTextElement)
  clone.getElementById('chat-text').appendChild(enTextElement)
  if (languageType % 2 == 1) {
    $(enTextElement).hide()
    $(enInfoElement).hide()
  } else {
    $(jpTextElement).hide()
    $(jpInfoElement).hide()
  }
  document.getElementById('chat-area').appendChild(clone)
  //スクロールを最後に
  // scrollControl(document.getElementById('chat-area'), 'end')
}
function createRecordBubble(userId, type, time) {
  var timetext
  if (time == undefined) {
    var dataTime = new Date()
    // var hour = addDigit(dataTime.getHours())
    // var min = addDigit(dataTime.getMinutes())
    // timetext = hour + ':' + min
    timetext = `${moment(new Date(dataTime), 'YYYY-MM-DD HH:mm:ss')
      .tz('Asia/Tokyo')
      .format('HH:mm')}`
  } else {
    var dataTime = new Date(time)
    // var hour = addDigit(dataTime.getHours())
    // var min = addDigit(dataTime.getMinutes())
    // timetext = hour + ':' + min
    timetext = `${moment(new Date(dataTime), 'YYYY-MM-DD HH:mm:ss')
      .tz('Asia/Tokyo')
      .format('HH:mm')}`
  }
  var template = document.getElementById('chat_template')
  var clone = template.content.cloneNode(true)

  var jpInfoElement = document.createElement('div')
  var enInfoElement = document.createElement('div')
  jpInfoElement.classList.add('jp')
  enInfoElement.classList.add('en')
  jpInfoElement.innerText = ''
  enInfoElement.innerText = ''
  clone.getElementById('chat-left').appendChild(jpInfoElement)
  clone.getElementById('chat-left').appendChild(enInfoElement)

  clone.getElementById('chat-right').innerText = timetext
  clone.getElementById('chat-left').classList.add('chat-name')
  clone.getElementById('chat-parent').classList.add('bubble-system')
  // clone.getElementById('chat-bubble').classList.add('bubble-system')

  var jpText
  var enText
  switch (type) {
    case 'start':
      jpText = userId + ' が録画を開始しました。'
      enText = userId + ' start recording.'
      break
    case 'stop':
      jpText = userId + ' が録画を停止しました。'
      enText = userId + ' stop recording.'
      break
  }
  var jpTextElement = document.createElement('div')
  var enTextElement = document.createElement('div')
  jpTextElement.classList.add('jp')
  enTextElement.classList.add('en')
  jpTextElement.innerText = jpText
  enTextElement.innerText = enText
  clone.getElementById('chat-text').appendChild(jpTextElement)
  clone.getElementById('chat-text').appendChild(enTextElement)
  if (languageType % 2 == 1) {
    $(enTextElement).hide()
    $(enInfoElement).hide()
  } else {
    $(jpTextElement).hide()
    $(jpInfoElement).hide()
  }
  document.getElementById('chat-area').appendChild(clone)
  //スクロールを最後に
  // scrollControl(document.getElementById('chat-area'), 'end')
}
function createDeleteBubble() {
  var template = document.getElementById('chat_template')
  var clone = template.content.cloneNode(true)

  // var jpInfoElement = document.createElement('div')
  // var enInfoElement = document.createElement('div')
  // jpInfoElement.classList.add('jp')
  // enInfoElement.classList.add('en')
  // jpInfoElement.innerText = 'アナウンス'
  // enInfoElement.innerText = 'Info'
  // clone.getElementById('chat-left').appendChild(jpInfoElement)
  // clone.getElementById('chat-left').appendChild(enInfoElement)

  // clone.getElementById('chat-right').innerText = timetext
  // clone.getElementById('chat-left').classList.add('chat-name')
  // clone.getElementById('chat-bubble').classList.add('bubble-system')

  var jpText = 'JP'
  var enText = 'EN'

  var jpTextElement = document.createElement('div')
  var enTextElement = document.createElement('div')
  jpTextElement.classList.add('jp')
  enTextElement.classList.add('en')
  jpTextElement.innerText = jpText
  enTextElement.innerText = enText
  clone.getElementById('chat-text').appendChild(jpTextElement)
  clone.getElementById('chat-text').appendChild(enTextElement)
  if (languageType % 2 == 1) {
    $(enTextElement).hide()
    $(enInfoElement).hide()
  } else {
    $(jpTextElement).hide()
    $(jpInfoElement).hide()
  }
  document.getElementById('chat-area').appendChild(clone)
  //スクロールを最後に
  // scrollControl(document.getElementById('chat-area'), 'end')
}
function createFileBubble(userId, fileName, time, eleId, isDeleted, fileLink) {
  var template = document.getElementById('chat_template')
  var clone = template.content.cloneNode(true)
  if (eleId)
    clone
      .getElementById('chat-parent')
      .setAttribute('data-value', `chat_text_${eleId}`)

  var timetext
  var dataTime
  if (time == undefined) {
    dataTime = new Date()
    // var hour = addDigit(dataTime.getHours())
    // var min = addDigit(dataTime.getMinutes())
    // timetext = hour + ':' + min
    timetext = `${moment(new Date(dataTime), 'YYYY-MM-DD HH:mm:ss')
      .tz('Asia/Tokyo')
      .format('HH:mm')}`
  } else {
    dataTime = new Date(time)
    // var hour = addDigit(dataTime.getHours())
    // var min = addDigit(dataTime.getMinutes())
    // timetext = hour + ':' + min
    timetext = `${moment(new Date(dataTime), 'YYYY-MM-DD HH:mm:ss')
      .tz('Asia/Tokyo')
      .format('HH:mm')}`
  }
  if (userId != undefined) {
    var btnDownload = document.createElement('div')
    var loadingDownload = document.createElement('img')
    loadingDownload.setAttribute('src', './svg/spinerLoadingChat.svg')
    loadingDownload.classList.add('loadingChat')
    loadingDownload.style.display = 'none'

    btnDownload.classList.add('download-file-button')
    btnDownload.onclick = function downloadFile() {
      btnDownload.style.display = 'none'
      loadingDownload.style.display = 'initial'
      const url = `${URL_LESSON_ROOM}/download_message/${eleId}`

      const urlZIP = `${URL_LESSON_ROOM}/download_message/${eleId}?is_zip=true`
      if (recording) isDownloadFileChat = true
      //downloadDataFromUrl(url, name)
      if (isMobile()) {
        if (isIpad() || isIOS()) {
          fetchDataFromUrl(urlZIP, fileLink, fileName)
        } else {
          fetchDataFromUrl(url, fileLink, fileName, urlZIP)
        }
      } else {
        fetchDataFromUrl(url, fileLink, fileName)
      }

      setTimeout(() => {
        btnDownload.style.display = 'initial'
        loadingDownload.style.display = 'none'
      }, 2000)
      return false
    }
    if (!isDeleted)
      clone.getElementById('chat-bubble').appendChild(loadingDownload)
    if (!isDeleted) clone.getElementById('chat-bubble').appendChild(btnDownload)
    if (userId == Converter.getMyUserName()) {
      clone.getElementById('chat-right').innerText = userId
      clone.getElementById('chat-right').classList.add('chat-name')
      clone.getElementById('chat-left').innerText = timetext
      clone.getElementById('chat-bubble').classList.add('bubble-mine')
      clone.getElementById('chat-header').classList.add('bubble-other')
      var btnDeleteFile = document.createElement('div')
      btnDeleteFile.classList.add('chat-delete-right')
      btnDeleteFile.onclick = () =>
        handleDeleteChat(eleId, btnDeleteFile, btnDownload)
      if (!isDeleted)
        clone.getElementById('chat-bubble').appendChild(btnDeleteFile)
    } else {
      clone.getElementById('chat-left').innerText = timetext
      clone.getElementById('chat-right').innerText = userId
      clone.getElementById('chat-right').classList.add('chat-name')
      clone.getElementById('chat-bubble').classList.add('bubble-other')
      clone.getElementById('chat-header').classList.add('bubble-mine')
    }
    const tempWrapper = document.createElement('div')
    clone.getElementById('chat-text').classList.add('file-text-chat')
    clone.getElementById(
      'chat-text'
    ).innerHTML = `<span class="file-icon"><i class="fa fa-file" aria-hidden="true"></i></span> ${fileName}`
    document.getElementById('chat-area').appendChild(clone)
    // scrollControl(document.getElementById('chat-area'), 'end')
  }
}

function removeChat(chatId) {
  const chat = document.querySelectorAll(
    `[data-value="chat_text_${chatId}"]`
  )[0]
  if (!chat.classList.contains('row')) {
    chat.children[1].children[0].innerHTML =
      languageType % 2 == 1 ? '--- 削除済み ---' : '--- deleted ---'
    chat.children[1].children[1]?.remove()
  } else {
    var template = document.getElementById('chat_template')
    var clone = template.content.cloneNode(true)
    clone.getElementById('chat-left').innerText = Converter.getMyUserName()
    clone.getElementById('chat-left').classList.add('chat-name')
    clone.getElementById('chat-bubble').classList.add('bubble-other')
    clone.getElementById('chat-text').innerText =
      languageType % 2 == 1 ? '--- 削除済み ---' : '--- deleted ---'
    chat.replaceWith(clone)
  }
}
//*************** 映像・参加者のマイクアイコン変更 ***************
function changeMicState(userId, micstatus) {
  var targetID
  if (userId == nickName) {
    targetID = 'toggle-mic'
  } else {
    targetID = 'toggle-remotemic'
  }
  $('#' + targetID).prop('checked', micstatus)
}

// Check cam status
function changeCameraState(userId, camerastatus) {
  var targetID
  if (userId == nickName) {
    targetID = 'toggle-camera'
  } else {
    targetID = 'toggle-remotecamera'
  }
  $('#' + targetID).prop('checked', camerastatus)
}

//check record status
function changeRecordState(userId, recordstatus) {
  var targetID
  if (userId == nickName) {
    targetID = 'toggle-record'
  } else {
    targetID = 'toggle-remoterecord'
  }
  $('#' + targetID).prop('checked', recordstatus)
}

//キャンバス要素を追加する。
/*
function startCanvas() {
  var targetElement = document.getElementById("main-videocontents");
  var wtemplate = document.getElementById('whiteboard_template');
  var wclone = wtemplate.content.cloneNode(true);
  var canvas = wclone.querySelector("#draw_parent");
  targetElement.appendChild(canvas);
}*/

function endWhiteboard() {
  var canvas = wclone.querySelector('#draw_parent')
  canvas.remove()
}

function saveWhiteboard() {
  var canvas = document.getElementById('localDrawCanvas')
  var base64 = canvas.toDataURL('image/png')
  return base64
}

function drawWhiteboard() {
  var canvas = document.getElementById('backgroundCanvas')
  var data = canvas.toDataURL('image/png')
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      canvasData: data,
      channel: 'canvasBG'
    }),
    false,
    'device'
  )
}

function sendWhiteboard(partner) {
  //自分のキャンバス送信
  var canvas = document.getElementById('localDrawCanvas')
  var base64 = canvas.toDataURL('image/png')
  vsWebRTCClient.sendMessage(
    $room,
    partner,
    JSON.stringify({
      type: false,
      canvasData: base64,
      channel: 'canvasData'
    }),
    false,
    'device'
  )

  //参加者のキャンバス送信
  var canvas = document.getElementById('remoteDrawCanvas')
  var base64 = canvas.toDataURL('image/png')
  vsWebRTCClient.sendMessage(
    $room,
    partner,
    JSON.stringify({
      type: true,
      canvasData: base64,
      channel: 'canvasData'
    }),
    false,
    'device'
  )
}

function sendWhiteboardMultiPages(partner) {
  //自分のキャンバス送信
  var canvasLocal = document.getElementById('localDrawCanvas')
  var base64Local = canvasLocal.toDataURL('image/png')
  var lengthLocal = base64Local.length
  var chunksizeLocal = Math.ceil(lengthLocal / numPages)

  var chunkLocal
  var startLocal
  for (var i = 1; i <= numPages; i++) {
    startLocal = (i - 1) * chunksizeLocal
    chunkLocal = base64Local.substr(startLocal, chunksizeLocal)
    vsWebRTCClient.sendMessage(
      $room,
      partner,
      JSON.stringify({
        type: false,
        page: i,
        canvasData: chunkLocal,
        channel: 'canvasDataPages'
      }),
      false,
      'device'
    )
  }

  //参加者のキャンバス送信
  var canvasRemote = document.getElementById('remoteDrawCanvas')
  var base64Remote = canvasRemote.toDataURL('image/png')
  var lengthRemote = base64Remote.length
  var chunksizeRemote = Math.ceil(lengthRemote / numPages)

  var chunkRemote
  var startRemote
  for (var i = 1; i <= numPages; i++) {
    startRemote = (i - 1) * chunksizeRemote
    chunkRemote = base64Remote.substr(startRemote, chunksizeRemote)
    vsWebRTCClient.sendMessage(
      $room,
      partner,
      JSON.stringify({
        type: true,
        page: i,
        canvasData: chunkRemote,
        channel: 'canvasDataPages'
      }),
      false,
      'device'
    )
  }
}

function sendMultiCanvasPages(partner) {
  saveCanvasToMemory()
  vsWebRTCClient.sendMessage(
    $room,
    partner,
    JSON.stringify({
      numPages: numPages,
      channel: 'numPages'
    }),
    false,
    'device'
  )
  for (var i = 1; i <= numPages; i++) {
    vsWebRTCClient.sendMessage(
      $room,
      partner,
      JSON.stringify({
        type: false,
        page: i,
        canvasData: canvasDataLocal_array[i - 1],
        channel: 'canvasMultiDataPages'
      }),
      false,
      'device'
    )
    vsWebRTCClient.sendMessage(
      $room,
      partner,
      JSON.stringify({
        type: true,
        page: i,
        canvasData: canvasDataRemote_array[i - 1],
        channel: 'canvasMultiDataPages'
      }),
      false,
      'device'
    )
  }
}

function sendPagetodisplay(partner) {
  if (partner) {
    vsWebRTCClient.sendMessage(
      $room,
      partner,
      JSON.stringify({
        page: pagetodisplay,
        channel: 'pagetodisplay'
      }),
      false,
      'device'
    )
  }
}

/*********************************************
 *             layout functions
 *********************************************/
function view(isChange) {
  return
  if (!isChange) {
    --viewType
  }
  switch (viewType % 3) {
    case 0: //タイル
      document.getElementById('sub-videocontents').className = 'col-sm-0'
      document.getElementById('main-videocontents').className = 'col-sm-12'
      $('#icon_view').text('サイドバー')
      document.getElementById('icon_view').classList.remove('tile')
      document.getElementById('icon_view').classList.remove('spot')
      document.getElementById('icon_view').classList.add('sidebar')
      debugLog('表示変更', '表示形式:タイル に変更しました。', 'gray')
      changeTile(document.getElementsByClassName('videocontents').length)
      break
    case 1: //サイドバー
      document.getElementById('sub-videocontents').className = 'col-sm-4'
      document.getElementById('main-videocontents').className = 'col-sm-8'
      $('#icon_view').text('スポットライト')
      document.getElementById('icon_view').classList.remove('sidebar')
      document.getElementById('icon_view').classList.remove('tile')
      document.getElementById('icon_view').classList.add('spot')
      debugLog('表示変更', '表示形式:サイドバー に変更しました。', 'gray')
      changeSidebar()
      break
    case 2: //スポットライト
      document.getElementById('sub-videocontents').className = 'col-sm-0'
      document.getElementById('main-videocontents').className = 'col-sm-12'
      $('#icon_view').text('タイル')
      document.getElementById('icon_view').classList.remove('spot')
      document.getElementById('icon_view').classList.remove('sidebar')
      document.getElementById('icon_view').classList.add('tile')
      debugLog('表示変更', '表示形式:スポットライト に変更しました。', 'gray')
      changeSpotlight()
      break
  }
  viewType++
}

// 表示変更(タイル)
function changeTile(number) {
  // 人数を指定
  member.sort(ascSort)
  Object.keys(member).forEach(function (key) {
    var element = document.getElementById(member[key]['name'] + '_parent')
    element.className = 'videocontents'
    element.classList.add('column-' + getColumn(number))
    element.classList.add('col-' + getRow(number))
    document.getElementById('main-videos').appendChild(element)
    element.getElementsByTagName('video')[0].play()
  })
}

// 横の大きさ設定
function getColumn(number) {
  var column = 1
  if (number > 24) {
    column = 5
  } else {
    if (number > 18) {
      column = 4
    } else {
      if (number > 16) {
        column = 3
      } else {
        if (number > 9) {
          column = 4
        } else {
          if (number > 6) {
            column = 3
          } else {
            if (number > 2) {
              column = 2
            } else {
              column = 1
            }
          }
        }
      }
    }
  }
  return column
}

// 縦の大きさ設定
function getRow(number) {
  var row = 1
  if (number > 16) {
    row = 2
  } else {
    if (number > 12) {
      row = 3
    } else {
      if (number > 4) {
        row = 4
      } else {
        if (number > 1) {
          row = 6
        } else {
          row = 12
        }
      }
    }
  }
  return row
}

function videoContentsView(isSmall) {
  var videoElement = document.getElementById('video-contents')
  var chatElement = document.getElementById('text-area')
  if (isSmall && !isMobile()) {
    //チャットを75%に設定
    chatElement.className = 'w-100 h-75'
    videoElement.className = 'w-100 h-25 p-0'
    $('.usertext').css({ 'font-size': '0.5em' })
    $(videoElement).show()
    $(chatElement).show()
    $(videoElement).insertBefore(document.getElementById('text-area'))
    //chatElement.parentNode.insertBefore(videoElement, document.getElementById("side-area").firstChild);
  } else {
    //チャットを100%に設定
    chatElement.className = 'w-100 h-100'
    if (!isMobile()) {
      videoElement.className = 'row'
    }
    $(videoElement).show()
    $(chatElement).show()
    $('.usertext').css({ 'font-size': '0.8em' })
    var streamElement = document.getElementById('stream-contents')
    streamElement?.insertBefore(videoElement, streamElement.firstChild)
  }
}

function sideContentsView() {
  var sideElement = document.getElementById('side-contents')
  var streamElement = document.getElementById('stream-contents')
  var chatElement = document.getElementById('chat-contents')
  //var memberElement = document.getElementById("member-contents");
  var paintElement = document.getElementById('paint-contents')
  var menuElement = document.getElementById('menu_bar_parent')
  var number = 0
  if (displayChat) {
    number += 1
  }
  if (displayMember) {
    number += 2
  }
  if (displayPaint) {
    number += 4
  }
  number = 1
  switch (number) {
    default:
    case 0: //サイドコンテンツを非表示に
      $(sideElement).hide()
      streamElement.className = 'col-12'
      sideElement.className = 'col-0'
      break
    case 1: // チャットコンテンツを表示
      $(sideElement).show()
      $(chatElement).show()
      if (isMobile()) {
        streamElement.className = 'col-12 col-lg-9 col-sm-5'
        sideElement.className = 'col-12 col-lg-3 col-sm-6'
        menuElement.className = 'col-sm-1 col-lg-12 p-0'
      } else {
        streamElement.className = 'col-12 col-lg-8 col-sm-6 col-xl-9'
        sideElement.className = 'col-12 col-lg-4 col-sm-6 col-xl-3'
        menuElement.className = 'col-sm-12 col-lg-12 p-0'
      }

      chatElement.className = 'col-12 h-100'
      //memberElement.parentNode.insertBefore(chatElement, memberElement.parentNode.firstChild);
      //$(memberElement).hide();
      break
    case 2: // メンバーコンテンツを表示
      $(sideElement).show()
      //$(memberElement).show();
      if (isMobile()) {
        streamElement.className = 'col-12 col-lg-9 col-sm-5'
        sideElement.className = 'col-12 col-lg-3 col-sm-6'
        menuElement.className = 'col-sm-1 col-lg-12 p-0'
      } else {
        streamElement.className = 'col-12 col-lg-8 col-sm-6 col-xl-9'
        sideElement.className = 'col-12 col-lg-4 col-sm-6 col-xl-3'
        menuElement.className = 'col-sm-12 col-lg-12 p-0'
      }

      //memberElement.className = "col-12 h-100";
      //chatElement.parentNode.insertBefore(memberElement, chatElement.parentNode.firstChild);
      $(chatElement).hide()
      break
    case 3: // チャット・メンバーコンテンツを同時表示
      $(chatElement).show()
      //$(memberElement).show();
      chatElement.className = 'col-12 h-50'
      //memberElement.className = "col-12 h-50";
      break
    case 4: // ペイント
      $(paintElement).show()
      $(sideElement).show()
      $(chatElement).hide()
      //$(memberElement).hide();
      if (isMobile()) {
        streamElement.className = 'col-12 col-lg-9 col-sm-5'
        sideElement.className = 'col-12 col-lg-3 col-sm-6'
        menuElement.className = 'col-sm-1 col-lg-12 p-0'
      } else {
        streamElement.className = 'col-12 col-lg-8 col-sm-6 col-xl-9'
        sideElement.className = 'col-12 col-lg-4 col-sm-6 col-xl-3'
        menuElement.className = 'col-sm-12 col-lg-12 p-0'
      }

      break
    case 5: // ペイント・チャット
      $(paintElement).hide()
      $(sideElement).show()
      $(chatElement).show()
      if (isMobile()) {
        streamElement.className = 'col-12 col-lg-9 col-sm-5'
        sideElement.className = 'col-12 col-lg-3 col-sm-6'
        menuElement.className = 'col-sm-1 col-lg-12 p-0'
      } else {
        streamElement.className = 'col-12 col-lg-8 col-sm-6 col-xl-9'
        sideElement.className = 'col-12 col-lg-4 col-sm-6 col-xl-3'
        menuElement.className = 'col-sm-12 col-lg-12 p-0'
      }

      chatElement.className = 'col-12 h-100 p-0'
      //  memberElement.parentNode.insertBefore(chatElement, memberElement.parentNode.firstChild);
      //$(memberElement).hide();
      break
    case 6: // ペイント・メンバー
      $(paintElement).hide()
      $(sideElement).show()
      //$(memberElement).show();
      streamElement.className = 'col-12 col-lg-9 col-sm-5'
      sideElement.className = 'col-12 col-lg-3 col-sm-6'
      menuElement.className = 'col-sm-1 col-lg-12 p-0 sticky-top'
      //memberElement.className = "col-12 h-100 p-0";
      //chatElement.parentNode.insertBefore(memberElement, chatElement.parentNode.firstChild);
      $(chatElement).hide()
      break
    case 7: // ペイント・メンバー・チャット
      $(paintElement).hide()
      $(chatElement).show()
      //$(memberElement).show();
      chatElement.className = 'col-12 h-50 p-0'
      //memberElement.className = "col-12 h-50 p-0";
      break
  }
}

// 表示変更(サイドバー)
function changeSidebar() {
  //viewType = 1;
  member.sort(ascSort)
  Object.keys(member).forEach(function (key) {
    var element = document.getElementById(member[key].name + '_parent')
    if (member[key].priority == 1) {
      //表示順 : 1 のユーザーを大きくする
      element.className = 'videocontents spotvideo col-12'
      document.getElementById('main-videos').appendChild(element)
    } else {
      //それ以外
      element.className = 'videocontents col-12'
      var parentElement = document.getElementById('sub-videos')
      document.getElementById('sub-videos').appendChild(element)
    }
    element.getElementsByTagName('video')[0].play()
  })
}

function changeSpotlight() {
  // スポットユーザー または 表示順が2のユーザーに注目する
  member.sort(ascSort) //メンバーを表示順にする
  var target
  if (typeof spotUser === 'undefined') {
    //一人の場合、自分自身が対象
    if (Object.keys(member).length < 2) {
      target = nickName
    } else {
      //対象が複数
      //表示順が2のユーザーが対象
      var targetUser = member.find(function (user) {
        return user.priority == 1
      })
      target = targetUser.name
    }
  } else {
    target = spotUser
  }
  Object.keys(member).forEach(function (key) {
    var element = document.getElementById(member[key].name + '_parent')
    if (member[key].name == target) {
      //スポットユーザーの場合
      element.className = 'videocontents spotvideo col-12'
      document.getElementById('main-videos').appendChild(element)
    } else {
      //通常の場合
      element.className = 'videocontents col-12'
      document.getElementById('sub-videos').appendChild(element)
    }
  })
}

//メンバーボタンのアイコン変更
function changeMemberButtonIcon() {
  var target = document.getElementById('icon_member')
  if (target == undefined) {
    return
  }
  if (displayMember) {
    target.classList.add('icon_member_on')
    target.classList.remove('icon_member_off')
  } else {
    target.classList.remove('icon_member_on')
    target.classList.add('icon_member_off')
  }
}
/*********************************************
 *              another functions
 *********************************************/
//昇順ソート
function ascSort(a, b) {
  if (a.priority > b.priority) {
    return 1
  } else {
    return -1
  }
}

//指定したユーザーを最優先に変更
function changeTopPriority(name) {
  var targetIndex = Object.keys(member).filter(function (key) {
    return member[key].name == name
  })
  var targetPriority = member[targetIndex].priority
  Object.keys(member).forEach(function (key) {
    if (member[key].name == member[targetIndex].name) {
      member[targetIndex].priority = 1
    } else {
      if (member[key].priority < targetPriority) {
        member[key].priority++
      }
    }
  })
}
//*************** 入力キーの制限 ***************

let onPressShiftKey = false
let onPressEnterKey = false

$('#chat-input').keydown(function (e) {
  onPressShiftKey = e.shiftKey
})

$('#chat-input').keydown(function (e) {
  onPressEnterKey = e.key == 'Enter'
})

let sendText = document.getElementById('chat-input')
sendText.addEventListener('input', function (e) {
  if (document.getElementById('cb_send').checked) {
    let val = e.target.value
    const nlAt = val.indexOf('\n')
    if (nlAt >= 0 && !onPressShiftKey && onPressEnterKey) {
      document.getElementById('btn-send').click()
      e.preventDefault()
    }
  }
})

// $('textarea').keydown(function (e) {
//   if (document.getElementById('cb_send').checked) {
//     if (e.key == 'Enter' && !e.shiftKey) {
//       document.getElementById('btn-send').click()
//       e.preventDefault()
//     }
//     // } else {
//     //   if (e.key == "Enter" && !e.shiftKey) {
//     //     e.preventDefault();
//     //     document.getElementById("chat-input").value = "";
//     //   }
//   }
// })

function addText() {
  //テキストエリアと挿入する文字列を取得
  var area = document.getElementById('chat-input')
  var text = `\r\n`

  //カーソルの位置を基準に前後を分割して、その間に文字列を挿入
  area.value =
    area.value.substr(0, area.selectionStart) +
    text +
    area.value.substr(area.selectionStart)
}

$('#menu_bar_parent').on('mousemove', function () {
  if (displayFullScreen) {
    $('#menu_bar').addClass('up')
    $('#menu_bar').removeClass('down')
  }
})
$('#menu_bar_parent').on('mouseleave', function () {
  if (displayFullScreen) {
    $('#menu_bar').addClass('down')
    $('#menu_bar').removeClass('up')
  }
})
/*********************************************
 *              Parameter functions
 *********************************************/
function getCookieString() {
  if (1 < document.cookie) {
    let cookies = document.cookie.split(';')
    let result = new Object()
    for (let i = 0; i < cookies.length; i++) {
      var element = value.split('=')
      result[decodeURIComponent(element[0])] = decodeURIComponent(element[1])
    }
    return result
  }
  return null
}

function getQueryStringFromDecodeURL(sessionParam) {
  let parameters = sessionParam.split('&')
  let result = new Object()
  for (let i = 0; i < parameters.length; i++) {
    let element = parameters[i].split('=')
    let paramName = decodeURIComponent(element[0])
    let paramValue = decodeURIComponent(element[1])
    result[paramName] = decodeURIComponent(paramValue)
  }
  return result
}

function getQueryString() {
  if (1 < document.location.search.length) {
    let query = document.location.search.substring(1)
    return getQueryStringFromDecodeURL(query)
  }
  return null
}

/*********************************************
 *              Script Load
 *********************************************/
function loadScript(url, callback) {
  if (true) {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (
          script.readyState === 'loaded' ||
          script.readyState === 'complete'
        ) {
          script.onreadystatechange = null
          callback()
        }
      }
    } else {
      script.onload = function () {
        callback()
      }
    }
    document.getElementsByTagName('head')[0].appendChild(script)
  } else {
    debugLog(
      'load_Script',
      '読み込みファイルが指定以上のため、読み込みをキャンセルしました。',
      'blue'
    )
  }
}
/*********************************************
 *               Audio Level
 *********************************************/
function createAudioGraph(stream) {
  localContext = new (window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.oAudioContext ||
    window.msAudioContext)()
  analyser = localContext.createAnalyser()
  javascriptNode = localContext.createScriptProcessor(2048, 1, 1)

  var microphone = localContext.createMediaStreamSource(stream)

  javascriptNode.disconnect(localContext)
  microphone.connect(analyser)
  analyser.connect(javascriptNode)
  javascriptNode.connect(localContext.destination)
  javascriptNode.onaudioprocess = function () {
    var array = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(array)

    var values = 0

    var length = array.length
    for (var i = 0; i < length; i++) {
      values += array[i]
    }

    var average = values / length
    document.getElementById('config_input').value = average
  }
}

// ********** ログ出力用 **********
function debugLog(title, text, color) {
  if (LOGFLAG) {
  } else {
    return
  }
}
///*************** コピーボタン処理 ***************
document.getElementById('copy_done').style.visibility = 'hidden'

function copyToClipboard() {
  var copyTarget = document.getElementById('info_invite_url')
  var copy_done = document.getElementById('copy_done')
  $('#info_copy').prop('disabled', true)
  copy_done.style.visibility = 'visible'
  copyTarget.select()
  document.execCommand('Copy')
  window.setTimeout(function () {
    copy_done.style.visibility = 'hidden'
    $('#info_copy').prop('disabled', false)
  }, 60000)
  //選択解除
  var selection = getSelection()
  selection.empty()
}

///*************** スクロールを最後にする ***************
function scrollControl(element, kind, scrollToY = 0) {
  switch (kind) {
    case 'end':
      element.scrollTop = element.scrollHeight - element.clientHeight
      element.scrollTop = element.scrollHeight
      element.scrollTo(0, element.scrollHeight)
      break
    case 'loadMore':
      element.scrollTo(0, scrollToY)
      break
  }
}

///*************** 2桁の数字にする ***************
function addDigit(num) {
  // 桁数が1桁だったら先頭に0を加えて2桁に調整する
  var ret
  if (num < 10) {
    ret = '0' + num
  } else {
    ret = num
  }
  return ret
}

//カウント表示
function dateTimeDisplay() {
  var dateTime = new Date()
  // var year = dateTime.getFullYear()
  // var month = dateTime.getMonth() + 1
  // var day = dateTime.getDate()
  // var hour = addDigit(dateTime.getHours())
  // var min = addDigit(dateTime.getMinutes())
  var msg

  var st = Date.parse(startTime.replace(/-/g, '/'))
  var et = Date.parse(endTime.replace(/-/g, '/'))
  //日本時刻との時差計算
  var timeDiff = dateTime.getTimezoneOffset() + 540

  if (languageType % 2 == 1) {
    moment.locale('ja')

    msg = `${moment(new Date(dateTime), 'YYYY-MM-DD HH:mm:ss')
      .tz('Asia/Tokyo')
      .format('MMMMDo HH:mm')}（日本時間）`
    // msg = year + '/' + month + '/' + day + ' ' + hour + ':' + min
  } else {
    moment.locale('en')

    msg = `${moment(new Date(dateTime), 'YYYY-MM-DD HH:mm:ss')
      .tz('Asia/Tokyo')
      .format('MMM. DD HH:mm')} (JP time)`
  }

  var timeElement = document.getElementById('DateTimeDisplay')
  if (timeElement.textContent != msg) {
    timeElement.innerHTML = msg
  }

  //予約時間外 + 強制退室時刻以降
  if (!isStart && dateTime >= startDate && endDate >= dateTime) {
    isStart = true
    $('#lesson_start').prop('disabled', false)
    var beforeList = document.getElementsByClassName('time-before')

    if (dateTime.getTime() >= startDate.getTime() + beforeTime * 60 * 1000) {
      while (beforeList.length) {
        beforeList.item(0).remove()
      }

      var remaining = document.getElementsByClassName('remaining')
      var remainingList = document.getElementsByClassName('time-remaining')
      for (let i = 0; i < remaining.length; i++) {
        if (
          languageType % 2 == 1 &&
          remaining[i].className.indexOf('jp') != -1
        ) {
          $(remaining[i]).show()
        }
        if (
          languageType % 2 == 0 &&
          remaining[i].className.indexOf('en') != -1
        ) {
          $(remaining[i]).show()
        }

        if (
          languageType % 2 == 1 &&
          remainingList[i].className.indexOf('jp') != -1
        ) {
          $(remainingList[i]).show()
        }
        if (
          languageType % 2 == 0 &&
          remainingList[i].className.indexOf('en') != -1
        ) {
          $(remainingList[i]).show()
        }
      }
    }
    $('#lesson_start').on('click', function () {
      start()
    })
  }

  // 開始時間内
  if (isStart && !isExit) {
    var time = Math.max(endDate - dateTime, 0)
    var remainingTime = Math.ceil(time / 60 / 1000) //切り上げ
    remainingTime = Math.min(remainingTime, 14400000)
    if (remainingTime == 14400000) {
      remainingTime = '----'
    }
    var remaining = document.getElementsByClassName('remaining')
    var remainingList = document.getElementsByClassName('time-remaining')

    if (dateTime.getTime() >= startDate.getTime() + beforeTime * 60 * 1000) {
      $('#time-view').text(remainingTime)

      var beforeList = document.getElementsByClassName('time-before')
      while (beforeList.length) {
        beforeList.item(0).remove()
      }

      for (let i = 0; i < remaining.length; i++) {
        if (
          languageType % 2 == 1 &&
          remaining[i].className.indexOf('jp') != -1
        ) {
          $(remaining[i]).show()
        }
        if (
          languageType % 2 == 0 &&
          remaining[i].className.indexOf('en') != -1
        ) {
          $(remaining[i]).show()
        }

        if (
          languageType % 2 == 1 &&
          remainingList[i].className.indexOf('jp') != -1
        ) {
          $(remainingList[i]).show()
        }
        if (
          languageType % 2 == 0 &&
          remainingList[i].className.indexOf('en') != -1
        ) {
          $(remainingList[i]).show()
        }
      }
    } else {
      // $('#time-view').text(getTimeText(new Date(st - timeDiff * 60 * 1000)))
      if (languageType % 2 == 1) {
        moment.locale('ja')
        $('#time-view').text(
          `${moment(new Date(st - timeDiff * 60 * 1000), 'YYYY-MM-DD HH:mm:ss')
            .tz('Asia/Tokyo')
            .format('MMMMDo HH:mm')}（日本時間）`
        )
      } else {
        moment.locale('en')
        $('#time-view').text(
          `${moment(new Date(st - timeDiff * 60 * 1000), 'YYYY-MM-DD HH:mm:ss')
            .tz('Asia/Tokyo')
            .format('MMM. DD HH:mm')} (JP time)`
        )
      }
    }
  }
  //終了時刻内
  if (!isExit && endDate <= dateTime) {
    if (isStart) {
      $('.lessonend-modal').fadeIn(FADE_SPEED)
      isStart = false
    }
    var time = endDate - dateTime
    var remainingTime = Math.ceil(time / 60 / 1000) //切り上げ
    remainingTime = Math.min(remainingTime, 14400000)
    $('#time-view').text(remainingTime)
  }

  //利用時間を過ぎた場合
  if (!isExit && waitDate <= dateTime) {
    isExit = true
    $('#time-view').text('00:00')
    clearInterval(lessonTimerID)
    if (converterDone(Converter.disconnect)) {
      if (vsWebRTCClient && vsWebRTCClient.isConnected()) {
        Converter.disconnect()
      }
    }
    $('#restart').hide()
    //exitView();
    endView()
    $('.lessonend-modal').fadeOut(FADE_SPEED)
    logoutRoom()
  }
}

function converterDone(method) {
  if (typeof method == 'function') {
    return true
  } else {
    debugLog('関数実行', '関数は設定されていませんでした。', 'red')
    return false
  }
}
/*********************************************
 *                ホワイトボード
 *********************************************/
function setMode(type) {
  toolModeCanvas = type
  switch (type) {
    case 'pen':
      board.setMode(BoardConfig.MODE_PEN)
      break
    case 'cursor':
      board.setMode(BoardConfig.MODE_MOUSE)
      break
    case 'eraser':
      board.setMode(BoardConfig.MODE_ERASER)
      break
    case 'text':
      board.setMode(BoardConfig.MODE_TEXT)
      break
    case 'swipe':
      board.setMode(BoardConfig.MODE_SWIPE)
      break
  }
}

function setPenColor(color) {
  switch (color) {
    case 'black':
      board.setDrawContextStrokeStyle(BoardConfig.STROKE_STRIKE_BLACK, true)
      break
    case 'red':
      board.setDrawContextStrokeStyle(BoardConfig.STROKE_STRIKE_RED, true)
      break
    case 'green':
      board.setDrawContextStrokeStyle(BoardConfig.STROKE_STRIKE_GREEN, true)
      break
    case 'blue':
      board.setDrawContextStrokeStyle(BoardConfig.STROKE_STRIKE_BLUE, true)
      break
  }
}

function setPenWidth(width) {
  board.setDrawContextLineWidth(width, true)
}

function setTextColor(color) {
  switch (color) {
    case 'black':
      board.setDrawContextTextColor(BoardConfig.STROKE_STRIKE_BLACK, true)
      break
    case 'red':
      board.setDrawContextTextColor(BoardConfig.STROKE_STRIKE_RED, true)
      break
    case 'green':
      board.setDrawContextTextColor(BoardConfig.STROKE_STRIKE_GREEN, true)
      break
    case 'blue':
      board.setDrawContextTextColor(BoardConfig.STROKE_STRIKE_BLUE, true)
      break
  }
}

function setCanvasColor(color) {
  setTextColor(color)
  setPenColor(color)
}

function setTextSize(width) {
  board.setDrawContextTextSize(width, true)
}

function resetCanvas() {
  canvas_ratio = 1.414
  //setAllCanvasRatio()
  setAllCanvasSize(840, 1188)
  var localCanvasd = document.getElementById('remoteDrawCanvas')
  var remoteCanvasd = document.getElementById('localDrawCanvas')
  if (localCanvasd && remoteCanvasd) {
    var localCanvasdc = localCanvasd.getContext('2d')
    var remoteCanvasdc = remoteCanvasd.getContext('2d')
    localCanvasdc.clearRect(0, 0, localCanvasd.width, localCanvasd.height)
    remoteCanvasdc.clearRect(0, 0, remoteCanvasd.width, remoteCanvasd.height)
    document.getElementById('draw_parent').scrollTo(0, 0)
    $('#draw').width('100%')
    $('#draw').height($('#draw').width() * canvas_ratio)
    board.setDefaultDrawWidth($('#draw').width())
    board.resetScale()
  }
}

function resetBackCanvas() {
  var bgCanvas = document.getElementById('backgroundCanvas')
  if (bgCanvas) {
    var canvasContext = bgCanvas.getContext('2d')
    canvasContext.clearRect(0, 0, bgCanvas.width, bgCanvas.height)
  }
}

function resetCanvasData(recvnumPages) {
  canvasData_recvlocal = new Array(recvnumPages)
  canvasData_recvremote = new Array(recvnumPages)
  cumulativesum_pdf = 0
  cumulativesum_recvlocal = 0
  cumulativesum_recvremote = 0
  for (var i = 1; i <= recvnumPages; i++) {
    cumulativesum_pdf += i
  }
}

$('#download-textbook').on('click', () => {
  let loading = document.querySelector('.loadingDownloadSaveIcon')
  let loadingjp = document.querySelector('.loadingDownloadSaveIconjp')
  let loadingText = document.querySelector('.loadingDownloadSaveIconText')
  let loadingjpText = document.querySelector('.loadingDownloadSaveIconjpText')
  let iconDownload = document.getElementById('save-icon')
  let iconDownloadJP = document.getElementById('save-icon-jp')
  let btn = document.getElementById('download-whiteboard')
  let btnText = document.getElementById('download-textbook')

  iconDownload.style.display = 'none'
  iconDownloadJP.style.display = 'none'

  loading.style.display = 'initial'
  loadingjp.style.display = 'initial'

  loadingText.style.display = 'initial'
  loadingjpText.style.display = 'initial'

  btn.style.pointerEvents = 'none'
  btnText.style.pointerEvents = 'none'

  if (!isChatShare) {
    setTimeout(() => {
      loading.style.display = 'none'
      loadingjp.style.display = 'none'
      loadingText.style.display = 'none'
      loadingjpText.style.display = 'none'
      btn.style.pointerEvents = 'initial'
      btnText.style.pointerEvents = 'initial'
      iconDownload.style.display = 'initial'
      iconDownloadJP.style.display = 'initial'
    }, 2000)
    if (isMobile()) {
      // const pdfLink = `${URL_LESSON_ROOM}/material/textbook/file?file_type=pdf&file_name=${
      //   fileNameTextbook
      //     .slice(10)
      //     .trim()
      //     .replaceAll(/[\s/\\?%*:|"<>]/g, '_') + '_Eigox'
      // }&param=${textbookPDF.split('param=')[1]}`
      const pdfLinkZIP = `${URL_LESSON_ROOM}/material/textbook/zip-file?file_type=pdf&file_name=${
        fileNameTextbook
          .slice(10)
          .trim()
          .replaceAll(/[\s/\\?%*:|"<>]/g, '_') + '_Eigox'
      }&param=${textbookPDF.split('param=')[1]}`
      if ((isIpad() || isIOS()) && isSafari()) {
        if (isChromeIOS()) {
          let dl = document.createElement('a')
          dl.href = pdfLinkZIP
          dl.click()
        } else {
          setTimeout(() => {
            let pdfWindow = window.open(pdfLinkZIP)
            pdfWindow.location.replace(pdfLinkZIP)
          }, 100)
        }
      } else {
        let dl = document.createElement('a')
        // dl.target = '_blank'
        dl.href = pdfLinkZIP
        dl.click()
      }
    } else {
      let UrlTextBook = `${URL_LESSON_ROOM}/material/textbook/file?file_type=pdf&file_name=${
        fileNameTextbook
          .slice(10)
          .trim()
          .replaceAll(/[\s/\\?%*:|"<>]/g, '_') + '_Eigox'
      }&param=${textbookPDF.split('param=')[1]}`

      // window.open(UrlTextBook)
      downloadByOpenNewTab(UrlTextBook)
    }

    // dl.download = fileNameTextbook.slice(10).replaceAll(' ', '_') + '_Eigox'
    // console.log(fileNameTextbook.slice(10))
  } else {
    saveCanvas()
    setTimeout(() => {
      loading.style.display = 'none'
      loadingjp.style.display = 'none'
      loadingText.style.display = 'none'
      loadingjpText.style.display = 'none'
      btn.style.pointerEvents = 'initial'
      btnText.style.pointerEvents = 'initial'
      iconDownload.style.display = 'initial'
      iconDownloadJP.style.display = 'initial'
    }, 2000)
  }
})

function saveCanvas() {
  var loading = document.querySelector('.loadingDownloadSaveIcon')
  var loadingjp = document.querySelector('.loadingDownloadSaveIconjp')
  var loadingText = document.querySelector('.loadingDownloadSaveIconText')
  var loadingjpText = document.querySelector('.loadingDownloadSaveIconjpText')
  let iconDownloadDraw = document.getElementById('save-icon-draw')
  let iconDownloadDrawJP = document.getElementById('save-icon-draw-jp')
  var btn = document.getElementById('download-whiteboard')
  var btnText = document.getElementById('download-textbook')

  iconDownloadDraw.style.display = 'none'
  iconDownloadDrawJP.style.display = 'none'

  loading.style.display = 'initial'
  loadingjp.style.display = 'initial'

  loadingText.style.display = 'initial'
  loadingjpText.style.display = 'initial'
  var dl = document.createElement('a')
  board.save(dl)
  btn.style.pointerEvents = 'none'
  btnText.style.pointerEvents = 'none'

  setTimeout(() => {
    loading.style.display = 'none'
    loadingjp.style.display = 'none'
    loadingText.style.display = 'none'
    loadingjpText.style.display = 'none'
    btn.style.pointerEvents = 'initial'
    btnText.style.pointerEvents = 'initial'
    iconDownloadDraw.style.display = 'initial'
    iconDownloadDrawJP.style.display = 'initial'
  }, 2000)
}

function backTextbook() {
  nextmode = 3
  // $('.backTextbook-modal').fadeIn(FADE_SPEED)
  textbookChannel = 'listTextBook'

  resetTextbookList()

  showBackTextbook(false)
  $('#draw_component').hide()
  $('#materialSelect-contents').show()
  $('#material-content').hide()
  $('#material-list').show()
  $('#toggle-textshare').prop('checked', false)

  if (isMobile()) {
    $('.material-container').css({ 'z-index': 1 })
  }
  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        titleEN: titleEN,
        titleJA: titleJA,
        categoryId,
        channel: 'backtoListTextBook'
      }),
      false,
      'device'
    )
  }

  getDataTextBookList(categoryId, titleEN, titleJA)
}
$('#backTextbook_accept').on('click', function () {
  textbookChannel = 'listTextBook'
  resetTextbookList()
  showBackTextbook(false)
  $('#draw_component').hide()
  $('#materialSelect-contents').show()
  $('#material-content').hide()
  $('#material-list').show()
  $('#toggle-textshare').prop('checked', false)
  if (isMobile()) {
    $('.material-container').css({ 'z-index': 1 })
  }
  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        titleEN: titleEN,
        titleJA: titleJA,
        categoryId,
        channel: 'backtoListTextBook'
      }),
      false,
      'device'
    )
  }
  getDataTextBookList(categoryId, titleEN, titleJA)
})
$('#backTextbook_reject').on('click', function () {
  // 教材拒否
  rejectChangeView()
  $('.backTextbook-modal').fadeOut(FADE_SPEED)
  return false
})
$('.backTextbook-modal-close').on('click', function () {
  $('.backTextbook-modal').fadeOut(FADE_SPEED)
  return false
})

function fullScreen() {
  var video = document.getElementById('share_video')
  if (video.requestFullscreen) {
    video.requestFullscreen()
  } else if (video.webkitRequestFullscreen) {
    video.webkitRequestFullscreen()
  } else if (video.mozRequestFullScreen) {
    video.mozRequestFullScreen()
  } else if (video.msRequestFullscreen) {
    video.msRequestFullscreen()
  }
}

//fullscreen-Event
document.onfullscreenchange =
  document.onmozfullscreenchange =
  document.onwebkitfullscreenchange =
  document.onmsfullscreenchange =
    function (event) {
      if (document.fullscreenElement) {
        //enter fullscreen
        debugLog('fullScreen Event', '全画面にしました。', 'blue')
        if (isIOS() && isSafari()) {
          $('#toggle-fullscreenpartner').parent().hide()
        }
      } else {
        // exit fullscreen
        debugLog('fullScreen Event', '通常画面にしました。', 'blue')
        if ($('#toggle-fullshare').prop('checked')) {
          $('#toggle-fullshare').prop('checked', false)
          if (isIOS() && isSafari()) {
            $('#toggle-fullshare').parent().show()
          }
        }
        if ($('#toggle-fullscreenpartner').prop('checked')) {
          $('#toggle-fullscreenpartner').prop('checked', false)
          if (isIOS() && isSafari()) {
            $('#toggle-fullscreenpartner').parent().show()
          }
        }
      }
    }

/*********************************************
 *                Converter
 *********************************************/
function Converter() {
  ;(this.start = function () {
    this.init(nickName)
  }),
    (this.getCameraDeviceId = function () {
      return deviceCameraId
    }),
    (this.getMicDeviceId = function () {
      return deviceMicId
    }),
    (this.getMicStatus = function () {
      return useMic
    }),
    (this.getCameraStatus = function () {
      return useCamera
    }),
    (this.makeVideoElement = function (stream) {
      deviceStream = stream.clone()
      createVideoElement(stream, nickName, nickName, useMic, useCamera, true)
    }),
    (this.endScreenShare = function () {
      if (displayScreenVideo || displayScreenAudio) {
        debugLog('画面共有', '映像の共有が終了しました。', 'orange')
        Converter.makeStream(['video'])
        displayScreenVideo = false
        displayScreenAudio = false
        $('#share_screen').text('画面共有')
        Converter.sendShareEnd()
      }
    }),
    (this.changeScreenShareSuccess = function (kind) {
      if (kind == 'video') {
        displayScreenVideo = true
      }
      if (kind == 'audio') {
        displayScreenAudio = true
      }
      $('#share_screen').text('終了')
      $('.share-modal').fadeOut(FADE_SPEED)
      Converter.sendShareStart(nickName)
      spotUser = nickName
    }),
    (this.changeWhiteboard = function () {
      //キャンバスの表示
      var targetElement = document.getElementById('stream-contents')
      var wtemplate = document.getElementById('whiteboard_template')
      var wclone = wtemplate.content.cloneNode(true)
      var canvas = wclone.querySelector('#draw_component')
      targetElement.appendChild(canvas)
      $('#video-contents').hide()
      //$(peintElement).show();
      isWhiteboard = true
      // 追加
      // var canvasElementList = []
      // canvasElementList.push(document.getElementById('remoteDrawCanvas'))
      // canvasElementList.push(document.getElementById('localDrawCanvas'))
      // canvasElementList.push(document.getElementById('localPointerCanvas'))
      // canvasElementList.push(document.getElementById('remotePointerCanvas'))
      // canvasElementList.push(document.getElementById('backgroundCanvas'))
      // canvasElementList.forEach(function (element) {
      //   setCanvasSize(element, 840, 1188)
      // })
      // var canvasElement = document.getElementById('remoteDrawCanvas')
      // var canvasContext = canvasElementList[4].getContext('2d')

      hideButtonPrevNext()
      var img = new Image()
      img.onload = myImageOnload
      // img.addEventListener(
      //   'load',
      //   function () {
      //     canvas_ratio = img.height / img.width
      //     //setAllCanvasRatio()
      //     setAllCanvasSize(img.width, img.height)
      //     $('#draw').height($('#draw').width() * canvas_ratio)
      //     var scale = canvasElement.width / img.naturalWidth
      //     board.setMinScale(scale)
      //     // if (img.naturalHeight * scale > canvasElement.height) {
      //     //   scale = canvasElement.height / img.naturalHeight
      //     // }
      //     canvasContext.fillStyle = 'rgb(127, 127, 127)'
      //     canvasContext.fillRect(
      //       0,
      //       0,
      //       canvasElement.width,
      //       canvasElement.height
      //     )
      //     canvasContext.drawImage(
      //       img,
      //       0,
      //       0,
      //       img.naturalWidth,
      //       img.naturalHeight
      //     )

      //     initBoard()
      //   },
      //   false
      // )
      img.src = 'pdf/test_0.png'
      // old_width = canvasElement.width
      // old_height = canvasElement.height
      //initBoard();
      displayChat = false
      displayMember = false
      displayPaint = true
      sideContentsView()
    }),
    (this.endWhiteboard = function () {
      //フラグ解除
      //キャンバス要素を追加する。
      var canvas = document.getElementById('draw_parent')
      isWhiteboard = false
      canvas.remove()
    }),
    (this.changeScreenShareFail = function () {
      debugLog('画面共有', '画面共有に失敗しました。', 'orange')
    }),
    (this.getMyUserName = function () {
      return nickName
    }),
    (this.getRoomName = function () {
      return roomName
    }),
    (this.getSpotUser = function () {
      return spotUser
    }),
    (this.changeRemoteStream = function (name, stream) {
      var result = Object.keys(member).find(function (key) {
        return member[key]['name'] == name
      })
      if (result == undefined) {
        //デバイスセッション ----------
        $('#remoteName').text(name)
        remoteStream = stream
        addMember(name)
        createVideoElement(stream, name, name, false, false, false)
      } else {
        //画面共有セッション ----------
        var targetElement = document.getElementById('share_video')
        vsWebRTCClient.showStream(targetElement, stream)
        remoteStream = stream
      }
    }),
    (this.recvChat = function (name, message, time, chatId) {
      createChatBubble(name, message, time, false, chatId)
    }),
    (this.recvChatFile = function (name, fileName, time, chatId, fileLink) {
      createFileBubble(name, fileName, time, chatId, false, fileLink)
    }),
    (this.recvRecorBubble = function (name, message, time) {
      createRecordBubble(name, message, time)
    }),
    (this.recvDeleteBubble = function () {
      createDeletedBubble()
    }),
    (this.recvInfo = function (name, type, time) {
      createInfoBubble(name, type, time, false)
    }),
    (this.removeChat = function (chatId) {
      removeChat(chatId)
    }),
    (this.startShareScreen = function (name) {
      spotUser = name
      viewType = 3
    }),
    (this.endShareScreen = function () {
      spotUser = undefined
    }),
    (this.changeStatus = function (name, micstatus) {
      changeMicState(name, micstatus)
    }),
    (this.changeCamStatus = function (name, camerastatus) {
      changeCameraState(name, camerastatus)
    }),
    (this.changeRecordStatus = function (name, recordstatus) {
      changeRecordState(name, recordstatus)
    }),
    (this.changeVolumn = function (name, volume) {
      gainNode.gain.value = volume / 100
    }),
    (this.createAudioGraph = function (stream) {
      createAudioGraph(stream)
    }),
    (this.leave = function (name) {
      remoteStream = undefined
      $partner = undefined
      removeMember(name)
      createInfoBubble(name, 'exit', undefined, false)
    }),
    (this.setStart = function (init, connect) {
      this.init = init //接続前の設定(名前を指定する)
      this.makeStream = makeStream //ストリームの作成
      this.connect = connect //接続
    }),
    (this.setStream = function (
      loadedStream,
      changeTrack,
      pauseTrack,
      resumeTrack,
      stopTrack
    ) {
      this.loadedStream = loadedStream // 読み込み完了時の動作
      this.changeTrack = changeTrack //トラックの変更
      this.pauseTrack = pauseTrack //トラックの一時停止
      this.resumeTrack = resumeTrack //トラックの再開
      this.stopTrack = stopTrack //トラックの停止
      this.getLocalStream = getLocalStream //ストリームの取得(音声グラフ用)
    }),
    (this.setShare = function (changeScreenShare) {
      this.changeScreenShare = changeScreenShare //画面共有開始
    }),
    (this.setChat = function (
      sendChat,
      sendStatus,
      sendCameraStatus,
      sendRecordStatus,
      sendVolumn,
      sendShareStart,
      sendShareEnd
    ) {
      this.sendChat = sendChat // チャットの送信
      this.sendStatus = sendStatus // マイク・カメラアイコンを変更
      this.sendCameraStatus = sendCameraStatus // Camera status
      this.sendRecordStatus = sendRecordStatus // Record status
      this.sendVolumn = sendVolumn // 音量の変更
      this.sendShareStart = sendShareStart //画面共有開始通知
      this.sendShareEnd = sendShareEnd //画面共有終了通知
    }),
    (this.setEnd = function (disconnect) {
      this.disconnect = disconnect // 切断
    })
}

/*********************************************
 *                    API
 *********************************************/
function getRoom(roomId) {
  var data = JSON.stringify({
    room_id: roomId
  })
  fetch(`${URL_LESSON_ROOM}/room_info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var result = JSON.stringify(data1)
      var parsed = JSON.parse(result)
      roomId = parsed.room_id
      startTime = parsed.start_time
      endTime = parsed.end_time
      if (parsed.result == 0) {
        getSettingInfo()
      } else {
        endView()
      }
    })
    .catch(function (err1) {
      endView()
    })
}

function getSettingInfo() {
  fetch(`${URL_LESSON_ROOM}/room_config_info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  })
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var result = JSON.stringify(data1)
      var parsed = JSON.parse(result)
      if (parsed.result == 0) {
        beforeTime = parsed.before_time
        afterTime = parsed.after_time
        checkTime()
      } else {
        endView()
      }
    })
    .catch(function (err1) {
      endView()
    })
}

function loginRoom() {
  // var dateTime = new Date()
  // var year = dateTime.getFullYear()
  // var month = addDigit(dateTime.getMonth() + 1)
  // var day = addDigit(dateTime.getDate())
  // var hour = addDigit(dateTime.getHours())
  // var min = addDigit(dateTime.getMinutes())
  // var nowTime = year + '/' + month + '/' + day + ' ' + hour + ':' + min
  var data = JSON.stringify({
    room_id: roomName,
    user_name: nickName,
    start_time: getTimeData(),
    version: VERSION
  })
  fetch(`${URL_LESSON_ROOM}/log_register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var result = JSON.stringify(data1)
      var parsed = JSON.parse(result)
    })
    .catch(function (err1) {})
}

function logoutRoomV2(nameUser) {
  // var dateTime = new Date()
  // var year = dateTime.getFullYear()
  // var month = addDigit(dateTime.getMonth() + 1)
  // var day = addDigit(dateTime.getDate())
  // var hour = addDigit(dateTime.getHours())
  // var min = addDigit(dateTime.getMinutes())
  // var nowTime = year + '/' + month + '/' + day + ' ' + hour + ':' + min
  var data = JSON.stringify({
    room_id: roomName,
    user_name: nameUser,
    end_time: getTimeData(),
    version: VERSION
  })
  fetch(`${URL_LESSON_ROOM}/log_register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var result = JSON.stringify(data1)
      var parsed = JSON.parse(result)
    })
    .catch(function (err1) {})
}

function logoutLog() {
  const body = new FormData()
  body.append('room_id', roomName)
  body.append('user_name', nickName)
  body.append('end_time', getTimeData())
  body.append('version', VERSION)

  navigator.sendBeacon(`${URL_LESSON_ROOM}/log_register`, body)
  // scrollControl(document.getElementById('chat-area'), 'end')
}

function logoutRoom() {
  // var dateTime = new Date()
  // var year = dateTime.getFullYear()
  // var month = addDigit(dateTime.getMonth() + 1)
  // var day = addDigit(dateTime.getDate())
  // var hour = addDigit(dateTime.getHours())
  // var min = addDigit(dateTime.getMinutes())
  // var nowTime = year + '/' + month + '/' + day + ' ' + hour + ':' + min
  var data = JSON.stringify({
    room_id: roomName,
    user_name: nickName,
    end_time: getTimeData(),
    version: VERSION
  })
  fetch(`${URL_LESSON_ROOM}/log_register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var result = JSON.stringify(data1)
      var parsed = JSON.parse(result)
    })
    .catch(function (err1) {})
}

//ノート復元
function noteRecovery() {
  var targetText = document.getElementById('editor').innerHTML
  sendMessage(targetText)
}

async function chatRegisterAwait(type, newdata, join, name) {
  showLoadingChat('bottom')
  var data = {
    room_id: roomName,
    username: name
  }
  switch (type) {
    case 1:
      data.start_time = newdata
      break
    case 2:
      data.end_time = newdata
      break
  }
  var data = JSON.stringify(data)
  await fetch(`${URL_LESSON_ROOM}/chatregister`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var json = JSON.stringify(data1)
      var parsed = JSON.parse(json)
      scrollControl(document.getElementById('chat-area'), 'end')
      removeLoadingChat()
      if (parsed.result == 0) {
        //正常な処理
        debugLog('chatRegister', 'Done', 'orange')
      } else {
        errorLog(parsed.error_code, parsed.error_message['room_id'])
      }
    })
    .catch(function (e) {
      removeLoadingChat()

      debugLog('chatRegister', 'error!', 'red')
    })
}

//チャット履歴
function chatRegister(type, newdata, join, name) {
  showLoadingChat('bottom')

  var data = {
    room_id: roomName,
    username: name
  }
  switch (type) {
    case 1:
      data.start_time = newdata
      break
    case 2:
      data.end_time = newdata
      break
  }
  var data = JSON.stringify(data)
  fetch(`${URL_LESSON_ROOM}/chatregister`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var json = JSON.stringify(data1)
      var parsed = JSON.parse(json)
      scrollControl(document.getElementById('chat-area'), 'end')
      removeLoadingChat()
      if (parsed.result == 0) {
        //正常な処理
        debugLog('chatRegister', 'Done', 'orange')
      } else {
        errorLog(parsed.error_code, parsed.error_message['room_id'])
      }
    })
    .catch(function (e) {
      removeLoadingChat()

      debugLog('chatRegister', 'error!', 'red')
    })
}

//チャット履歴
async function chatRecovery(limit = 30, IsloadMore = false) {
  // showLoadingChat('top')
  var data = JSON.stringify({
    room_id: roomName,
    limit
  })
  return await fetch(`${URL_LESSON_ROOM}/chatrecovery/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      document.getElementById('chat-area').innerHTML = ''
      var json = JSON.stringify(data1)
      var parsed = JSON.parse(json)
      if (parsed.result == 0) {
        //正常な処理
        const forLoop = async () => {
          for (let index = 0; index < parsed.chat_histories.length; index++) {
            // Get num of each fruit
            var histories = parsed.chat_histories[index]
            var startData = histories.start_time
            var endData = histories.end_time
            var messageData = histories.message
            var fileLink = histories.file_link
            var fileName = histories.file_name
            var allowedExtensions = /(\.pdf|\.jpeg|\.jpg|\.png)$/i
            //開始の場合
            if (startData && !endData && !messageData) {
              // if (histories.username.split('-')[1] === 'true') {
              createInfoBubble(
                histories.username,
                'join',
                histories.created_at,
                false,
                histories.id
              )
              // }
            } else if (startData && !endData && messageData == 'start') {
              createRecordBubble(
                histories.username,
                'start',
                histories.created_at
              )
            } else if (startData && !endData && messageData == 'stop') {
              createRecordBubble(
                histories.username,
                'stop',
                histories.created_at
              )
            } else if (
              !messageData &&
              fileLink &&
              !allowedExtensions.exec(fileName)
            ) {
              if (histories.deleted_at)
                createChatBubble(
                  histories.username,
                  languageType % 2 == 1
                    ? '--- 削除済み ---'
                    : '--- deleted ---',
                  histories.created_at,
                  false,
                  histories.id,
                  true
                )
              else
                createFileBubble(
                  histories.username,
                  fileName,
                  histories.created_at,
                  histories.id,
                  false,
                  fileLink
                )
            } else if (
              !messageData &&
              fileLink &&
              allowedExtensions.exec(fileName)
            ) {
              if (histories.deleted_at) {
                createChatBubble(
                  histories.username,
                  languageType % 2 == 1
                    ? '--- 削除済み ---'
                    : '--- deleted ---',
                  histories.created_at,
                  false,
                  histories.id,
                  true
                )
              } else {
                var idEl = histories.id
                var lastIndex = index - 1
                var beforeElementId = `chat_text_${parsed.chat_histories[lastIndex]?.id}`
                beforeElement = document.querySelector(
                  `[data-value="${beforeElementId}"]`
                )
                while (!beforeElement && lastIndex >= 0) {
                  lastIndex--
                  beforeElementId = `chat_text_${parsed.chat_histories[lastIndex]?.id}`
                  beforeElement = document.querySelector(
                    `[data-value="${beforeElementId}"]`
                  )
                }
                if (beforeElement) {
                  await showFileOnChatLoad(
                    idEl,
                    fileName,
                    // window.URL.createObjectURL(file),
                    histories.file_link,
                    histories.username == nickName ? true : false,
                    beforeElement,
                    histories.created_at,
                    histories.username,
                    IsloadMore
                  )
                }
              }
            } else {
              if (endData && !messageData) {
                createInfoBubble(
                  histories.username,
                  'exit',
                  histories.created_at,
                  false,
                  histories.id
                )
              } else {
                if (messageData) {
                  if (histories.deleted_at)
                    createChatBubble(
                      histories.username,
                      languageType % 2 == 1
                        ? '--- 削除済み ---'
                        : '--- deleted ---',
                      histories.created_at,
                      false,
                      histories.id,
                      true
                    )
                  else
                    createChatBubble(
                      histories.username,
                      messageData,
                      histories.created_at,
                      false,
                      histories.id,
                      false
                    )
                }
              }
            }
          }

          checkOnConnectSuccess = false
        }

        forLoop()
        debugLog('chatRecovery', 'Done', 'orange')
        // removeLoadingChat()
        if (limit <= 30) {
          setTimeout(() => {
            scrollControl(document.getElementById('chat-area'), 'end')
          }, 2000)
        }

        return {
          checkAllChat: parsed.count === parsed.chat_histories.length,
          countChat: parsed.count
        }
      } else {
        debugLog(
          'chatRecovery',
          'error! ' + parsed.error_message['room_id'],
          'red'
        )
        //errorLog(parsed.error_code, parsed.error_message["room_id"]);
        return false
      }
    })
    .catch(function (e) {
      removeLoadingChat()
      return false
    })
}

// unload API (sendBeacon) -> exit Event
function sendExitLog() {
  const body = new FormData()
  body.append('room_id', roomName)
  body.append('username', nickName)
  body.append('end_time', getTimeData())
  navigator.sendBeacon(`${URL_LESSON_ROOM}/chatregister`, body)
  // scrollControl(document.getElementById('chat-area'), 'end')
}
function recordingLog(status) {
  const body = new FormData()
  body.append('room_id', roomName)
  body.append('username', nickName)
  body.append('message', status)
  body.append('start_time', getTimeData())
  navigator.sendBeacon(`${URL_LESSON_ROOM}/chatregister`, body)
  scrollControl(document.getElementById('chat-area'), 'end')
}

/*********************************************
 *                   PDF
 *********************************************/
// start PDF
function initPDF() {
  // <script>タグを介してロードされ、PDF.jsエクスポートにアクセスするためのショートカットを作成します。
  var pdfjsLib = window['pdfjs-dist/build/pdf']
  // workerSrcプロパティを指定する
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'build/pdf.worker.js'
}

var waitID = 0 // 実行待機中のPDF処理
var taskID = 0 // 実行中のPDF処理
// create Textbook Select Image Element

// New function

// ******** CHANGE VIEW MODE
const listView = document.querySelector('#list-view')
const thumbnailView = document.querySelector('#thumbnail-view')
const materialList = document.querySelector('#material_list')
const materialParent = document.querySelector('#material_parent')
const materialColumn = document.querySelector('.material-column')
let viewMode = THUMBNAIL_VIEW
const categoriesObject = [
  { en: 'lesson', jp: '体験レッスン' },
  { en: 'everyday conversation', jp: '日常英会話' },
  { en: 'business English', jp: 'ビジネス英会話' },
  { en: 'news English', jp: '時事／ニュース英会話' },
  { en: 'drama English', jp: '映画／ドラマ英会話' },
  { en: 'travel English', jp: '旅行英会話' },
  { en: 'eiken measures', jp: '英検対策' },
  { en: 'common', jp: '全共通' },
  { en: 'nregistered', jp: '登録なし' }
]

// if (viewMode === LIST_VIEW) {
//   materialParent.style.height = 'calc(100% - 140px)'
//   materialColumn.style.display = 'block'
// } else {
//   materialParent.style.height = 'calc(100% - 100px)'
//   materialColumn.style.display = 'none'
// }

const changeListViewMode = () => {
  listView.classList.add('view-mode-active')
  thumbnailView.classList.remove('view-mode-active')
  materialParent.style.height = 'calc(100% - 140px)'
  viewMode = LIST_VIEW

  materialColumn.style.display = 'flex'
  materialList.classList.add('list-view-style')
  materialList.querySelectorAll('.text-book-item').forEach((item) => {
    item.classList.add('col-lg-12')
    item.querySelector('.name-column').classList.add('col-5')
    item.querySelector('.name-column').classList.remove('col-12')
    item.querySelector('.category-column').style.display = 'block'
    item.querySelector('.created-column').style.display = 'block'
  })
  // materialList.classList.remove('row')
}
const changeThumbnailViewMode = () => {
  listView.classList.remove('view-mode-active')
  thumbnailView.classList.add('view-mode-active')
  materialParent.style.height = 'calc(100% - 100px)'

  viewMode = THUMBNAIL_VIEW

  materialColumn.style.display = 'none'
  materialList.classList.remove('list-view-style')
  materialList.querySelectorAll('.text-book-item').forEach((item) => {
    item.classList.remove('col-lg-12')
    item.querySelector('.name-column').classList.remove('col-5')
    item.querySelector('.name-column').classList.add('col-12')
    item.querySelector('.category-column').style.display = 'none'
    item.querySelector('.created-column').style.display = 'none'
  })
  // materialList.classList.add('row')
}

// listView.addEventListener('click', changeListViewMode)
// thumbnailView.addEventListener('click', changeThumbnailViewMode)
// ***********************************************

function createImageElement(data, taskID, count) {
  var name
  if (languageType % 2 == 1) {
    name = '<div class="jp">' + data.name_ja + '</div>'
    name += '<div class="en" style="display: none">' + data.name_en + '</div>'
  } else {
    name = '<div class="jp" style="display: none">' + data.name_ja + '</div>'
    name += '<div class="en">' + data.name_en + '</div>'
  }

  var loadingTask = pdfjsLib.getDocument(data.teaching_materials)
  loadingTask.promise.then(function (pdf) {
    if (taskID !== viewPageNumber) {
      pdf = undefined
      return
    }
    //Dummy Canvas
    var canvas = document.createElement('canvas')

    // Page 1 Rendering To Canvas -> draw Image
    renderPage(canvas, pdf, 1, function pageRenderingComplete() {
      if (count != waitID) {
        return
      }
      var img = document.getElementById('img_div')

      const imgElement =
        `<img src='` +
        canvas.toDataURL() +
        `' style="width:100%;height:auto;" onclick="changeTextShareMode();drawImageOnCanvas(` +
        true +
        `);assignTextBook();" id="` +
        data.teaching_materials +
        `"></img>`

      let materialElement =
        viewMode === THUMBNAIL_VIEW
          ? `
         <div class="col-4 col-lg-2 text-book-item" style="display: flex;height: auto;justify-content: center;align-items: center;" data-img='` +
            canvas.toDataURL() +
            `' style="width:100%;height:auto;" onclick="changeTextShareMode();drawImageOnCanvas(` +
            true +
            `);assignTextBook();" id="` +
            data.teaching_materials +
            `">
         <div class="row" style="height:auto">
         <div class="col-12" style="height:fit-content">
         ${imgElement}
          </div>
          <div class="col-12 name-column" style="height:fit-content;">
           <div class="textname" style="height:auto">` +
            name +
            `</div>
           </div>

           <div class="col-5 category-column" style="height:fit-content;display: none;">
            <div class="textname" style="height:auto">` +
            data?.lesson_name +
            `</div>
            </div>
            <div class="col-2 created-column" style="height:fit-content;display: none;">
            <div class="textname" style="height:auto">` +
            data?.updated_at +
            `</div>
            </div>
           </div>
         </div>
         `
          : `
         <div class="col-4 col-lg-2 col-lg-12 text-book-item" style="cursor: pointer; display: flex;height: auto;justify-content: center;align-items: center;" data-img='` +
            canvas.toDataURL() +
            `' style="width:100%;height:auto;" onclick="changeTextShareMode();drawImageOnCanvas(` +
            true +
            `);assignTextBook();" id="` +
            data.teaching_materials +
            `">
         <div class="row " style="height:auto">
         <div class="col-12" style="height:fit-content">
         ${imgElement}
          </div>
          <div class="col-5 name-column" style="height:fit-content">
           <div class="textname" style="height:auto">` +
            name +
            `</div>
          </div>
          <div class="col-5 category-column" style="height:fit-content">
           <div class="textname" style="height:auto">` +
            data?.lesson_name +
            `</div>
          </div>
          <div class="col-2 created-column" style="height:fit-content">
           <div class="textname" style="height:auto">` +
            data?.updated_at +
            `</div>
          </div>

          </div>
         </div>
         `
      //if(document.getElementById("material_list").classList.contains(""))
      $(`#material_list`).append(materialElement)
    })
  })
}

function showBackTextbook(isBackTextbook) {
  if (isBackTextbook) {
    document.getElementById('backTextbook').style.display = 'flex'
  } else {
    document.getElementById('backTextbook').style.display = 'none'
  }
}

// function saveFileName() {
//   fileNameTextbook = event.currentTarget.getAttribute('data-filename')
//   fileNameTextbook = fileNameTextbook.slice(0, fileNameTextbook.length - 4)
// }

function changeTextShareMode() {
  // debugger
  // resetCanvas()
  // resetBackCanvas()
  // $('#toggle-textshare').prop('checked', true)
  // $('#toggle-textbook').prop('checked', true)
  // $('#toggle-board').prop('checked', false)
  // $('#toggle-chat').prop('checked', false)
  // videoContentsView(true)
  // $('#draw_component').show()
  // if (isMobile()) {
  //   $('#draw_component').css({ 'z-index': 1, position: 'absolute' })
  //   $('#stream-contents').css({ height: '100%' })
  //   $('#side-contents').css({ 'z-index': 0 })
  //   // $('#video-contents').css({ height: '40%' })
  // }
  // $('#video-contents').show()
  // $('#share-contents').hide()
  // $('#materialSelect-contents').hide()
  isChatShare = false
  resetCanvas()
  resetBackCanvas()
  nextmode = 5
  // modeChange(5)
  acceptChangeView(true)
}

async function renderPagePDF(canvas, pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber)
  //表示倍率
  var scale = 1.5
  //ビューポート
  var viewport = page.getViewport({
    scale: scale
  })
  var pageDisplayWidth = viewport.width
  var pageDisplayHeight = viewport.height
  //var pageDivHolder = document.createElement();
  // Prepare canvas using PDF page dimensions
  //var canvas = document.createElement(id);
  var context = canvas.getContext('2d')
  canvas.width = pageDisplayWidth
  canvas.height = pageDisplayHeight
  // pageDivHolder.appendChild(canvas);
  // Render PDF page into canvas context
  var renderContext = {
    canvasContext: context,
    viewport: viewport
  }
  await page.render(renderContext).promise
}

// (書き込むキャンバス, リザルトのpdf, ページ指定 ,レンダリング後の動作)
function renderPage(canvas, pdf, pageNumber, callback) {
  //ページの読み込み
  pdf.getPage(pageNumber).then(function (page) {
    //表示倍率
    var scale = 1.5
    //ビューポート
    var viewport = page.getViewport({
      scale: scale
    })
    var pageDisplayWidth = viewport.width
    var pageDisplayHeight = viewport.height
    //var pageDivHolder = document.createElement();
    // Prepare canvas using PDF page dimensions
    //var canvas = document.createElement(id);
    var context = canvas.getContext('2d')
    canvas.width = pageDisplayWidth
    canvas.height = pageDisplayHeight
    // pageDivHolder.appendChild(canvas);
    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    page.render(renderContext).promise.then(callback)
  })
}

/*
function loadPDF(url) {
  var loadingTask = pdfjsLib.getDocument(url);
  loadingTask.promise.then(function(pdf) {
    pdf.getPage(1).then(function(page) {
      var scale = 1.5;
      var viewport = page.getViewport({
        scale: scale,
      });
      var canvas = document.getElementById('backgroundCanvas');
      var context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      var renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);
    });
  });
}*/

function errorLog(code, text) {}
/*********************************************
 *             background edit
 *********************************************/
var isBackgroundEdit = false //トグルとは別に保持する

var canvasContext //キャンバス書き込み用
var editCanvas //キャンバス要素

const img = document.getElementById('image')

const localVideo = document.getElementById('localVideo')
const maskRadioGroup = document.getElementById('mask_radio_broup')

var TRANSPARENT_COLOR = {
  r: 0,
  g: 0,
  b: 0,
  a: 0
}

var BACKGROUND_COLOR = {
  r: 127,
  g: 127,
  b: 127,
  a: 255
}

// 回転検知
window.addEventListener('orientationchange', () => {
  window.addEventListener('resize', () => {
    resizeBoard(1000)

    changeSize()
  })
})

// ボタンに関するfunction
function viewEditModel() {
  if (document.getElementById('loader').style.visibility == 'visible') return
  $('.composition-modal').fadeIn(FADE_SPEED)
  if (isIOS() || isIpad() || isSafari() || !canUseBackground) {
    $('.overlay').css({ opacity: 0.3 })
    if (languageType % 2 == 0) {
      $('.no-support-bg').text(
        'This function is not supported on the current environment.'
      )
    } else {
      $('.no-support-bg').text(
        'この機能は使用されている環境ではサポートされていません。'
      )
    }
  } else {
    if ($('#toggle-camera').prop('checked')) {
      $('.overlay').css({ opacity: 0.3 })
      $('.no-support-bg').css({ display: 'block' })
      if (languageType % 2 == 0) {
        $('.no-support-bg').text('Please open your camera.')
      } else {
        $('.no-support-bg').text('カメラを起動してください。')
      }
    } else {
      $('.overlay').css({ opacity: 1 })
      $('.no-support-bg').css({ display: 'none' })
      // $('.no-support-bg').text('')
    }
    if (!continueAnimation) {
      backgroundEditInit()
    }
  }
}

$('.composition-modal-close').on('click', function () {
  $('.composition-modal').fadeOut(FADE_SPEED)
  var index = Number($('input[name=background-mode]:checked').val())
  if (index == 1) {
    $('#toggle-backgroundEdit').prop('checked', false)
    $('#toggle-subbackgroundEdit').prop('checked', false)
  }
  return false
})

var subVideo
let isLoadingBackground = false
$('input[name="background-mode"]:radio').change(async function () {
  var index = Number($('input[name=background-mode]:checked').val())
  switch (index) {
    case 0:
      isLoadingBackground = true
      document.getElementById('loading-background').style.visibility = 'visible'
      backgroundOff = false
      blurredEnabled = true
      virtualBackgroundEnabled = false
      vsWebRTCClient.createStreamWithBackgound(localVideo)
      document.getElementById('file-select').value = null
      $('#toggle-backgroundEdit').prop('checked', true)
      $('#toggle-subbackgroundEdit').prop('checked', true)
      break
    case 1: // 背景合成しない
      blurredEnabled = false
      virtualBackgroundEnabled = false
      document.getElementById('file-select').value = null
      backgroundOff = true
      changeVideoStream(vsWebRTCClient.getLocalStream('device'))
      vsWebRTCClient.stopStreamWithBackgound()
      $('#toggle-backgroundEdit').prop('checked', false)
      $('#toggle-subbackgroundEdit').prop('checked', false)
      break
    case 2: // サンプル画像
    case 3:
    case 4:
    case 5:
    case 6:
      isLoadingBackground = true
      document.getElementById('loading-background').style.visibility = 'visible'
      backgroundOff = false
      blurredEnabled = false
      virtualBackgroundEnabled = true
      document.getElementById('file-select').value = null
      selectedBackground = './bg/0' + (index - 1) + '.jpg'
      vsWebRTCClient.createStreamWithBackgound(localVideo)
      $('#toggle-backgroundEdit').prop('checked', true)
      $('#toggle-subbackgroundEdit').prop('checked', true)
      break
    case 7: // ファイル選択
      //setMask("room");
      $('#file-select').click() //-> file-select change
      $('input[name=background-mode]:checked')[0].checked = false

      break
  }
})

// ファイル選択処理
// ファイル選択処理
document
  .getElementById('file-select')
  .addEventListener('change', changeLocalImage, false)

function changeLocalImage(evt) {
  $('#toggle-backgroundEdit').prop('checked', true)
  $('#toggle-subbackgroundEdit').prop('checked', true)
  var file = evt.target.files[0]
  const maxSize = 5242880
  if (file.size > maxSize) {
    document.getElementById('file-select').value = null
    if (languageType === 0) {
      alert('Your file is too large. Maximum size is 5MB')
    } else {
      alert('ファイルサイズが大きすぎます。5MB以下にしてください。')
    }
    return
  }
  if (!continueAnimation) {
    backgroundEditInit()
  }
  var blobUrl = window.URL.createObjectURL(file)
  backgroundOff = false
  blurredEnabled = false
  virtualBackgroundEnabled = true
  selectedBackground = blobUrl
  createStreamWithBackgound(localVideo)
}

let continueAnimation = false
let isConnected = false

//背景合成開始
function backgroundEditInit() {
  if (
    typeof vsWebRTCClient !== 'undefined' &&
    typeof deviceStream !== 'undefined'
  ) {
    settingBackgroundEdit()
  } else {
    setTimeout(backgroundEditInit, 1000)
  }
}

function settingBackgroundEdit() {
  const localStream = vsWebRTCClient.getLocalStream('device')
  vsWebRTCClient.showStream(
    document.getElementById('previewVideo'),
    localStream
  )
  continueAnimation = true
}
var vectorlyFilter
var outputStream
var backgroundOff = true
var canUseBackground = true
async function checkSupportBackground() {
  const support = await vectorly.BackgroundFilter.isSupported()
  if (!support) return false
  if (
    support.gpu.tier == 0 ||
    support.gpu.hwaccel == false ||
    support.wasm == false
  )
    return false
  return true
}

function changeSize() {
  if (subVideo) {
    subVideo.height = subVideo?.videoHeight
    subVideo.width = subVideo?.videoWidth
  }
  if (editCanvas) {
    editCanvas.width = subVideo?.videoWidth
    editCanvas.height = subVideo?.videoHeight
  }
}

/*********************************************
 *                User Agent
 *********************************************/
function isIOS() {
  var ua = window.navigator.userAgent.toLowerCase()
  if (ua.indexOf('iphone') !== -1 || ua.indexOf('ipad') !== -1) {
    return true
  }
  return false
}

function isIpad() {
  var ua = window.navigator.userAgent.toLowerCase()
  const isAndroid = ua.indexOf('android') > -1
  if (
    ua.indexOf('ipad') !== -1 ||
    (window.innerWidth >= 768 &&
      window.innerWidth <= 1366 &&
      typeof window.orientation !== 'undefined' &&
      !isAndroid &&
      navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform))
  ) {
    return true
  }
  return false
}

function isMac() {
  var ua = window.navigator.userAgent.toLowerCase()
  if (ua.indexOf('mac os x') !== -1) {
    return true
  }
  return false
}

function isIpadScreen() {
  if (
    (window.innerWidth === 768 && window.innerHeight === 1024) ||
    (window.innerWidth === 1024 && window.innerHeight === 1366)
  ) {
    return true
  }
  return false
}
function isMobile() {
  var ua = window.navigator.userAgent.toLowerCase()
  if (
    ua.indexOf('iphone') > 0 ||
    ua.indexOf('ipod') > 0 ||
    (ua.indexOf('android') > 0 && ua.indexOf('mobile') > 0) ||
    ua.indexOf('ipad') > 0 ||
    ua.indexOf('android') > 0 ||
    typeof window.orientation !== 'undefined'
  ) {
    return true
  }
  return false
}

function isSafari() {
  var userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.indexOf('safari') != -1) {
    if (userAgent.indexOf('chrome') > -1) {
      return false
    } else {
      return true
    }
  }
  return false
}

function isChromeIOS() {
  if (
    /CriOS/i.test(navigator.userAgent) &&
    /iphone|ipod|ipad/i.test(navigator.userAgent)
  ) {
    return true
  } else {
    return false
  }
}

function isChrome() {
  var userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.indexOf('chrome') != -1) {
    return true
  }
  return false
}

function isIE() {
  var userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.indexOf('msie') != -1 || userAgent.indexOf('trident') != -1) {
    return true
  }
  return false
}

var isAdvancedUpload = function () {
  var div = document.createElement('div')
  return (
    ('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) &&
    'FormData' in window &&
    'FileReader' in window
  )
}

/* ---------- ドロップリストデモ ---------- */
$(function () {
  let gmenu = $('.gmenu')
  $(document).mouseup(function (e) {
    let settingBtn = $('#btn_varioussetting')
    let toggleSettingBtn = $('#toggle-varioussetting')

    // if the target of the click isn't the gmenu nor a descendant of the gmenu
    if (
      !gmenu.is(e.target) &&
      gmenu.has(e.target).length === 0 &&
      settingBtn.has(e.target).length === 0 &&
      !settingBtn.is(e.target)
    ) {
      gmenu.hide()
      toggleSettingBtn.prop('checked', false)
    }
  })

  $('#btn_varioussetting').on('click', (e) => {
    if (document.getElementById('loader').style.visibility == 'visible') return
    if (!$('#toggle-varioussetting').prop('checked')) {
      gmenu.show()
    } else {
      gmenu.hide()
    }
  })

  if (isMobile()) {
    $('.show-btn').css({ display: 'auto' })
  } else {
    $('.show-btn').css({ display: 'none' })
  }
  $('#toggle-chat').prop('checked', true)

  $('#multiple').multiselect({
    buttonTitle: function () {},
    enableHTML: true,
    includeSelectAllOption: true,
    // buttonWidth: 122,
    buttonText: function (options) {
      //オプションの文字
      if (options.length == 0) {
        //未選択の場合
        //          return 'None selected';
        return getNoneSelectText('カテゴリ', 'category')
      } else if (options.length > 1) {
        //選択数が3つ以上
        //          return options.length + ' selected';
        return options.length + ' つ選択中'
      } else {
        // その他
        var selected = ''
        options.each(function () {
          selected += $(this).text() + ', '
        })
        return getNoneSelectText(options.text(), options.attr('label'))
      }
    },
    optionLabel: function (element) {
      return getNoneSelectText($(element).text(), $(element).attr('label'))
    }
  })
  $('#multiple').change(function () {
    oldDropValue['category'] = $(this).val()
    oldDropValue['level'] = $('#multiple2').val()
    oldDropValue['age'] = $('#multiple3').val()
    getTeachingMaterial(createPDFElement)
  })
  $('#multiple2').change(function () {
    oldDropValue['category'] = $('#multiple').val()
    oldDropValue['level'] = $(this).val()
    oldDropValue['age'] = $('#multiple3').val()
    getTeachingMaterial(createPDFElement)
  })
  $('#multiple3').change(function () {
    oldDropValue['category'] = $('#multiple').val()
    oldDropValue['level'] = $('#multiple2').val()
    oldDropValue['age'] = $(this).val()
    getTeachingMaterial(createPDFElement)
  })
  $('#multiple2').multiselect({
    buttonTitle: function () {},
    enableHTML: true,
    includeSelectAllOption: true,
    // buttonWidth: 122,
    buttonText: function (options) {
      //オプションの文字
      if (options.length == 0) {
        //未選択の場合
        return getNoneSelectText('英語レベル', 'Level')
      } else if (options.length > 1) {
        //選択数が3つ以上
        if (languageType % 2 == 1) {
          return (
            '<div class="jp">' +
            options.length +
            ' つ選択中</div><div class="en" style="display: none">' +
            options.length +
            ' selects</div>'
          )
        } else {
          return (
            '<div class="jp" style="display: none">' +
            options.length +
            ' つ選択中</div><div class="en">' +
            options.length +
            ' selects</div>'
          )
        }
      } else {
        // その他
        var selected = ''
        options.each(function () {
          selected += $(this).text() + ', '
        })
        return getNoneSelectText(options.text(), options.attr('label'))
        // return selected.substr(0, selected.length - 2)
        //return selected.substr(0, selected.length -2);
      }
    },
    optionLabel: function (element) {
      return getNoneSelectText($(element).text(), $(element).attr('label'))
    }
  })
  $('#multiple3').multiselect({
    buttonTitle: function () {},
    enableHTML: true,
    includeSelectAllOption: true,
    buttonWidth: 120,
    buttonText: function (options) {
      //オプションの文字
      if (options.length == 0) {
        //未選択の場合
        return getNoneSelectText('対象年齢', 'TargetAges')
      } else if (options.length > 1) {
        //選択数が3つ以上
        if (languageType % 2 == 1) {
          return (
            '<div class="jp">' +
            options.length +
            ' つ選択中</div><div class="en" style="display: none">' +
            options.length +
            ' selects</div>'
          )
        } else {
          return (
            '<div class="jp" style="display: none">' +
            options.length +
            ' つ選択中</div><div class="en">' +
            options.length +
            ' selects</div>'
          )
        }
      } else {
        // その他
        var selected = ''
        options.each(function () {
          selected += $(this).text() + ', '
        })
        return getNoneSelectText(options.text(), options.attr('label'))
        // return selected.substr(0, selected.length - 2)
      }
    },
    optionLabel: function (element) {
      return getNoneSelectText($(element).text(), $(element).attr('label'))
    }
  })
  document
    .querySelectorAll('button[class="multiselect-option dropdown-item"]')
    .forEach((item) => {
      item.removeAttribute('title')
    })
  document
    .querySelectorAll('button[class="multiselect-option dropdown-item active"]')
    .forEach((item) => {
      item.removeAttribute('title')
    })
})

function getNoneSelectText(typeJPName, typeENName) {
  if (languageType % 2 == 1) {
    return (
      `<div class="jp" title="${typeJPName}">` +
      typeJPName +
      `</div><div class="en" style="display: none" title="${typeENName}">` +
      typeENName +
      '</div>'
    )
  } else {
    return (
      `<div class="jp" style="display: none" title="${typeJPName}">` +
      typeJPName +
      `</div><div class="en" title="${typeENName}">` +
      typeENName +
      '</div>'
    )
  }
}

//ページネーション変更
function updatePagination(result, total, count) {
  $('#pages_list').pagination({
    // diary-all-pagerにページャーを埋め込む
    dataSource: result, // APIの結果(絞り込み後のデータ)
    items: total / 10,
    pageSize: 10, // 1ページあたりの表示数
    prevText: '&lt; 前へ',
    nextText: '次へ &gt;',
    // ページがめくられた時に呼ばれる
    callback: function (data, pagination) {
      pagination.totalNumber = total
      pagination.pageRange = total / 10
      $(`#material_list`).empty()
      template(data, count)
      // dataの中に次に表示すべきデータが入っているので、html要素に変換
      //('#material_list').html(template(data)); // diary-all-contentsにコンテンツを埋め込む
    }
  })
}

//html作成
function template(dataArray, count) {
  return dataArray.map(function (data) {
    //data.teaching_materials = "./pdf/001_1Greetings1.pdf"
    //createImageElement(data.teaching_materials, data.name_en, data.name_jp);
    createImageElement(data, waitID, count)
  })
}

const PERPAGE_NUM = 10
var user
var category
var level
var target_age
var keyword
/* file API */
function getTextbookList(index) {
  //デフォルトの値
  var dataObject = {}
  switch (user_type) {
    case 0:
      dataObject.users = [1, 3] //生徒・全共通・登録なし
      break
    case 1:
      //dataObject.users = [1, 2, 3] //講師・全共通・登録なし
      //dataObject.users = [2, 3] //講師・全共通・登録なし
      dataObject.users = [1, 3]
      break
  }
  if ($('#multiple').val().length > 0) {
    dataObject.category = $('#multiple').val()
  }
  if ($('#multiple2').val().length > 0) {
    dataObject.level = $('#multiple2')
      .val()
      .map((str) => parseInt(str, 10))
  }
  if ($('#multiple3').val().length > 0) {
    dataObject.target_age = $('#multiple3')
      .val()
      .map((str) => parseInt(str, 10))
  }
  if ($('#searchTextName').val().length > 0) {
    dataObject.keyword = $('#searchTextName').val()
  }
  //ログ用
  console.dir(dataObject, {
    depth: null
  })
  //変換
  var data = JSON.stringify(dataObject)
  fetch(
    `${URL_LESSON_ROOM}/end-user/teaching-material/list?per_page=` +
      PERPAGE_NUM +
      '&page=' +
      index,
    {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    }
  )
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var result = JSON.stringify(data1)
      var parsed = JSON.parse(result)
      waitID++
      updatePagination(parsed.data.data, parsed.data.total, waitID) // -> ページネーションの設定
    })
    .catch(function (err1) {})
}

// ----------- ページネーション ----------

var oldDropValue = [] // = [{category:undefined},{level:undefined},{target_age:undefined}];
oldDropValue['category'] = undefined
oldDropValue['level'] = undefined
oldDropValue['target_age'] = undefined

const pdfElements = document.querySelector('#material_list')
const page_counter = document.querySelector('.page_counter')

var totalCount = 0 //合計の要素数
var viewPageNumber = 1 // 表示しているページ番号

$('#back-to-top').on('click', () => {
  $('#material-content').show()
  resetTextbookList()
  $('#material-list').hide()
  textbookChannel = 'backtoTextBook'

  getCategoryList()
  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        languageType: languageType,
        channel: 'backtoTextBook'
      }),
      false,
      'device'
    )
  }
})
$('#btn-back').on('click', () => {
  $('#material-content').show()
  resetTextbookList()
  $('#material-list').hide()
  getCategoryList()
  textbookChannel = 'backtoTextBook'

  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        languageType: languageType,
        channel: 'backtoTextBook'
      }),
      false,
      'device'
    )
  }
})

const resetTextbookList = () => {
  document.querySelector('#list-textbook').innerHTML = ''
  document.querySelector('#group-title-en').innerHTML = ''
  document.querySelector('#group-title-ja').innerHTML = ''
  document.querySelector('#material-title-en').innerHTML = ''
  document.querySelector('#material-title-ja').innerHTML = ''
}

// const downloadTextbook = (materialId, lessonName) => {
//   if (recording) isDownloadFileChat = true
//   const url = `${URL_LESSON_ROOM}/teaching-material/${materialId}/download`
//   const fileName = lessonName + '.pdf'
//   // window.location.href = url
//   downloadDataFromUrl(url, fileName)
//   event.stopPropagation()
// }

const downloadTextbook = () => {
  const materialId = event.currentTarget.getAttribute('data-id')
  const teaching_materials = event.currentTarget.getAttribute('data-src')
  const lessonName = event.currentTarget.getAttribute('data-name')
  if (recording) isDownloadFileChat = true
  const url = `${URL_LESSON_ROOM}/teaching-material/${materialId}/download`
  const fileName = lessonName + '.pdf'
  fetchDataFromUrl(url, teaching_materials, fileName)
  event.stopPropagation()
}

const downloadDataFromUrl = (url, fileName) => {
  let element = document.createElement('a')
  // element.setAttribute('href', url)
  // element.setAttribute('target', '_blank')
  // element.style.display = 'none'
  // document.body.appendChild(element)
  // element.click()
  // document.body.removeChild(element)
  element.href = url
  element.download = fileName
  element.click()
}

const fetchDataFromUrl = (url, fileLink, fileName, urlZIP) => {
  if (fileName.split('.')[fileName.split('.').length - 1] === 'pdf') {
    if (isMobile()) {
      // mobile
      if (isIpad()) {
        // Ipad
        if (isChromeIOS()) {
          let link = document.createElement('a')
          link.setAttribute('href', url)
          link.setAttribute('download', `${fileName}`)
          link.click()
        } else {
          setTimeout(() => {
            let pdfWindow = window.open(url)
            pdfWindow.location.replace(url)
          }, 100)
        }
      } else {
        // Iphone
        if (isIOS()) {
          if (isChromeIOS()) {
            let link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `${fileName}`)
            link.click()
          } else {
            setTimeout(() => {
              let pdfWindow = window.open(url)
              pdfWindow.location.replace(url)
            }, 100)

            // let downloadWindow = window.open('about:blank', '_blank')
            // setTimeout(() => {
            //   downloadWindow.location.href = url
            //   downloadWindow.location.replace(url)
            // }, 1000)
          }
        } else {
          //android
          let a = document.createElement('a')
          document.body.appendChild(a)
          // a.target = '_blank'
          a.href = urlZIP
          a.download = fileName
          a.click()
          document.body.removeChild(a)
        }
      }
    } else {
      // PC Laptop
      // window.open(url)
      downloadByOpenNewTab(url)
    }
  } else {
    if (isMobile()) {
      // mobile
      if (isIpad()) {
        // Ipad
        if (isChrome()) {
          let a = document.createElement('a')
          document.body.appendChild(a)
          a.target = '_blank'
          a.href = url.split('?')[0]
          a.download = fileName
          a.click()
          document.body.removeChild(a)
        } else {
          if (fileName.split('.')[fileName.split('.').length - 1] === 'zip') {
            setTimeout(() => {
              let pdfWindow = window.open(url.split('?')[0])
              pdfWindow.location.replace(url.split('?')[0])
            }, 100)
          } else {
            setTimeout(() => {
              let pdfWindow = window.open(url)
              pdfWindow.location.replace(url)
            }, 100)
            // setTimeout(() => {
            //   let downloadWindow = window.open('about:blank', '_blank')
            //   setTimeout(() => {
            //     downloadWindow.location.href = url
            //     downloadWindow.location.replace(url)
            //   }, 1000)
            // }, 100)
          }
        }
      } else {
        if (isIOS()) {
          if (isChromeIOS()) {
            let a = document.createElement('a')
            document.body.appendChild(a)
            a.href = url.split('?')[0]
            a.download = fileName
            a.click()
            document.body.removeChild(a)
          } else {
            if (fileName.split('.')[fileName.split('.').length - 1] === 'zip') {
              setTimeout(() => {
                let pdfWindow = window.open(url.split('?')[0])
                pdfWindow.location.replace(url.split('?')[0])
              }, 100)
            } else {
              setTimeout(() => {
                let pdfWindow = window.open(url)
                pdfWindow.location.replace(url)
              }, 100)
              // setTimeout(() => {
              //   let downloadWindow = window.open('about:blank', '_blank')
              //   setTimeout(() => {
              //     downloadWindow.location.href = url
              //     downloadWindow.location.replace(url)
              //   }, 1000)
              // }, 100)
            }
          }
        } else {
          // android
          let a = document.createElement('a')
          document.body.appendChild(a)
          a.href = url
          a.download = fileName
          a.click()
          document.body.removeChild(a)
        }
      }
    } else {
      // PC Laptop
      // window.open(url)
      downloadByOpenNewTab(url)
    }
  }
}

const loadPDF = () => {
  const pdfURL = event.currentTarget.id
  tempUrlTextBook = pdfURL
  fileNameTextbook = event.currentTarget.getAttribute('data-filename')
  fileNameTextbook = fileNameTextbook.slice(0, fileNameTextbook.length - 4)
  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        canvasURL: pdfURL,
        fileName: fileNameTextbook,
        channel: 'recvPDFURL'
      }),
      false,
      'device'
    )
  }
  //resetCanvasData(0)
  hideButtonPrevNext()
  loading('#draw_parent', true)
  var loadingTask = pdfjsLib.getDocument(pdfURL)
  loadingTask.promise
    .then(function (pdf) {
      loading('#draw_parent', false)
      total_height = 0
      total_width = 0
      start_x = 0
      start_y = 0
      thePDF = pdf
      numPages = pdf.numPages
      currPage = 1 //Pages are 1-based not 0-based

      // Page 1 Rendering To Canvas -> draw Image
      //renderPages()

      resetCanvasDataInMemory()
      pagetodisplay = 1
      renderPagesToMemory()

      /*
    //Dummy Canvas
    var canvas = document.createElement('canvas')

    // Page 1 Rendering To Canvas -> draw Image
    renderPage(canvas, pdf, 1, function pageRenderingComplete() {
      canvas_ratio = canvas.height / canvas.width
      //setAllCanvasRatio()
      setAllCanvasSize(canvas.width, canvas.height)
      var img = new Image()

      img.onload = function () {
        var canvasContext = document
          .getElementById('backgroundCanvas')
          .getContext('2d')

        var canvasElement = document.getElementById('draw')
        canvasRemoteDraw = document.getElementById('remoteDrawCanvas')
        old_width = canvasRemoteDraw.width
        old_height = canvasRemoteDraw.height

        var scale = canvasRemoteDraw.width / img.naturalWidth
        if (img.naturalHeight * scale > canvasRemoteDraw.height) {
          scale = canvasRemoteDraw.height / img.naturalHeight
        }
        board.setMinScale(scale)
        document.getElementById('draw_parent').scrollTo(0, 0)
        $('#draw').width('100%')
        $('#draw').height($('#draw').width() * canvas_ratio)
        board.setDefaultDrawWidth($('#draw').width())

        board.setRatio(
          old_width / canvasElement.clientWidth,
          old_height / canvasElement.clientHeight
        )

        canvasContext.fillStyle = 'rgb(127, 127, 127)'
        canvasContext.fillRect(
          0,
          0,
          canvasRemoteDraw.width,
          canvasRemoteDraw.height
        )
        canvasContext.drawImage(
          img,
          0,
          0,
          img.naturalWidth * scale,
          img.naturalHeight * scale
        )
        vsWebRTCClient.sendMessage(
          $room,
          $partner,
          JSON.stringify({
            canvasURL: pdfURL,
            channel: 'recvPDFURL'
          }),
          false,
          'device'
        )
      }
      img.src = canvas.toDataURL()

      loading('#draw_parent', false)
    })
    */
    })
    .catch((error) => {
      loading('#draw_parent', false)
      console.error(error)
    })
}

// (書き込むキャンバス, リザルトのpdf, ページ指定 ,レンダリング後の動作)
function renderPages() {
  //ページの読み込み
  thePDF.getPage(currPage).then(function (page) {
    //Dummy Canvas
    var canvas = document.createElement('canvas')
    //ビューポート
    var viewport = page.getViewport({
      scale: 2 //表示倍率
    })
    var pageDisplayWidth = viewport.width
    var pageDisplayHeight = viewport.height
    //var pageDivHolder = document.createElement();
    // Prepare canvas using PDF page dimensions
    //var canvas = document.createElement(id);
    var context = canvas.getContext('2d')
    canvas.width = pageDisplayWidth
    canvas.height = pageDisplayHeight
    // pageDivHolder.appendChild(canvas);
    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    page.render(renderContext).promise.then(function () {
      if (currPage == 1) {
        pdf_padding = Math.round(pdf_padding_ratio * canvas.width)
        total_height =
          canvas.height * numPages + pdf_padding * numPages + pdf_padding
        total_width = canvas.width + pdf_padding * 2
        canvas_ratio = total_height / total_width
        //setAllCanvasRatio()
        setAllCanvasSize(total_width, total_height)

        var canvasElement = document.getElementById('draw')
        var canvasRemoteDraw = document.getElementById('remoteDrawCanvas')
        old_width = canvasRemoteDraw.width
        old_height = canvasRemoteDraw.height

        var scale = canvasRemoteDraw.width / total_width
        board.setMinScale(scale)
        //document.getElementById('draw_parent').scrollTo(0, 0)
        $('#draw').width('100%')
        $('#draw').height($('#draw').width() * canvas_ratio)
        board.setDefaultDrawWidth($('#draw').width())
        board.setRatio(
          old_width / canvasElement.clientWidth,
          old_height / canvasElement.clientHeight
        )

        if (cumulativesum_pdf > 0) {
          if (cumulativesum_recvremote == cumulativesum_pdf) {
            var canvasDataRemote = ''
            for (var i = 1; i <= numPages; i++) {
              canvasDataRemote = canvasDataRemote + canvasData_recvremote[i - 1]
            }
            var remoteDrawCanvasImage = new Image()
            remoteDrawCanvasImage.onload = remoteDrawCanvasImageOnload
            remoteDrawCanvasImage.src = canvasDataRemote
          }
          if (cumulativesum_recvlocal == cumulativesum_pdf) {
            var canvasDataLocal = ''
            for (var i = 1; i <= numPages; i++) {
              canvasDataLocal = canvasDataLocal + canvasData_recvlocal[i - 1]
            }
            var localDrawCanvasImage = new Image()
            localDrawCanvasImage.onload = localDrawCanvasImageOnload
            localDrawCanvasImage.src = canvasDataLocal
          }
        }
      }
      var img = new Image()
      img.onload = function () {
        var canvasContext = document
          .getElementById('backgroundCanvas')
          .getContext('2d')
        canvasContext.fillStyle = 'rgb(127, 127, 127)'
        canvasContext.fillRect(
          start_x,
          start_y,
          img.naturalWidth + pdf_padding * 2,
          img.naturalHeight + pdf_padding * 2
        )
        canvasContext.drawImage(
          img,
          start_x + pdf_padding,
          start_y + pdf_padding,
          img.naturalWidth,
          img.naturalHeight
        )
        currPage++
        if (thePDF !== null && currPage <= numPages) {
          start_y += img.naturalHeight + pdf_padding
          renderPages()
        } else {
          loading('#draw_parent', false)
        }
      }
      img.src = canvas.toDataURL()
    })
  })
}

function resetCanvasDataInMemory() {
  canvasDataLocal_array = new Array(numPages)
  canvasDataRemote_array = new Array(numPages)
  canvasDataBackground_array = new Array(numPages)
}

// (書き込むキャンバス, リザルトのpdf, ページ指定 ,レンダリング後の動作)
function renderPagesToMemory() {
  //ページの読み込み
  thePDF.getPage(currPage).then(function (page) {
    //Dummy Canvas
    var canvas = document.createElement('canvas')
    //ビューポート
    var viewport = page.getViewport({
      scale: 2 //表示倍率
    })
    var pageDisplayWidth = viewport.width
    var pageDisplayHeight = viewport.height
    //var pageDivHolder = document.createElement();
    // Prepare canvas using PDF page dimensions
    //var canvas = document.createElement(id);
    var context = canvas.getContext('2d')
    canvas.width = pageDisplayWidth
    canvas.height = pageDisplayHeight

    // pageDivHolder.appendChild(canvas);
    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    loading('#draw_parent', true)
    page
      .render(renderContext)
      .promise.then(function () {
        loading('#draw_parent', false)
        canvasDataBackground_array[currPage - 1] = canvas.toDataURL()
        // currPage++
        // if (thePDF !== null && currPage <= numPages) {
        //   renderPagesToMemory()
        // } else {
        //   loading('#draw_parent', false)
        //   renderPageFromMemory()
        // }
        renderPageFromMemory()
      })
      .catch((error) => {
        loading('#draw_parent', false)
        console.error(error)
      })
  })
}
// (書き込むキャンバス, リザルトのpdf, ページ指定 ,レンダリング後の動作)
function renderPageFromMemory() {
  if (canvasDataBackground_array[pagetodisplay - 1]) {
    isloadingCavasBackground = true
    var dummyImg = new Image()
    dummyImg.onload = myImageOnload
    dummyImg.src = canvasDataBackground_array[pagetodisplay - 1]
    if (canvasDataLocal_array[pagetodisplay - 1]) {
      isloadingCavasLocal = true
      var localDrawCanvasImage = new Image()
      localDrawCanvasImage.onload = localDrawCanvasImageOnload
      localDrawCanvasImage.src = canvasDataLocal_array[pagetodisplay - 1]
    } else {
      isloadingCavasLocal = false
    }
    if (canvasDataRemote_array[pagetodisplay - 1]) {
      isloadingCavasRemote = true
      var remoteDrawCanvasImage = new Image()
      remoteDrawCanvasImage.onload = remoteDrawCanvasImageOnload
      remoteDrawCanvasImage.src = canvasDataRemote_array[pagetodisplay - 1]
    } else {
      isloadingCavasRemote = false
    }
    document.getElementById('draw_parent').scrollTo(0, 0)
    isloadingCavas = false
    updateButtonPrevNext()
  } else {
    currPage = pagetodisplay
    renderPagesToMemory()
  }
}

function prevPage() {
  if (
    pagetodisplay > 1 &&
    !isloadingCavas &&
    !isloadingCavasBackground &&
    !isloadingCavasLocal &&
    !isloadingCavasRemote
  ) {
    isloadingCavas = true
    updateButtonPrevNext()
    saveCanvasToMemory()
    pagetodisplay--
    sendPagetodisplay($partner)
    renderPageFromMemory()
  }
}

function nextPage() {
  if (
    pagetodisplay < numPages &&
    !isloadingCavas &&
    !isloadingCavasBackground &&
    !isloadingCavasLocal &&
    !isloadingCavasRemote
  ) {
    isloadingCavas = true
    updateButtonPrevNext()
    saveCanvasToMemory()
    pagetodisplay++
    sendPagetodisplay($partner)
    renderPageFromMemory()
  }
}

function saveCanvasToMemory() {
  canvasDataLocal_array[pagetodisplay - 1] = document
    .getElementById('localDrawCanvas')
    .toDataURL()
  canvasDataRemote_array[pagetodisplay - 1] = document
    .getElementById('remoteDrawCanvas')
    .toDataURL()
}

function updateButtonPrevNext() {
  if (numPages > 1) {
    document.getElementById('currPage').style.display = 'flex'
    document.getElementById('currPage').innerText =
      pagetodisplay + '/' + numPages
    if (pagetodisplay == 1 || isloadingCavas) {
      document.getElementById('prevPage').style.display = 'none'
      document.getElementById('prevPageDisable').style.display = 'flex'
    } else {
      document.getElementById('prevPage').style.display = 'flex'
      document.getElementById('prevPageDisable').style.display = 'none'
    }
    if (pagetodisplay == numPages || isloadingCavas) {
      document.getElementById('nextPage').style.display = 'none'
      document.getElementById('nextPageDisable').style.display = 'flex'
    } else {
      document.getElementById('nextPage').style.display = 'flex'
      document.getElementById('nextPageDisable').style.display = 'none'
    }
  }
}

function hideButtonPrevNext() {
  document.getElementById('currPage').style.display = 'none'
  document.getElementById('prevPage').style.display = 'none'
  document.getElementById('prevPageDisable').style.display = 'none'
  document.getElementById('nextPage').style.display = 'none'
  document.getElementById('nextPageDisable').style.display = 'none'
}

var isloadingCavas = false
const loading = (element, isLoading) => {
  isloadingCavas = isLoading
  if (isLoading) {
    const loadingElement = document.createElement('div')
    loadingElement.setAttribute('class', 'loading-wrapper')
    loadingElement.style.opacity = '0.5'
    loadingElement.style.background = 'white'
    loadingElement.innerHTML = `<img class="loading" src="./svg/spiner.svg" />`
    document.querySelector(element).appendChild(loadingElement)
  } else {
    const loadingElement = document.querySelector('.loading-wrapper')
    if (loadingElement) {
      loadingElement.remove()
    }
  }
}

const getMaterialListByGroup = (id) => {
  const selectedGroup = event.target
  titleEN = selectedGroup.getAttribute('data-title-en')
  titleJA = selectedGroup.getAttribute('data-title-ja')
  categoryId = id
  textbookChannel = 'listTextBook'

  $('#material-content').hide()
  $('#material-list').show()

  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        titleEN,
        titleJA,
        categoryId,
        channel: 'listTextBook'
      }),
      false,
      'device'
    )
  }

  getDataTextBookList(id, titleEN, titleJA)
}
const getMaterialGroup = () => {
  $('#material-content').show()
  $('#material-list').hide()

  getCategoryList()
}

function getTeachingMaterial(createFunction) {
  fetch(
    `${URL_LESSON_ROOM}/end-user/teaching-material/list?per_page=` +
      PERPAGE_NUM +
      '&page=' +
      viewPageNumber,
    {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: makeJsonData()
    }
  )
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var result = JSON.stringify(data1)
      var parsed = JSON.parse(result)
      waitID++
      createFunction(parsed.data, waitID)
    })
    .catch(function (err1) {})
}

function makeJsonData() {
  var dataObject = {}
  switch (user_type) {
    case 0: // 生徒
      dataObject.users = [1, 3]
      break
    case 1: // 講師
      //dataObject.users = [1, 2, 3]
      //dataObject.users = [2, 3]
      dataObject.users = [1, 3]
      break
  }
  if ($('#multiple').val().length > 0) {
    if ($('#multiple').val() == 0) {
      dataObject.category = ''
    } else {
      dataObject.category = $('#multiple').val()
    }
  }
  if ($('#multiple2').val().length > 0) {
    dataObject.level = $('#multiple2')
      .val()
      .map((str) => parseInt(str, 10))
  }
  if ($('#multiple3').val().length > 0) {
    dataObject.target_age = $('#multiple3')
      .val()
      .map((str) => parseInt(str, 10))
  }
  if ($('#searchTextName').val().length > 0) {
    dataObject.keyword = $('#searchTextName').val()
  }
  return JSON.stringify(dataObject)
}

// ページカウントの作成
function createPageCounterMobile() {
  $('.page_counter').empty()
  var pageCount = Math.ceil(totalCount / PERPAGE_NUM)
  var firstPageCounter = Math.max(viewPageNumber - 1, 1)
  var lastPageCounter = Math.min(viewPageNumber + 1, pageCount)
  // ページカウンターの最初の値を計算する

  if (viewPageNumber < 2) {
    firstPageCounter = 1
    lastPageCounter = Math.min(2, pageCount)
  }
  if (pageCount - 2 < viewPageNumber) {
    firstPageCounter = Math.max(pageCount - 3, 1)
    lastPageCounter = pageCount
  }
  //表示ページが最初の場合
  if (lastPageCounter <= 1) {
    // 結果には「0」も含まれる。
    next_btn_disable()
    prev_btn_disable()
  } else {
    if (viewPageNumber === firstPageCounter || viewPageNumber === undefined) {
      // 前が存在しない場合
      next_btn_active()
      prev_btn_disable()
    } else {
      // 前が存在する場合
      if (viewPageNumber === lastPageCounter) {
        //次が存在しない場合
        next_btn_disable()
        prev_btn_active()
      } else {
        // その他の場合
        next_btn_active()
        prev_btn_active()
      }
    }
  }
  //ページカウンターが最初から2以上離れている場合
  if (Math.abs(1 - firstPageCounter) >= 1 && viewPageNumber - 1 >= 2) {
    // 最初を作成 -----
    var count_list = document.createElement('li')
    count_list.setAttribute('data-counter-id', 1)
    count_list.classList.add('page_number')
    count_list.textContent = 1
    count_list.value = 1
    page_counter.appendChild(count_list)
    if (viewPageNumber > 3) {
      // 間隔を作成 -----
      var count_list = document.createElement('li')
      count_list.textContent = '...'
      count_list.classList.add('interval')
      page_counter.appendChild(count_list)
    }
  }
  //通常の要素
  for (let i = firstPageCounter; i < lastPageCounter + 1; i++) {
    let count_list = document.createElement('li')
    count_list.setAttribute('data-counter-id', i)
    count_list.classList.add('page_number')
    count_list.textContent = i
    count_list.value = i
    if (i === viewPageNumber) {
      count_list.classList.add('current')
    }
    page_counter.appendChild(count_list)
  }
  //ページカウンターが最後から2以上離れている場合
  if (
    Math.abs(pageCount - firstPageCounter) > 1 &&
    pageCount - viewPageNumber > 1
  ) {
    if (pageCount - viewPageNumber > 1) {
      // 間隔を作成 -----
      var count_list = document.createElement('li')
      count_list.textContent = '...'
      count_list.classList.add('interval')
      page_counter.appendChild(count_list)
    }
    //最後を作成
    var count_list = document.createElement('li')
    count_list.setAttribute('data-counter-id', pageCount)
    count_list.classList.add('page_number')
    count_list.textContent = pageCount
    count_list.value = pageCount
    page_counter.appendChild(count_list)
  }
}

function createPageCounter() {
  $('.page_counter').empty()
  var pageCount = Math.ceil(totalCount / PERPAGE_NUM)
  var firstPageCounter = Math.max(viewPageNumber - 2, 1)
  var lastPageCounter = Math.min(viewPageNumber + 2, pageCount)
  // ページカウンターの最初の値を計算する
  if (viewPageNumber < 3) {
    firstPageCounter = 1
    lastPageCounter = Math.min(5, pageCount)
  }
  if (pageCount - 2 < viewPageNumber) {
    firstPageCounter = Math.max(pageCount - 4, 1)
    lastPageCounter = pageCount
  }
  //表示ページが最初の場合
  if (lastPageCounter <= 1) {
    // 結果には「0」も含まれる。
    next_btn_disable()
    prev_btn_disable()
  } else {
    if (viewPageNumber === firstPageCounter || viewPageNumber === undefined) {
      // 前が存在しない場合
      next_btn_active()
      prev_btn_disable()
    } else {
      // 前が存在する場合
      if (viewPageNumber === lastPageCounter) {
        //次が存在しない場合
        next_btn_disable()
        prev_btn_active()
      } else {
        // その他の場合
        next_btn_active()
        prev_btn_active()
      }
    }
  }
  //ページカウンターが最初から2以上離れている場合
  if (Math.abs(1 - firstPageCounter) >= 1 && viewPageNumber - 1 >= 2) {
    // 最初を作成 -----
    var count_list = document.createElement('li')
    count_list.setAttribute('data-counter-id', 1)
    count_list.classList.add('page_number')
    count_list.textContent = 1
    count_list.value = 1
    page_counter.appendChild(count_list)
    if (viewPageNumber > 4) {
      // 間隔を作成 -----
      var count_list = document.createElement('li')
      count_list.textContent = '...'
      count_list.classList.add('interval')
      page_counter.appendChild(count_list)
    }
  }
  //通常の要素
  for (let i = firstPageCounter; i < lastPageCounter + 1; i++) {
    s
    let count_list = document.createElement('li')
    count_list.setAttribute('data-counter-id', i)
    count_list.classList.add('page_number')
    count_list.textContent = i
    count_list.value = i
    if (i === viewPageNumber) {
      count_list.classList.add('current')
    }
    page_counter.appendChild(count_list)
  }
  //ページカウンターが最後から2以上離れている場合
  if (
    Math.abs(pageCount - firstPageCounter) > 1 &&
    pageCount - viewPageNumber > 2
  ) {
    if (pageCount - viewPageNumber > 3) {
      // 間隔を作成 -----
      var count_list = document.createElement('li')
      count_list.textContent = '...'
      count_list.classList.add('interval')
      page_counter.appendChild(count_list)
    }
    //最後を作成
    var count_list = document.createElement('li')
    count_list.setAttribute('data-counter-id', pageCount)
    count_list.classList.add('page_number')
    count_list.textContent = pageCount
    count_list.value = pageCount
    page_counter.appendChild(count_list)
  }
}

// PDFエレメントの作成
function createPDFElement(data, count) {
  totalCount = data.total //合計の要素数
  if (isMobile()) {
    createPageCounterMobile()
  } else {
    createPageCounter()
  }
  $('#material_list').empty()
  data.data.map(function (data) {
    createImageElement(data, viewPageNumber, count)
  })

  $('.page_counter li')
    .not('.current')
    .click(function () {
      viewPageNumber = $(this).val() // ページ番号を指定
      getTeachingMaterial(createPDFElement)
      $('.page_counter li').off('click') // クリック判定を削除する
    })
}

const next_btn = document.querySelector('.next') // 次へ要素
// 次へボタン
function next_btn_disable() {
  next_btn.classList.add('disable')
}

function next_btn_active() {
  next_btn.classList.remove('disable')
}

// next_btn.addEventListener('click', () => {
//   viewPageNumber++
//   getTeachingMaterial(createPDFElement)
// })

const prev_btn = document.querySelector('.prev') // 前へ要素
// 前へボタン
function prev_btn_disable() {
  prev_btn.classList.add('disable')
}

function prev_btn_active() {
  prev_btn.classList.remove('disable')
}

// prev_btn.addEventListener('click', () => {
//   viewPageNumber--
//   getTeachingMaterial(createPDFElement)
// })
