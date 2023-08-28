var note

var isChangeStream = false
var clientDebugFlag = true
var $room
var $partner // = [];
var waitTimer = 0
var localAudio

var agc = true
var making = false

var logData = []
var isAccept = false
var isInRoom = true
var JoinWithoutCamFirst = true

function clientload() {
  Converter = new Converter()
  Converter.setStart(init, makeStream, connect)
  Converter.setStream(
    loadedStream,
    changeTrack,
    pauseTrack,
    resumeTrack,
    stopTrack,
    getLocalStream
  )
  Converter.setChat(
    sendChat,
    sendStatus,
    sendCameraStatus,
    sendRecordStatus,
    sendVolumn,
    sendShareStart,
    sendShareEnd
  )
  Converter.setEnd(disconnect)
  loadScript('./client/skyway-4.4.5_client.min.js', Converter.start)
}

function clientDebug(title, text, color) {
  if (clientDebugFlag) {
    console.log(title, ': ', text)
  } else {
    return
  }
}

/*********************************************
 *                 setStart
 *********************************************/
function init(name) {
  vsWebRTCClient = vsWebRTCClient.getInstance()
  vsWebRTCClient.setRoomListener(
    onJoinRoomSuccess,
    onJoinRoomFail,
    onLeaveRoomSuccess,
    onLeaveRoomFail,
    onRoomInfoChanged,
    onMemberJoin,
    onMemberLeave,
    onOnline,
    onOffline,
    undefined
  )
  vsWebRTCClient.setCallListener(
    onCallSuccess,
    onCallFail,
    onHangupSuccess,
    onHangupFail,
    onBeCalled,
    onBeAccepted,
    onBeRejected,
    onHungup,
    onResponseSuccess,
    onResponseFail
  )
  vsWebRTCClient.setEventListener(onEventError)
  vsWebRTCClient.setConnectionListener(
    onConnectSuccess,
    onConnectFail,
    onDisconnected
  )
  vsWebRTCClient.setMessageListener(undefined, onMessage, onOpen, onClose)
  vsWebRTCClient.setDataListener(undefined, onData, undefined, undefined)
  vsWebRTCClient.setStreamListener(onRemoteStreamChanged, undefined)
  vsWebRTCClient.setMediaRTCListener(
    onMediaCommunicationError,
    onMediaCommunicationOpened
  )

  vsWebRTCClient.configure(null, null)

  // vsWebRTCClient.configure('https://simpson-stg-sig.tgl-cloud.com', [
  //   new IceServer('stun:simpson-turns.tgl-cloud.com'),
  //   new IceServer('turn:simpson-turns.tgl-cloud.com', 'simpson', 'simpson5aver')
  // ])

  vsWebRTCClient.configIceTransportPolicy('3')

  if (!JoinWithoutCam)
    vsWebRTCClient.configStream(
      StreamHandler.TRACK_KIND_CAMERA,
      {
        video_source_id: deviceCameraId,
        fps: 30,
        bitrate_max: 800,
        width: 640,
        height: 360,
        codec: 'H264'
      },
      'device'
    )
  vsWebRTCClient.configStream(
    StreamHandler.TRACK_KIND_MIC,
    {
      audio_source_id: deviceMicId,
      bitrate_max: 128,
      codec: 'opus',
      echo_cancellation: true,
      echo_cancellation2: true,
      auto_gain_control: agc,
      noise_suppression: true,
      highpass_filter: false,
      audio_mirroring: true,
      enable_constant_bitrate: true
    },
    'device'
  )

  if (JoinWithoutCam) {
    vsWebRTCClient.identify(name)
    //自分の映像要素を作成する。
    vsWebRTCClient.makeStream(
      [StreamHandler.TRACK_KIND_MIC],
      Converter.makeVideoElement,
      onMakeStreamFail,
      StreamHandler.TRACK_CREATE_NEW,
      true,
      'device'
    )
  } else {
    vsWebRTCClient.identify(name)
    //自分の映像要素を作成する。
    vsWebRTCClient.makeStream(
      [StreamHandler.TRACK_KIND_CAMERA, StreamHandler.TRACK_KIND_MIC],
      Converter.makeVideoElement,
      onMakeStreamFail,
      StreamHandler.TRACK_CREATE_NEW,
      true,
      'device'
    )
  }
}

var first = true
var deviceStream

/*
function viewStream(stream) {
  if (false) {
    first = false;
    vsWebRTCClient.showStream(document.getElementById("localVideo"), stream);
  } else {
    making = true;
    vsWebRTCClient.showStream(document.getElementById("remoteVideo"), stream);
  }
}*/

function makeStream(kinds) {
  kinds.forEach(function (kind) {
    if (kind == 'video') {
      vsWebRTCClient.configStream(kind, {
        video_source_id: deviceCameraId
      })
    }
    if (kind == 'audio') {
      vsWebRTCClient.configStream(kind, {
        audio_source_id: deviceMicId
      })
    }
  })
  vsWebRTCClient.makeStream(
    ['video', 'audio'],
    changeTrack,
    onMakeStreamFail,
    StreamHandler.TRACK_CREATE_NEW,
    true
  )
}

function connect() {
  isInRoom = true
  vsWebRTCClient.connect()
}

function getLocalStream(name) {
  return vsWebRTCClient.getLocalStream(name)
}

function changeDeviceStream(kind, detectChange = false) {
  var constraints
  var oldTrack
  var newTrack
  var localStream = vsWebRTCClient.getLocalStream('device')
  switch (kind) {
    case 'video':
      constraints = videoConfig.getConstraints()
      oldTrack = localStream.getVideoTracks()[0]
      break
    case 'audio':
      constraints = audioConfig.getConstraints()
      oldTrack = localStream.getAudioTracks()[0]
      break
  }

  if (isMobile() && !isIpad() && !isIOS()) {
    if (kind === 'video') {
      localStreamCopy?.getTracks()?.forEach((track) => {
        if (track.kind === 'video') {
          track.stop()
        }
      })
      localStream?.getTracks()?.forEach((track) => {
        if (track.kind === 'video') {
          track.stop()
        }
      })
      deviceStream?.getTracks()?.forEach((track) => {
        if (track.kind === 'video') {
          track.stop()
        }
      })
    }
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      switch (kind) {
        case 'video':
          deviceStream = stream.clone()
          if (
            $('#toggle-backgroundEdit').prop('checked') ||
            $('#toggle-subbackgroundEdit').prop('checked')
          ) {
            $('#toggle-subbackgroundEdit').prop('checked', false)
            $('#toggle-backgroundEdit').prop('checked', false)
            if (!backgroundOff) {
              var backgroundRadio = $('input[name="background-mode"]:radio')
              backgroundRadio.filter('[value=1]').prop('checked', true)
              document.getElementById('file-select').value = null
              backgroundOff = true
              blurredEnabled = false
              virtualBackgroundEnabled = false
              vsWebRTCClient.stopStreamWithBackgound()
            }
          }
          newTrack = stream.getVideoTracks()[0]
          if (newTrack) {
            if (oldTrack) {
              if (detectChange) {
                localStream.getTracks().forEach((item) => {
                  if (item.kind === 'video') {
                    localStream.removeTrack(item)
                  }
                })
              } else {
                localStream.removeTrack(oldTrack)
              }
            }
            if ($('#toggle-camera').prop('checked')) {
              var localTrack = localStreamCopy?.getVideoTracks()
              if (localTrack) {
                localTrack.enabled = false
              }
              newTrack.enabled = false
            }
            localStream.addTrack(newTrack)
            changeVideoStream(localStream)
            vsWebRTCClient.showStream(
              document.getElementById('localVideo'),
              localStream
            )
          }
          // if (isMobile() && !isIpad() && !isIOS()) {
          //   changeDeviceStream('audio')
          // }
          break
        case 'audio':
          newTrack = stream.getAudioTracks()[0]
          console.log('Constraints', oldTrack, newTrack)
          if (newTrack) {
            if (oldTrack) {
              localStream.removeTrack(oldTrack)
            }
            if ($('#toggle-mic').prop('checked')) {
              newTrack.enabled = false
            } else newTrack.enabled = true
            localStream.addTrack(newTrack)
            replaceRemoteStream(localStream)
            createAudioGraph(stream)

            if (
              $('#toggle-backgroundEdit').prop('checked') ||
              $('toggle-subbackgroundEdit').prop('checked')
            ) {
              vsWebRTCClient.createStreamWithBackgound(localVideo)
            }
          }
          break
      }
      console.log('Localstream', localStream.getTracks())
    })
    .catch(function (err) {
      clientDebug('ストリーム作成', err, 'black')
    })
}
var screentrack

var videoStream
var screenStream

function onMakeScreenold(stream) {
  //キャンセル時
  if (stream.getTracks().length < 3) {
    $('#toggle-screenshare').prop('checked', false)
    return
  }
  modeChange(2)
  $('#share-contents').show()
  $('#video-contents').hide()
  $('#draw_component').hide()
  $('#materialSelect-contents').hide()
  videoContentsView(true)
  // デバイス用ストリーム
  videoStream = new MediaStream()
  // 画面共有用ストリーム
  screenStream = new MediaStream()
  var remotevideotrack = stream.getVideoTracks().find(function (track) {
    return track.label == $('#config_camera').children('option:selected').text()
  })
  videoStream.addTrack(remotevideotrack)
  var remoteaudiotrack = stream.getAudioTracks().find(function (track) {
    return track.label == $('#config_mic').children('option:selected').text()
  })
  videoStream.addTrack(remoteaudiotrack)
  // 画面共有のストリーム
  var remotescreenrtrack = stream.getVideoTracks().find(function (track) {
    return track.label != $('#config_camera').children('option:selected').text()
  })
  screenStream.addTrack(remotescreenrtrack)
  remotescreenrtrack.addEventListener('ended', () => {
    //画面共有終了
    if (vsWebRTCClient._localStreamHandler.tracks['screen'] != undefined) {
      vsWebRTCClient._localStreamHandler.mainStream.removeTrack(
        vsWebRTCClient._localStreamHandler.tracks['screen']
      )
      vsWebRTCClient._localStreamHandler.tracks['screen'].disabled = false
      vsWebRTCClient._localStreamHandler.tracks['screen'].stop()
      delete vsWebRTCClient._localStreamHandler.tracks['screen']
      modeChange(0)
    }
    $('#share-contents').hide()
    $('#video-contents').show()
    videoContentsView(false)
    $('#toggle-screenshare').prop('checked', false)
  })
  if (stream.getAudioTracks().length > 1) {
    var remotescreenatrack = stream.getAudioTracks().find(function (track) {
      return track.label != $('#config_mic').children('option:selected').text()
    })
    if (remotescreenatrack != undefined) {
      screenStream.addTrack(remotescreenatrack)
    }
  }
  var local = document.getElementById('localVideo')
  vsWebRTCClient.showStream(local, stream)

  vsWebRTCClient.showStream(screenElement, stream)
  //vsWebRTCClient.notifyStreamChanged($room, $partner)
}

function testStreamChange(newtrack) {
  //必要以上に保持しないようにする。
  vsWebRTCClient._localStreamHandler.tracks = [] //初期化
  //使用中のストリームを停止
  var targetTrack = vsWebRTCClient
    .getLocalStream('device')
    .getTracks()
    .find(function (s) {
      return s.kind == newtrack.kind
    })
  if (targetTrack) {
    targetTrack.enable = false
    targetTrack.stop()
  }
  //streamの切替
  if ($partner != undefined) {
    var peerconnection =
      vsWebRTCClient._webrtcHandler.peerSessions[
        PeerSession.getId($room, $partner, 'device')
      ].peerConnection
    var targetSender = peerconnection.getSenders().find(function (s) {
      return s.track && s.track.kind == newtrack.kind
    })
    //トラックの切替
    targetSender
      .replaceTrack(newtrack)
      .then(function () {
        //全員分の切替処理終了後ローカル映像を表示
        // var mainstream = vsWebRTCClient.getLocalStream('device')
        // //古いストリームを消去
        // if (targetTrack) {
        //   mainstream.removeTrack(targetTrack)
        // }
        // //新しいストリームを追加
        // mainstream.addTrack(newtrack)
        var mainstream = vsWebRTCClient.getLocalStream('device')
        //古いストリームを消去
        if (targetTrack) {
          mainstream.removeTrack(targetTrack)
        }
        //新しいストリームを追加
        mainstream.addTrack(newtrack)
      })
      .catch(function (err) {
        clientDebug('ReplaceTrack', err, 'black')
      })
  } else {
    // var mainstream = vsWebRTCClient.getLocalStream('device')
    // //古いストリームを消去
    // if (targetTrack) {
    //   mainstream.removeTrack(targetTrack)
    // }
    // //新しいストリームを追加
    // mainstream.addTrack(newtrack)
    var mainstream = vsWebRTCClient.getLocalStream('device')
    //古いストリームを消去
    if (targetTrack) {
      mainstream.removeTrack(targetTrack)
    }
    //新しいストリームを追加
    mainstream.addTrack(newtrack)
  }

  return
}

function replaceRemoteStream(stream) {
  var audioTrack = vsWebRTCClient
    .getLocalStream('device')
    .getTracks()
    .find(function (s) {
      return s.kind == 'audio'
    })
  if (audioTrack && stream.getAudioTracks().length == 0) {
    stream.addTrack(audioTrack)
  }
  vsWebRTCClient.replaceStream(stream)
}

function changeVideoStream(stream) {
  vsWebRTCClient.showStream(document.getElementById('previewVideo'), stream)
  vsWebRTCClient.showStream(document.getElementById('localVideoBg'), stream)
  var audioTrack = vsWebRTCClient
    .getLocalStream('device')
    .getTracks()
    .find(function (s) {
      return s.kind == 'audio'
    })
  if (audioTrack && stream.getAudioTracks().length == 0) {
    stream.addTrack(audioTrack)
  }
  vsWebRTCClient.replaceStream(stream)
  return
}

/*********************************************
 *                 setStream
 *********************************************/
function loadedStream() {
  if (isInRoom) {
    clientDebug('Client', 'loadedStream', 'black')
    if (isChangeStream) {
      vsWebRTCClient.notifyStreamChanged($room, $partner)
    } else {
      vsWebRTCClient.connect()
      isChangeStream = true
    }
  }
}

function changeTrack(stream) {
  clientDebug('Client', 'changeTrack', 'black')
  if (stream.getTracks().length >= 2) {
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      Converter.endScreenShare()
    })
    vsWebRTCClient.notifyStreamChanged($room, $partner)
    Converter.endScreenShare()
  }
  Converter.createAudioGraph(stream)
}

function onChangeScreen(stream) {
  clientDebug('Client', 'onChangeScreen', 'black')
  if (stream.getTracks().length >= 1) {
    var newTracks = vsWebRTCClient._localStreamHandler.tracks.filter(function (
      track
    ) {
      return track.enabled == true
    })
    vsWebRTCClient._localStreamHandler.tracks = newTracks
    if (stream.getVideoTracks()[0] != undefined) {
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        Converter.endScreenShare()
      })
      Converter.changeScreenShareSuccess('video')
    } else {
      clientDebug('Client', 'No VideoTracks', 'black')
    }
    if (stream.getAudioTracks()[0] != undefined) {
      Converter.changeScreenShareSuccess('audio')
    } else {
      clientDebug('Client', 'No AudioTracks', 'black')
    }

    vsWebRTCClient.notifyStreamChanged($room, $partner)
  } else {
    clientDebug('Client', 'No Stream', 'black')
    Converter.changeScreenShareFail()
  }
}

function onChangeStream() {
  clientDebug('Client', 'onChangeStream', 'black')
}

function pauseTrack(kind) {
  clientDebug('Client', 'pauseTrack', 'black')
  if (backgroundOff) {
    var targetTrack = vsWebRTCClient
      .getLocalStream('device')
      .getTracks()
      .find(function (track) {
        return track.kind == kind
      })
    if (!targetTrack) return false
    targetTrack.enabled = false
  } else {
    var backgroundTrack = canvasStream.getTracks().find(function (track) {
      return track.kind == kind
    })
    if (!backgroundTrack) return false
    backgroundTrack.enabled = false
  }

  var localTrack = localStreamCopy?.getTracks().find(function (track) {
    return track.kind == kind
  })
  if (localTrack) {
    localTrack.enabled = false
  }
  return true
}

function resumeTrack(kind) {
  clientDebug('Client', 'resumeTrack', 'black')
  if (backgroundOff) {
    var targetTrack = vsWebRTCClient
      .getLocalStream('device')
      .getTracks()
      .find(function (track) {
        return track.kind == kind
      })
    if (targetTrack) targetTrack.enabled = true
  } else {
    var backgroundTrack = canvasStream.getTracks().find(function (track) {
      return track.kind == kind
    })
    backgroundTrack.enabled = true
  }

  var localTrack = localStreamCopy?.getTracks().find(function (track) {
    return track.kind == kind
  })
  if (localTrack) {
    localTrack.enabled = true
  }
}

function stopTrack(kind) {
  clientDebug('Client', 'stopTrack', 'black')
  var targetTrack = vsWebRTCClient
    .getLocalStream('device')
    .getTracks()
    .find(function (track) {
      return track.kind == kind
    })

  targetTrack.enabled = false
  targetTrack.stop()
}

function changeScreenShare() {
  vsWebRTCClient.makeStream(
    ['screen'],
    onChangeScreen,
    onMakeStreamFail,
    StreamHandler.TRACK_CREATE_NEW,
    true
  )
}

/*********************************************
 *                  setChat
 *********************************************/
function sendChat(message) {
  if (message.length > 0) {
    showLoadingChat('bottom')
    var data = {
      room_id: roomName,
      username: nickName,
      message: message
    }
    data = JSON.stringify(data)

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
        createChatBubble(
          Converter.getMyUserName(),
          message,
          undefined,
          false,
          data1.id,
          false
        )
        if ($partner != undefined) {
          vsWebRTCClient.sendMessage(
            $room,
            $partner,
            JSON.stringify({
              text: message,
              chatId: data1.id,
              channel: 'chat'
            }),
            false,
            'device'
          )
        }
        var json = JSON.stringify(data1)
        var parsed = JSON.parse(json)
        removeLoadingChat()
        scrollControl(document.getElementById('chat-area'), 'end')
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

function sendStatus(isMute) {
  if ($partner != undefined) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        use_mic: isMute,
        channel: 'status'
      }),
      false,
      'device'
    )
  }
}

function sendCameraStatus(isMute) {
  if ($partner != undefined) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        use_cam: isMute,
        channel: 'cameraStatus'
      }),
      false,
      'device'
    )
  }
}

function sendRecordStatus(isRecord) {
  if ($partner != undefined) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        use_record: isRecord,
        channel: 'recordStatus'
      }),
      false,
      'device'
    )
  }
}

function sendVolumn(volumn) {
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      max_volume: volumn,
      channel: 'system'
    }),
    false,
    'device'
  )
}

function sendShareStart(name) {
  clientDebug('Client', '画面共有開始', 'black')
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      spot_user: name,
      channel: 'shareStart'
    }),
    false,
    'device'
  )
}

function sendShareEnd() {
  clientDebug('Client', '画面共有終了', 'black')
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      channel: 'shareEnd'
    }),
    false,
    'device'
  )
}

//開始時の全体通知
function sendMemberWhiteboardStart() {
  clientDebug('Client', 'ホワイトボード開始', 'black')
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      channel: 'boardStart'
    }),
    false,
    'device'
  )
}

//途中参加の通知
function sendWhiteboardStart(partner) {
  clientDebug('Client', 'ホワイトボード開始', 'black')
  vsWebRTCClient.sendMessage(
    $room,
    partner,
    JSON.stringify({
      channel: 'boardStart'
    }),
    false,
    'device'
  )
}

function sendWhiteboardEnd() {
  clientDebug('Client', 'ホワイトボード終了', 'black')
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      channel: 'boardEnd'
    }),
    false,
    'device'
  )
}

/*********************************************
 *                  setEnd
 *********************************************/
function disconnect() {
  isInRoom = false
  vsWebRTCClient.disconnect()

  if ($room != undefined) {
    vsWebRTCClient.leaveRoom($room)
    // vsWebRTCClient.disconnect()
    vsWebRTCClient.stopStream(['video', 'audio', 'screen'])
  }

  document.getElementById('share_video').muted = true

  vsWebRTCClient
    .getLocalStream('device')
    .getTracks()
    ?.forEach((track) => {
      track.enabled = false
      track.stop()
    })

  localStreamCopy?.getTracks()?.forEach((track) => {
    track.enabled = false
    track.stop()
  })
  localStream?.getTracks()?.forEach((track) => {
    track.enabled = false
    track.stop()
  })
  deviceStream?.getTracks()?.forEach((track) => {
    track.enabled = false
    track.stop()
  })
}

/*********************************************
 *                 Listener
 *********************************************/
function onMakeStreamFail(errorMsg, type) {
  clientDebug(
    'Client',
    'onMakeStreamFail【' + type + '】 : ' + errorMsg,
    'black'
  )
  if (errorMsg.toString().indexOf('NotAllowedError') != -1) {
  }
}

var remoteStream
var isFirst = true
var changeStreamID

function onRemoteStreamChanged(room, partner, stream) {
  if (isInRoom) {
    if (onRemoteStreamChanged) {
      clientDebug('Client', 'onRemoteStreamChanged', 'blue')
      changeStreamID = stream.id
      var b = vsWebRTCClient.getRemoteStream(
        room,
        partner,
        'screen' + partner.getUID()
      )
      if (b != undefined) {
        vsWebRTCClient.showStream(screenElement, b)
        // screenElement.srcObject = b
      }

      return
    }
  }
}

var screenElement = document.getElementById('share_video')
screenElement.addEventListener('loadeddata', function () {
  var promise = screenElement.play()
  promise
    .catch((error) => {
      screenElement.pause()
      debugLog(
        'screenElement',
        'このページはメディアの自動再生が許可されていません。',
        'black'
      )
      $('.autoplay-modal').fadeIn(200)
      return
    })
    .then(() => {
      debugLog('screenElement', '自動再生に成功しました。', 'green')
    })
})

function onMessage(room, partner, msg) {
  if (isInRoom) {
    var msgObj = JSON.parse(msg)
    if (msg != undefined && msgObj.channel != undefined) {
      switch (msgObj.channel) {
        case 'system': //音量調整
          clientDebug('Client', 'system-message', 'black')
          Converter.changeVolumn(partner.getName(), msgObj.max_volume)
          break
        case 'chat': //チャット送信
          clientDebug('Client', 'chat-message', 'black')
          if (msgObj.chatId)
            Converter.recvChat(
              partner.getName(),
              msgObj.text,
              msgObj.time,
              msgObj.chatId
            )
          else Converter.recvChat(partner.getName(), msgObj.text, msgObj.time)
          scrollControl(document.getElementById('chat-area'), 'end')

          break
        case 'record': //チャット送信
          // clientDebug('Client', 'chat-message', 'black')
          Converter.recvRecorBubble(partner.getName(), msgObj.text, msgObj.time)
          scrollControl(document.getElementById('chat-area'), 'end')

          break
        case 'delete_chat': //チャット送信
          Converter.recvDeleteBubble()
          scrollControl(document.getElementById('chat-area'), 'end')

          break
        case 'chat_file': //チャット送信
          clientDebug('Client', 'chat-file', 'black')
          Converter.recvChatFile(
            partner.getName(),
            msgObj.text,
            msgObj.time,
            msgObj.chatId,
            msgObj.fileLink
          )
          scrollControl(document.getElementById('chat-area'), 'end')

          break
        case 'remove_chat': //チャット送信
          clientDebug('Client', 'remove-chat', 'black')
          Converter.removeChat(msgObj.text)
          scrollControl(document.getElementById('chat-area'), 'end')

          break
        case 'info':
          clientDebug('Client', 'chat-message', 'black')
          Converter.recvInfo(partner.getName(), msgObj.type, msgObj.time)
          break
        case 'status': //マイクの状態
          clientDebug('Client', 'status-message', 'black')
          Converter.changeStatus(partner.getName(), msgObj.use_mic)
          break
        case 'cameraStatus': //camera status
          clientDebug('Client', 'status-message', 'black')
          Converter.changeCamStatus(partner.getName(), msgObj.use_cam)
          break
        case 'recordStatus': //camera status
          clientDebug('Client', 'status-message', 'black')
          Converter.changeRecordStatus(partner.getName(), msgObj.use_record)
          break
        case 'shareStart': //画面共有開始
          clientDebug('Client', 'shareStart-message', 'black')
          Converter.startShareScreen(msgObj.spot_user)
          break
        case 'shareEnd': //画面共有終了
          clientDebug('Client', 'shareEnd-message', 'black')
          Converter.endShareScreen()
          break
        case 'boardStart': //ホワイトボード書き込み処理
          clientDebug('Client', 'whiteboardStart-message', 'black')
          Converter.changeWhiteboard()
          break
        case 'boardEnd': //ホワイトボード書き込み処理
          clientDebug('Client', 'whiteboardEnd-message', 'black')
          Converter.endWhiteboard()
          break
        case 'board': //ホワイトボード書き込み処理
          // console.log(msgObj.msg)
          board.onRemoteEvent(msgObj.msg)
          break
        case 'changeLowStream':
          if (canvasStream) return
          navigator.mediaDevices
            .getUserMedia({
              video: {
                width: { ideal: 256 },
                height: { ideal: 144 },
                frameRate: 30
              }
            })
            .then(function (stream) {
              if ($('#toggle-camera').prop('checked')) {
                var videoTrack = stream.getTracks().find(function (s) {
                  return s.kind == 'video'
                })
                videoTrack.enabled = false
              }
              changeVideoStream(stream)
              vsWebRTCClient.setLocalStream('device', stream)
            })
            .catch(function (err) {
              clientDebug('ストリーム作成', err, 'black')
            })
          break
        case 'canvasData': //ホワイトボード書き込み処理
          var imgCanvas = new Image()
          destroyLoading()

          if (msgObj.type) {
            imgCanvas.onload = localDrawCanvasImageOnload
          } else {
            imgCanvas.onload = remoteDrawCanvasImageOnload
          }

          imgCanvas.src = msgObj.canvasData

          // img.onload = function () {
          //   var canvas
          //   if (msgObj.type) {
          //     canvas = document.getElementById('localDrawCanvas')
          //   } else {
          //     canvas = document.getElementById('remoteDrawCanvas')
          //   }
          //   var ctx = canvas.getContext('2d')
          //   //ctx.drawImage(img, 0, 0, 840, 1188)
          //   // var canvasElement = document.getElementById('draw')
          //   // document.getElementById('draw_parent').scrollTo(0, 0)
          //   // $('#draw').width('100%')
          //   // $('#draw').height($('#draw').width() * canvas_ratio)
          //   // board.setDefaultDrawWidth($('#draw').width())
          //   // board.setRatio(
          //   //   old_width / canvasElement.clientWidth,
          //   //   old_height / canvasElement.clientHeight
          //   // )
          //   ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          // }
          break
        case 'canvasDataPages': //ホワイトボード書き込み処理
          if (msgObj.type) {
            cumulativesum_recvlocal += msgObj.page
            canvasData_recvlocal[msgObj.page - 1] = msgObj.canvasData
            if (cumulativesum_recvlocal == cumulativesum_pdf) {
              var canvasDataLocal = ''
              for (var i = 1; i <= numPages; i++) {
                canvasDataLocal = canvasDataLocal + canvasData_recvlocal[i - 1]
              }
              var localDrawCanvasImage = new Image()
              localDrawCanvasImage.onload = localDrawCanvasImageOnload
              localDrawCanvasImage.src = canvasDataLocal
            }
          } else {
            cumulativesum_recvremote += msgObj.page
            canvasData_recvremote[msgObj.page - 1] = msgObj.canvasData
            if (cumulativesum_recvremote == cumulativesum_pdf) {
              var canvasDataRemote = ''
              for (var i = 1; i <= numPages; i++) {
                canvasDataRemote =
                  canvasDataRemote + canvasData_recvremote[i - 1]
              }
              var remoteDrawCanvasImage = new Image()
              remoteDrawCanvasImage.onload = remoteDrawCanvasImageOnload
              remoteDrawCanvasImage.src = canvasDataRemote
            }
          }
          break
        case 'numPages':
          numPages = msgObj.numPages
          resetCanvasDataInMemory()
          break
        case 'canvasMultiDataPages': //ホワイトボード書き込み処理
          if (msgObj.type) {
            canvasDataLocal_array[msgObj.page - 1] = msgObj.canvasData
          } else {
            canvasDataRemote_array[msgObj.page - 1] = msgObj.canvasData
          }
          break
        case 'pagetodisplay':
          if (
            !isloadingCavas &&
            !isloadingCavasBackground &&
            !isloadingCavasLocal &&
            !isloadingCavasRemote
          ) {
            isloadingCavas = true
            updateButtonPrevNext()
            saveCanvasToMemory()
            pagetodisplay = msgObj.page
            renderPageFromMemory()
          }
          break
        case 'textbookShare':
          getCategoryList()
          textbookChannel = 'textbookShare'

          break
        case 'peer-online':
          if (msgObj.type == 'request') {
            vsWebRTCClient.sendMessage(
              $room,
              $partner,
              JSON.stringify({
                type: 'response',
                channel: 'peer-online'
              }),
              false,
              'device'
            )
          } else if (msgObj.type == 'response') {
            peerResponse = true
          }
          break

        case 'listTextBook':
          $('#material-content').hide()
          $('#material-list').show()

          getDataTextBookList(msgObj.categoryId, msgObj.titleEN, msgObj.titleJA)

          titleEN = msgObj.titleEN
          titleJA = msgObj.titleJA
          categoryId = msgObj.categoryId
          textbookChannel = 'listTextBook'
          break
        case 'backtoTextBook':
          $('#material-content').show()
          resetTextbookList()
          $('#material-list').hide()

          getCategoryList()

          textbookChannel = 'backtoTextBook'
          break
        case 'backtoListTextBook':
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

          getDataTextBookList(msgObj.categoryId, msgObj.titleEN, msgObj.titleJA)

          textbookChannel = 'listTextBook'
          categoryId = msgObj.categoryId
          titleEN = msgObj.titleEN
          titleJA = msgObj.titleJA

          break

        case 'recvTextbook':
          if (msgObj.isTextBook) {
            isTextBook = msgObj.isTextBook
          }

          showTextbookHtml({
            textbookURL: msgObj?.textbookURL,
            textSelection: msgObj?.textSelection,
            textbookPDF: msgObj?.textbookPDF,
            fileNameTextbook: msgObj.fileNameTextbook,
            isMe: false
          })

          isChatShare = msgObj.isChatShare
          categoryId = msgObj.categoryId
          titleEN = msgObj.titleEN
          titleJA = msgObj.titleJA
          fileNameTextbook = msgObj.fileNameTextbook

          textSelection = msgObj?.textSelection
          textbookURL = msgObj?.textbookURL
          textbookPDF = msgObj?.textbookPDF
          textbookChannel = 'recvTextbook'
          break

        case 'textbookLoaded':
          if ($partner) {
            vsWebRTCClient.sendMessage(
              $room,
              $partner,
              JSON.stringify({
                textSelection: newSelection,
                channel: 'selectionText'
              }),
              false,
              'device'
            )
          }
          break
        case 'sendReRenderTextbook':
          if ($partner) {
            vsWebRTCClient.sendMessage(
              $room,
              $partner,
              JSON.stringify({
                textSelection: newSelection,
                channel: 'selectionText'
              }),
              false,
              'device'
            )
          }
          break
        case 'recvPDFURL': // awsのPDFファイルの場合
          // loading('#draw_parent', true)

          isChatShare = msgObj.isChatShare
          tempUrlTextBook = msgObj.canvasURL
          fileNameTextbook = msgObj.fileName
          if (msgObj.isTextBook) {
            isTextBook = msgObj.isTextBook
          }
          if (isChatShare) {
            $('#btn-pen').show()
            $('#btn-eraser').show()
            $('#toggle-board').prop('checked', isChatShare)
            $('#toggle-textbook').prop('checked', !isChatShare)
          }
          // if (msgObj.numPages) {
          //   resetCanvasData(msgObj.numPages)
          // } else {
          //   resetCanvasData(0)
          // }
          hideButtonPrevNext()
          showBackTextbook(false)

          loading('#draw_parent', true)
          var loadingTask = pdfjsLib.getDocument(msgObj.canvasURL)
          loadingTask.promise
            .then(function (pdf) {
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

              //resetCanvasDataInMemory()
              if (!msgObj.numPages) {
                resetCanvasDataInMemory()
              }
              //pagetodisplay = 1
              if (msgObj.pagetodisplay) {
                pagetodisplay = msgObj.pagetodisplay
                currPage = pagetodisplay
              } else {
                pagetodisplay = 1
              }
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
              canvas = document.getElementById('backgroundCanvas')
              var ctx = canvas.getContext('2d')
              ctx.drawImage(img, 0, 0, 840, 1188)
              var canvasElement = document.getElementById('draw')
              document.getElementById('draw_parent').scrollTo(0, 0)
              $('#draw').width('100%')
              $('#draw').height($('#draw').width() * canvas_ratio)
              board.setDefaultDrawWidth($('#draw').width())
              board.setRatio(
                old_width / canvasElement.clientWidth,
                old_height / canvasElement.clientHeight
              )
            }
            img.src = canvas.toDataURL()
            // loading('#draw_parent', false)
          })
          */
            })
            .catch((error) => {
              loading('#draw_parent', false)
            })
          //
          break
        case 'canvasDelete': //ホワイトボードの初期化
          resetCanvas()
          resetBackCanvas()
          break
        case 'file': //ファイル送信(仮)
          const url = msgObj.file
          let reader = new FileReader()
          reader.readAsDataURL(files[0])
          reader.onload = function () {}
          const a = document.createElement('a')
          document.body.appendChild(a)
          a.download = msgObj.file.name
          a.href = url
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        case 'mode': //モードの変更通知
          nextmode = msgObj.modeType
          acceptChangeView(false)
          mode = msgObj.modeType
          // isChatShare = msgObj.isChatShare
          // if (mode === 5) {
          //   loading('#draw_parent', true)
          // }
          break
        case 'resetIsChatShare':
          isChatShare = false
          break
        case 'textmode': //教材共有用の変更通知
          nextmode = msgObj.modeType
          viewTextURL = msgObj.viewTextURL
          acceptChangeView(false)
          mode = msgObj.modeType
          break
        case 'note':
          if (note.checkInit) {
            msgObj.content = note.contentNoteApi
            note.onReceiveMessage(msgObj)
            // loadHistoryNote($room.getRoomName(), msgObj)
            note.checkInit = false
          } else {
            note.onReceiveMessage(msgObj)
          }
          break
        case 'send-file':
          isChatShare = msgObj.isChatShare
          if (isChatShare) {
            $('#btn-pen').show()
            $('#btn-eraser').show()
          }
          if (msgObj.type == 'notify') {
            onReceiveStartSendingFile(
              msgObj.name,
              msgObj.size,
              msgObj.meta,
              msgObj.id,
              msgObj.fileLink
            )
          } else if (msgObj.type == 'accept') {
            onAcceptStartSending()
          } else if (msgObj.type == 'show') {
            tempUrlImage = msgObj.id
            fileNameTextbook = msgObj.fileName
            setTimeout(() => {
              showToWhiteboard(msgObj.is_pdf, msgObj.id)
            }, 1000)
          }
          break

        case 'send-file-done':
          sendWhiteboard(partner)

        case 'chat_pdf_img':
          showFileOnChatContent(
            msgObj.chatId,
            msgObj.filename,
            null,
            false,
            partner.getName(),
            msgObj.fileLink
          )

          // setTimeout(() => {
          //   scrollControl(document.getElementById('chat-area'), 'end')
          // }, 1000)
          break
        case 'scrollToBottomChat':
          setTimeout(() => {
            scrollControl(document.getElementById('chat-area'), 'end')
          }, 1000)
          break
        case 'saveImage':
          isTextBook = msgObj.isTextBook

          tempUrlImage = msgObj.canvasURL
          break
        case 'assignTextBook':
          isTextBook = msgObj.isTextBook
          isChatShare = msgObj.isChatShare
          if (isChatShare) {
            $('#btn-pen').show()
            $('#btn-eraser').show()
            $('#toggle-board').prop('checked', isChatShare)
            $('#toggle-textbook').prop('checked', !isChatShare)
          }
          break

        case 'selectionText':
          console.log(msgObj.textSelection, 'selection B')
          partnerSelected({
            selectObj: msgObj.textSelection,
            partnerUserType: msgObj.textSelection?.userType
          })
          break
        case 'extendLayout':
          // isExtend = msgObj.isExtend
          // if (isExtend && isMobile() && (window.innerWidth < 500 || isIpad())) {
          //   console.log(isIpad(), 'isIpad')
          //   changeExtendLayout({ isMe: false })
          // } else if (
          //   !isExtend &&
          //   isMobile() &&
          //   (window.innerWidth < 500 || isIpad())
          // ) {
          //   resetExtendLayout({ isMe: false })
          // }
          break
        case 'exitRoom':
          logoutRoomV2(msgObj.name)
          chatRegister(2, getTimeData(), false, msgObj.name)
          break
        case 'joinRoom':
          if (msgObj.checkLoadDataChat) {
            createInfoBubble(msgObj.name, 'join', undefined, false)
            scrollControl(document.getElementById('chat-area'), 'end')
          } else {
            if (!checkOnConnectSuccess) chatRecovery()
          }
          break
        case 'onSoundVideoShare':
          document.getElementById('share_video').muted = false
          break
        case 'stopShareSound':
          var streamSrc = document.getElementById('share_video').srcObject
          var audioTrackSrc = streamSrc.getAudioTracks()[0]

          // Ngừng phát sóng track âm thanh
          if (audioTrackSrc) audioTrackSrc.stop()
          break
        case 'stopShareScreen':
          vsWebRTCClient.stopStream(['screen'])

          break
        case 'restart':
          setTimeout(() => {
            if (!JoinWithoutCam && getQueryString()['mode'] !== 'sfu') restart()
          }, 2000)
          break
        case 'showTextDisconectCam':
          $('#disconnectCamJP').text(`${msgObj.name}のカメラ接続が切れました。`)
          $('#disconnectCamEN').text(
            `${msgObj.name}'s camera connection has been lost.`
          )
          $('#WrapperDisconnectCam').css('display', 'block')
          break
        case 'hiddenTextDisconectCam':
          $('#WrapperDisconnectCam').css('display', 'none')
          break
        case 'showTextJoinWithoutCam':
          $('#WrapperDisconnectCam').css('display', 'block')
          break
      }
    }
  }
}

const loadHistoryNote = function (roomId, msgObj) {
  // this.disableEditor(true);
  fetch(`${URL_LESSON_ROOM}/note_get?room_id=${roomId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  })
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      if (data.result == 0) {
        msgObj.content = data.log.note
        note.onReceiveMessage(msgObj)
      }
    })
    .catch((err) => {})
    .finally(() => {
      // this.disableEditor(false);
    })
}

var isRestore = false
var isReconnect = false
function onData(room, partner, data) {
  onReceiveFileData(data.data, partner.name)
}

//EVENT
function onEventError(errorMsg) {
  clientDebug('Client', 'onEventError:' + errorMsg, 'black')
}

//CONNECTION
async function onConnectSuccess() {
  if (isInRoom) {
    if (isReconnect) isReconnectStream = true
    isReconnect = false
    loginRoom()
    clientDebug('Client', 'onConnectSuccess', 'black')
    if (vsWebRTCClient.isConnected()) {
      // -> next onJoinRoomSuccess
      if (!isReconnect) {
        checkOnConnectSuccess = true

        await chatRegisterAwait(1, getTimeData(), true, nickName)
        await chatRecovery()
        scrollControl(document.getElementById('chat-area'), 'end')
      }

      vsWebRTCClient.joinRoom(
        Converter.getRoomName(),
        Converter.getMyUserName(),
        {
          type: 'teacher',
          isMobile: isMobile()
        }
      )
    }

    if (JoinWithoutCam) {
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          channel: 'restart'
        }),
        false,
        'device'
      )
    }
  }
}
function reconnect() {
  if (isReconnect) {
    setTimeout(function () {
      vsWebRTCClient.connect()
    }, 5000)
  }
}

function onConnectFail(msg) {
  clientDebug('Client', 'onConnectFail', 'black')
  if (isExit) return
  vsWebRTCClient.memberLeave()
  isReconnect = true
  $('#btn_connect').text('Connect')
  document.getElementById('loader').style.visibility = 'visible'
  reconnect()
}

function onDisconnected() {
  logoutRoom()
  clientDebug('Client', 'onDisconnected', 'black')
  // chatRegister(2, getTimeData())
  $('#btn_connect').text('Connect')
  $('#btn_join').text('Join')
  $('#btn-hangup').hide()
  $('#btn_join').hide()
  isJoined = false
  $('#otherClients').empty()
}

//ROOM
function onJoinRoomFail(roomName, msg) {
  clientDebug('Client', 'onJoinRoomFail', 'black')
}

//自分が入室に成功した。
function onJoinRoomSuccess(room) {
  if (isInRoom) {
    clientDebug('Client', 'onJoinRoomSuccess', 'black')
    $room = room
  }

  // chatRecovery().then(function (result) {
  //   createInfoBubble(nickName, 'join', undefined, false)
  //   chatRegister(1, getTimeData())
  // })
  //createInfoBubble(msgObj.username , msgObj.message, msgObj.time);
  //wait <- onMemberJoin
}

//自分が退室に成功した。
function onLeaveRoomSuccess(room) {
  if (isExit) return
  clientDebug('Client', 'onLeaveRoomSuccess', 'black')
  vsWebRTCClient.memberLeave()
  isReconnect = true
  document.getElementById('loader').style.visibility = 'visible'
  reconnect()
}

function onLeaveRoomFail(roomName, msg) {
  clientDebug('Client', 'onLeaveRoomFail', 'black')
}

function onRoomInfoChanged(room) {
  clientDebug('Client', 'onRoomInfoChanged', 'black')
}

function onMemberJoin(room, user) {
  if (isInRoom) {
    clientDebug('Client', 'onMemberJoin', 'black')

    // wait <- acceptResponse
    // send -> onBeCalled
    vsWebRTCClient.call(room, user)
    //参加してきた時、ホワイトボードだったら
    /*
    if(isWhiteboardHost){
      sendWhiteboardStart(user);
      sendWhiteboard(user);
    }*/
    // createInfoBubble(user.getUID(), 'join', undefined, false)
  }
}

function onMemberLeave(room, user) {
  clientDebug('Client', 'onMemberLeave', 'black')

  unMarkFunc({
    isMe: false,
    partnerUserType: userType === 'teacher' ? 'student' : 'teacher'
  })

  if ($partner != undefined && $partner.getUID() == user.getUID()) {
    Converter.changeStatus($partner.getName(), false)
  }
  if ($partner != undefined && $partner.getUID() == user.getUID()) {
    Converter.changeCamStatus($partner.getName(), false)
  }
  $('#remoteName').text('')
  document.getElementById('remoteVideo').srcObject = undefined
  remoteStream = undefined
  $partner = undefined
  removeMember(user.getUID())
  createInfoBubble(user.getUID(), 'exit', undefined, true)
  isAccept = false
  if (!isScreenShare && mode == 2) {
    vsWebRTCClient.stopMediaCommunication(
      $room,
      $partner,
      'screen' + user.getUID()
    )
    $('#toggle-screenshare').prop('checked', false)
    modeChange(0)
    screenElement.srcObject = undefined
    $('#draw_component').hide()
    $('#share-contents').hide()
    $('#materialSelect-contents').hide()
    $('#video-contents').show()
    videoContentsView(false)
  }
  if (streamInterval) clearInterval(streamInterval)
  document.getElementById('internet-network').style.visibility = 'hidden'

  // }
}

function onOnline(room, user) {
  clientDebug('Client', 'onOnline', 'black')
}

function onOffline(room, user) {
  clientDebug('Client', 'onOffline', 'black')
  if ($partner != undefined && $partner.getUID() == user.getUID()) {
    Converter.changeStatus($partner.getName(), false)
  }
  if ($partner != undefined && $partner.getUID() == user.getUID()) {
    Converter.changeCamStatus($partner.getName(), false)
  }
  $('#remoteName').text('')
  document.getElementById('remoteVideo').srcObject = undefined
  remoteStream = undefined
  $partner = undefined
  removeMember(user.getUID())
  createInfoBubble(user.getUID(), 'exit', undefined, true)
  isAccept = false
  if (!isScreenShare && mode == 2) {
    vsWebRTCClient.stopMediaCommunication(
      $room,
      $partner,
      'screen' + user.getUID()
    )
    $('#toggle-screenshare').prop('checked', false)
    modeChange(0)
    screenElement.srcObject = undefined
    $('#draw_component').hide()
    $('#share-contents').hide()
    $('#materialSelect-contents').hide()
    $('#video-contents').show()
    videoContentsView(false)
  }
  // }
  if (streamInterval) clearInterval(streamInterval)
  document.getElementById('internet-network').style.visibility = 'hidden'
}

//CALL
function onCallSuccess(room, partner, stream) {
  clientDebug('Client', 'onCallSuccess', 'black')
}

function onResponseSuccess(room, partner, stream) {
  clientDebug('Client', 'onResponseSuccess', 'black')
  // next onRemoteStreamChanged
  // send -> onRemoteStreamChanged
  //vsWebRTCClient.startMediaCommunication(room, partner, "device");
}

function onHangupFail(room, partner) {
  clientDebug('Client', 'onHangupFail', 'black')
}

function onHangupSuccess(room, partner) {
  clientDebug('Client', 'onHangupSuccess', 'black')
  /*
  $('.call').show();
  $('#btn-hangup').hide();
  $('.rtc').hide();
  */
}

function onCallFail(room, partner, errorMsg) {
  clientDebug('Client', 'onCallFail', 'black')
}

function onBeAccepted(room, acceptor) {
  if (isInRoom) {
    clientDebug('Client', 'onBeAccepted', 'black')
    vsWebRTCClient.startMediaCommunication(room, acceptor, 'device')
    isAccept = true
  }
}

function onBeRejected(room, acceptor) {
  clientDebug('Client', 'onBeRejected', 'black')
}

function onBeCalled(room, caller) {
  if (isInRoom) {
    clientDebug('Client', 'onBeCalled', 'black')
    // send -> onBeAccepted
    // next onResponseSuccess
    vsWebRTCClient.response(room, caller)
    //$partner.push(caller);
    $partner = caller
    // if (!JoinWithoutCamFirst) {
    //   JoinWithoutCamFirst = false
    // }
  }
}

function onHungup(room, acceptor) {
  clientDebug('Client', 'onHungup', 'black')
  $('.controls').hide()

  $('.call').show()
  $('#btn-hangup').hide()
}

function onResponseFail(room, partner, msg) {
  clientDebug('Client', 'onResponseFail', 'black')
}

function onMediaCommunicationOpened(room, partner) {
  clientDebug('Client', 'onMediaCommunicationOpened', 'black')

  $partner = partner
  if ($('#toggle-mic').prop('checked')) {
    setTimeout(function () {
      sendStatus($('#toggle-mic').prop('checked')) // status mic
    }, 1000)
  }

  if ($('#toggle-camera').prop('checked')) {
    setTimeout(function () {
      sendCameraStatus($('#toggle-camera').prop('checked')) // status cam
    }, 1000)
  }
  // Reload white board
}
var sessionCount = 0
var isLogSend = false
var isReconnectStream = false
var countTime = 0
var remoteVideo = document.getElementById('remoteVideo')
var videoCurrentTime = 0
const isStreamPlaying = (video) => {
  if (isInRoom) {
    const videoTrack = video.srcObject?.getVideoTracks()[0]
    if (remoteVideo.currentTime == 0)
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          type: 'reconnect',
          channel: 'peer-online'
        }),
        false,
        'device'
      )
    return videoTrack && videoTrack?.readyState == 'live'
  } else {
    return true
  }
}
var peerResponse = false
const checkReceivingStream = () => {
  if ($partner) {
    if (!isStreamPlaying(remoteVideo)) countTime++
    else {
      countTime = 0
      document.getElementById('loader').style.visibility = 'hidden'
      document.getElementById('internet-network').style.visibility = 'hidden'
      peerResponse = false
    }
    if (countTime == 1) {
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          type: 'request',
          channel: 'peer-online'
        }),
        false,
        'device'
      )
    }
    if (countTime == 3) {
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          type: 'request',
          channel: 'peer-online'
        }),
        false,
        'device'
      )
      if (peerResponse)
        document.getElementById('internet-network').style.visibility = 'visible'
    } else if (countTime == 6) {
      if (peerResponse)
        document.getElementById('loader').style.visibility = 'visible'
      document.getElementById('internet-network').style.visibility = 'hidden'
    } else if (countTime == 7) {
      document.getElementById('loader').style.visibility = 'hidden'
      if (peerResponse) location.reload()
    }
  } else peerResponse = false
}

var streamInterval
async function onOpen(room, partner) {
  // if (isInRoom) {
  $partner = partner
  if (streamInterval) clearInterval(streamInterval)
  // streamInterval = setInterval(checkReceivingStream, 1000)
  if (!isReconnectStream) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        checkLoadDataChat: checkOnConnectSuccess,
        name: nickName,
        channel: 'joinRoom'
      }),
      false,
      'device'
    )
  }

  AllChat = false
  sessionCount++
  clientDebug('Client', 'onOpen', 'black')
  var a = vsWebRTCClient.getRemoteStream(room, partner, 'device')
  var b = vsWebRTCClient.getRemoteStream(
    room,
    partner,
    'screen' + partner.getUID()
  )
  var name = partner.getName()
  if (a && a.id == changeStreamID) {
    var result = Object.keys(member).find(function (key) {
      return member[key]['name'] == name
    })
    if (isReconnectStream) {
      createVideoElement(a, name, name, true, true, false)
    } else if (result == undefined) {
      //デバイスセッション ----------
      isLogSend = false
      $('#remoteName').text(name)
      remoteStream = a
      addMember(name)

      createVideoElement(a, name, name, true, true, false)
    }
  } else {
    a = b
  }
  if (isMobile()) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        channel: 'changeLowStream'
      }),
      'device'
    )
  }
  if (b && b.id == changeStreamID) {
    //画面共有
    var targetElement = document.getElementById('share_video')
    //iosの場合音声を取り除く
    if (isIOS() && isSafari() && b.getAudioTracks().length > 1) {
      b.removeTrack(b.getAudioTracks()[0])
    }
    vsWebRTCClient.showStream(targetElement, b)
    remoteStream = b
  }

  changeStreamID = undefined

  setTimeout(() => {
    sendStatus(!useMic)
    sendCameraStatus(!useCamera) // status cam
    if (!isMobile()) {
      sendRecordStatus($('#toggle-record').prop('checked'))
    }
  }, 1000)

  if (isMobile() && isExtend && (window.innerWidth < 500 || isIpad())) {
    if ($partner) {
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
  if (!isReconnectStream)
    if (mode === 1) {
      setTimeout(function () {
        vsWebRTCClient.sendMessage(
          room,
          partner,
          JSON.stringify({
            modeType: 1,
            channel: 'mode'
          }),
          false,
          'device'
        )
        sendWhiteboard(partner)
        setMode(toolModeCanvas)
      }, 1000)
    } else if (mode === 2) {
      // Reload share Screen
      if (isAccept && isScreenShare) {
        isAccept = false
        setTimeout(function () {
          if (isScreenShare) {
            vsWebRTCClient.startMediaCommunication(
              room,
              partner,
              'screen' + nickName
            )
            vsWebRTCClient.sendMessage(
              room,
              partner,
              JSON.stringify({
                modeType: 2,
                channel: 'mode'
              }),
              false,
              'device'
            )
          }
        }, 1000)
      }
    } else if (mode === 3) {
      console.log('textbookChannel', textbookChannel)
      setTimeout(function () {
        if (textbookChannel === 'textbookShare') {
          sendSignalGetTextBook()
        } else if (textbookChannel === 'listTextBook') {
          // nextmode = 3
          modeChange(3)
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
        }
      }, 1000)
    } else if (mode === 5) {
      //Reload Textbook
      console.log(isChatShare)
      setTimeout(function () {
        vsWebRTCClient.sendMessage(
          room,
          partner,
          JSON.stringify({
            modeType: 5,
            isChatShare,
            channel: 'mode'
          }),
          false,
          'device'
        )

        setMode(toolModeCanvas) // set current tool
      }, 1000)
      // isTextBook: true -> set url TextBook for screen
      // isTextBook: false -> set url image on chat for screen

      if (isTextBook) {
        setTimeout(function () {
          if (isChatShare) {
            sendMultiCanvasPages(partner)
            vsWebRTCClient.sendMessage(
              room,
              partner,
              JSON.stringify({
                canvasURL: tempUrlTextBook,
                fileName: fileNameTextbook,
                isTextBook,
                numPages: numPages,
                pagetodisplay: pagetodisplay,
                isChatShare: true,
                channel: 'recvPDFURL'
              }),
              false,
              'device'
            )
          }

          if (textbookChannel === 'recvTextbook' && !isChatShare) {
            if ($partner) {
              vsWebRTCClient.sendMessage(
                $room,
                $partner,
                JSON.stringify({
                  textbookURL,
                  textSelection: newSelection,
                  textbookPDF,
                  isTextBook: true,
                  categoryId,
                  titleEN,
                  titleJA,
                  fileNameTextbook,
                  isChatShare,
                  channel: 'recvTextbook'
                }),
                false,
                'device'
              )
            }
          }
        }, 1000)
        // setTimeout(function () {
        //   sendMultiCanvasPages(partner)
        // }, 1000)
      } else {
        setTimeout(function () {
          notifyUseAsBgWhiteboard(0, tempUrlImage, fileNameTextbook)

          // setTimeout(function () {
          //   sendWhiteboard(partner)
          // }, 1000)
          vsWebRTCClient.sendMessage(
            room,
            partner,
            JSON.stringify({
              isTextBook: false,
              isChatShare: true,
              channel: 'assignTextBook'
            }),
            false,
            'device'
          )
        }, 1000)
      }
    }

  if (isReconnectStream) {
    setTimeout(() => {
      document.getElementById('loader').style.visibility = 'hidden'
      isReconnectStream = false
    }, 1000)
  }

  if (JoinWithoutCam && JoinWithoutCamFirst) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        channel: 'restart'
      }),
      false,
      'device'
    )
    JoinWithoutCamFirst = false
  }

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

  if (JoinWithoutCam) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        channel: 'showTextJoinWithoutCam'
      }),
      false,
      'device'
    )
  }
}

// const saveNote = function () {
//   let content = document.getElementById('editor').innerHTML

//   var data = JSON.stringify({
//     room_id: $room.getRoomName(),
//     note: content
//   })
//   fetch(`${URL_LESSON_ROOM}/note_register`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: data
//   })
//     .then((response) => {
//       return response.json()
//     })
//     .then((data) => {})
//     .catch((err) => {
//
//     })
// }

function onClose(room, partner) {
  clientDebug('Client', 'onClose', 'black')

  // saveNote()

  // if (--sessionCount == 0) {
  //   if (
  //     $('toggle-fullscreenpartner').prop('checked') ||
  //     $('toggle-fullshare').prop('checked')
  //   ) {
  //     document.exitFullscreen()
  //   }
  //   $('#remoteName').text('')
  //   document.getElementById('remoteVideo').srcObject = undefined
  //   remoteStream = undefined
  //   $partner = undefined
  //   removeMember(partner.getUID())
  //   createInfoBubble(partner.getUID(), 'exit', undefined, false)
  //   isAccept = false
  //   if (!isScreenShare && mode == 2) {
  //     vsWebRTCClient.stopMediaCommunication(
  //       $room,
  //       $partner,
  //       'screen' + partner.getUID()
  //     )
  //     $('#toggle-screenshare').prop('checked', false)
  //     modeChange(0)
  //     screenElement.srcObject = undefined
  //     //ホーム画面に戻す
  //     $('#draw_component').hide()
  //     $('#share-contents').hide()
  //     $('#materialSelect-contents').hide()
  //     $('#video-contents').show()
  //     videoContentsView(false)
  //   }
  // }

  return
}

function onMediaCommunicationError(room, partner, errorMsg) {
  clientDebug('Client', 'onMediaCommunicationError', 'red')
}

var record = false
var remoteRecorder = undefined
// var recordingMedia.value = 'record-audio-plus-screen';
//録画

$('#btn_record').on('click', function () {
  // alert('AAAAAAAA')

  if (!record) {
    if (remoteRecorder == undefined) {
      remoteRecorder = new Recorder(
        $room,
        $room.getMyUser(),
        localStream,
        new RecordingListener({
          onError: function (room, targetUser, msg) {
            clientDebug('Recoed', msg, 'black')
          },
          onStart: function (room, targetUser, msg) {
            clientDebug('Recoed', 'start record.', 'green')
          },
          onStop: function (room, targetUser, msg) {
            //停止した通知
            if (
              remoteStream == undefined &&
              !$('#toggle-record').prop('checked')
            ) {
              var text
              if (languageType % 2 == 1) {
                text = '録画を完了しました。'
              } else {
                text = 'Recording is complete.'
              }
              jsFrame.showToast({
                html: text,
                align: 'center',
                style: {
                  borderRadius: '5px'
                },
                duration: 2000
              })
              $('#toggle-record').prop('checked', false)
            }
            clientDebug('Recoed', 'stop record.', 'green')
            var dateTime = new Date()
            var year = dateTime.getFullYear()
            var month = addDigit(dateTime.getMonth() + 1)
            var day = addDigit(dateTime.getDate())
            var hour = addDigit(dateTime.getHours())
            var min = addDigit(dateTime.getMinutes())
            var date = year + '' + month + '' + day + '' + hour + '' + min
            var url = window.URL.createObjectURL(
              remoteRecorder.getCurrentData()
            )
            var a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = date + '.webm'
            document.body.appendChild(a)
            a.click()
            setTimeout(function () {
              document.body.removeChild(a)
              window.URL.revokeObjectURL(url)
            }, 100)
          },
          onPause: function (room, targetUser, msg) {
            //
          },
          onResume: function (room, targetUser, msg) {
            //
          },
          onDataAvailable: function (room, targetUser, msg) {
            //
          }
        })
      )
    }
    remoteRecorder.start()
    var text
    if (languageType % 2 == 1) {
      text = '録画を開始しました。'
    } else {
      text = 'Recording has started.'
    }
    jsFrame.showToast({
      html: text,
      align: 'center',
      style: {
        borderRadius: '5px'
      },
      duration: 2000
    })
    $('#rec-jp').text('録画停止')
    $('#rec-en').text('Stop Record')
    record = true
  } else {
    remoteRecorder.stop()
    $('#rec-jp').text('録画')
    $('#rec-en').text('Record')
    record = false
  }
  return
  if (remoteStream == undefined && !$('#toggle-record').prop('checked')) {
    var text
    if (languageType % 2 == 1) {
      text = '通話相手がいない為、<br>録画出来ません。'
    } else {
      text = 'Recording is not possible because there is no partner.'
    }
    jsFrame.showToast({
      html: text,
      align: 'center',
      style: {
        borderRadius: '5px'
      },
      duration: 2000
    })
    $('#toggle-record').prop('checked', false)
    return false
  }
  if (!record) {
    if (remoteRecorder == undefined) {
      remoteRecorder = new Recorder(
        $room,
        $room.getMyUser(),
        remoteStream,
        new RecordingListener({
          onError: function (room, targetUser, msg) {
            clientDebug('Recoed', msg, 'black')
          },
          onStart: function (room, targetUser, msg) {
            clientDebug('Recoed', 'start record.', 'green')
          },
          onStop: function (room, targetUser, msg) {
            //停止した通知
            if (
              remoteStream == undefined &&
              !$('#toggle-record').prop('checked')
            ) {
              var text
              if (languageType % 2 == 1) {
                text = '録画を完了しました。'
              } else {
                text = 'Recording is complete.'
              }
              jsFrame.showToast({
                html: text,
                align: 'center',
                style: {
                  borderRadius: '5px'
                },
                duration: 2000
              })
              $('#toggle-record').prop('checked', false)
            }
            clientDebug('Recoed', 'stop record.', 'green')
            var dateTime = new Date()
            var year = dateTime.getFullYear()
            var month = addDigit(dateTime.getMonth() + 1)
            var day = addDigit(dateTime.getDate())
            var hour = addDigit(dateTime.getHours())
            var min = addDigit(dateTime.getMinutes())
            var date = year + '' + month + '' + day + '' + hour + '' + min
            var url = window.URL.createObjectURL(
              remoteRecorder.getCurrentData()
            )
            var a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = date + '.webm'
            document.body.appendChild(a)
            a.click()
            setTimeout(function () {
              document.body.removeChild(a)
              window.URL.revokeObjectURL(url)
            }, 100)
          },
          onPause: function (room, targetUser, msg) {
            //
          },
          onResume: function (room, targetUser, msg) {
            //
          },
          onDataAvailable: function (room, targetUser, msg) {
            //
          }
        })
      )
    }
    remoteRecorder.start()
    var text
    if (languageType % 2 == 1) {
      text = '録画を開始しました。'
    } else {
      text = 'Recording has started.'
    }
    jsFrame.showToast({
      html: text,
      align: 'center',
      style: {
        borderRadius: '5px'
      },
      duration: 2000
    })
    $('#rec-jp').text('録画停止')
    $('#rec-en').text('Stop Record')
    record = true
  } else {
    remoteRecorder.stop()
    $('#rec-jp').text('録画')
    $('#rec-en').text('Record')
    record = false
  }
})

// キャンバス

function setSize() {
  var canvasList = []

  canvasList.push(document.getElementById('localDrawCanvas'))
  canvasList.push(document.getElementById('remoteDrawCanvas'))
  canvasList.push(document.getElementById('localPointerCanvas'))
  canvasList.push(document.getElementById('remotePointerCanvas'))
  canvasList.push(document.getElementById('draw'))
  /*
  var canvas_pw = $('#main-contents').width() - 10;
  var canvas_ph = $('#main-contents').height() - 10;
  */
  canvasList.forEach(function (canvas) {
    canvas.width = 800
    canvas.height = 600
  })
}

//board
var board

function initBoard() {
  board = new Board(
    document.querySelector('#localDrawCanvas'),
    document.querySelector('#remoteDrawCanvas'),
    document.querySelector('#localPointerCanvas'),
    document.querySelector('#remotePointerCanvas'),
    document.querySelector('#backgroundCanvas'),
    document.querySelector('#draw')
  )
  boardListener.onEvent = function (event, data) {
    //$partner.forEach(function(partner) {
    if ($partner != undefined) {
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          channel: 'board',
          msg: {
            event: event,
            data: data
          }
        }),
        'device'
      )
    }
    //});
  }
}

function videoConstraints(deviceId) {
  this.deviceId
  this.height
  this.width
  this.frameRate
  this.facingMode
  this.aspectRaito
  this.brightness
  this.colorTemperature
  this.contrast
  this.exposureCompensation
  this.exposureMode
  this.exposureTime
  this.groupId
  this.resizeMode
  this.saturation
  this.sharpness
  this.whiteBalanceMode
  ;(this.__construct = function () {
    this.deviceId = deviceId
    this.width = 640
    this.height = 360
    this.frameRate = 30
  }),
    (this.getConstraints = function () {
      return {
        video: {
          deviceId:
            null != this.deviceId
              ? {
                  exact: this.deviceId
                }
              : null,
          width: {
            ideal: null != this.width ? this.width : null
          },
          height: {
            ideal: null != this.height ? this.height : null
          },
          frameRate: {
            ideal: null != this.frameRate ? this.frameRate : null
          }
        }
      }
    }),
    (this.changeDeviceId = function (deviceId) {
      this.deviceId = deviceId
    }),
    (this.getDeviceId = function () {
      return this.deviceId
    }),
    this.__construct()
}

function audioConstraints(deviceId) {
  this.deviceId
  this.autoGainControl
  this.echoCancellation
  this.noiseSuppression
  this.highpassFilter
  this.audioMirroring
  this.channelCount
  this.groupId
  this.latency
  this.sampleRate
  this.sampleSize
  ;(this.__construct = function () {
    this.deviceId = deviceId
    this.autoGainControl = true
    this.echoCancellation = true
    this.noiseSuppression = true
    this.highpassFilter = false
    this.audioMirroring = true
  }),
    (this.getConstraints = function () {
      var e
      e = {
        audio: {
          deviceId:
            null != this.deviceId
              ? {
                  exact: this.deviceId
                }
              : 'default'
        }
      }
      if (this.echoCancellation != null) {
        e.audio.echoCancellation = {
          ideal: this.echoCancellation
        }
      }
      if (this.autoGainControl != null) {
        e.audio.autoGainControl = {
          ideal: this.autoGainControl
        }
      }
      if (this.noiseSuppression != null) {
        e.audio.noiseSuppression = {
          ideal: this.noiseSuppression
        }
      }
      return e
    }),
    (this.changeDeviceId = function (deviceId) {
      this.deviceId = deviceId
    }),
    this.__construct()
}

function screenConstraints(audio) {
  this.cursor // always・motion・never
  this.displaySurface // application・browser・monitor・window
  this.logocalSurface // true・false
  this.audio // true・false
  ;(this.__construct = function () {
    this.cursor = 'motion'
    this.displaySurface = 'window'
    this.logocalSurface = 'false'
    this.audio = audio
  }),
    (this.getConstraints = function () {
      return {
        video: {
          cursor: this.cursor,
          displaySurface: this.displaySurface,
          logocalSurface: this.logocalSurface
        },
        audio: this.audio
      }
    }),
    this.__construct()
}
