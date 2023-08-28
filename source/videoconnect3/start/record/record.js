;(function () {
  var params = {},
    r = /([^&=]+)=?([^&]*)/g

  function d(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '))
  }

  var match,
    search = window.location.search
  while ((match = r.exec(search.substring(1)))) {
    params[d(match[1])] = d(match[2])

    if (d(match[2]) === 'true' || d(match[2]) === 'false') {
      params[d(match[1])] = d(match[2]) === 'true' ? true : false
    }
  }

  window.params = params
})()

function addStreamStopListener(stream, callback) {
  stream.addEventListener(
    'ended',
    function () {
      callback()
      callback = function () {}
    },
    false
  )
  stream.addEventListener(
    'inactive',
    function () {
      callback()
      callback = function () {}
    },
    false
  )
  stream.getTracks().forEach(function (track) {
    track.addEventListener(
      'ended',
      function () {
        callback()
        callback = function () {}
      },
      false
    )
    track.addEventListener(
      'inactive',
      function () {
        callback()
        callback = function () {}
      },
      false
    )
  })
}

var video = document.createElement('video')
video.controls = false
var mediaElement = getHTMLMediaElement(video, {
  title: 'Recording status: inactive',
  buttons: ['full-screen' /*, 'take-snapshot'*/],
  showOnMouseEnter: false,
  width: 360
})
document.getElementById('recording-player').appendChild(mediaElement)

var div = document.createElement('section')
mediaElement.media.parentNode.appendChild(div)
mediaElement.media.muted = false
mediaElement.media.autoplay = true
mediaElement.media.playsinline = true
div.appendChild(mediaElement.media)

var recordingPlayer = mediaElement.media

var mimeType = 'video/webm;codecs=vp9'
var fileExtension = 'webm'
var type = 'video/webm;codecs=vp9'
var recorderType
var defaultWidth
var defaultHeight
var recording = $('#toggle-record').prop('checked')
var btnExit = document.getElementById('btn_exit')
var btnRecord = document.querySelector('#btn_recording')
var btnRecordPlay = document.querySelector('#btn_recording_playing')
var button = btnRecord
function changeStatusRecord() {
  recording = false
  $('#toggle-record').prop('checked', false)
  $('#toggle-record-playing').prop('checked', true)
  document.getElementById('record-button-playing').style.display = 'none'
  document.getElementById('record-button').style.display = 'block'
}
$(window).on('beforeunload', function () {
  if (!isDownloadFileChat) {
    button?.recordRTC?.stopRecording(function (url) {
      changeStatusRecord()
      saveToDiskOrOpenNewTab(button.recordRTC)
      stopStream()
      recordingLog()
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
    })
  } else {
    setTimeout(function () {
      isDownloadFileChat = false
    }, 1000)
  }
})
btnRecordPlay.onclick = function (event) {
  button.recordRTC.stopRecording(function (url) {
    changeStatusRecord()
    saveToDiskOrOpenNewTab(button.recordRTC)
    stopStream()
    sendMessageRecord()
  })
}

btnRecord.onclick = function (event) {
  var localConfirm = localStorage.getItem('checkConfirmRecord')
  if (localConfirm == 'true') {
    var commonConfig = {
      onMediaCaptured: function (stream) {
        $('#toggle-record').prop('checked', true)
        $('#toggle-record-playing').prop('checked', false)
        document.getElementById('record-button-playing').style.display = 'block'
        document.getElementById('record-button').style.display = 'none'
        button.stream = stream
        if (button.mediaCapturedCallback) {
          button.mediaCapturedCallback()
        }
        recording = true
        button.disabled = false
      },
      onMediaStopped: function () {
        $('#toggle-record').prop('checked', false)
        $('#toggle-record-playing').prop('checked', true)
        recording = false
        if (!button.disableStateWaiting) {
          button.disabled = false
        }
      },
      onMediaCapturingFailed: function (error) {
        if (
          error.toString().indexOf('no audio or video tracks available') !== -1
        ) {
          alert(
            'RecordRTC failed to start because there are no audio or video tracks available.'
          )
        }
        if (
          error.name === 'PermissionDeniedError' &&
          DetectRTC.browser.name === 'Firefox'
        ) {
          alert('Firefox requires version >= 52. Firefox also requires HTTPs.')
        }
        commonConfig.onMediaStopped()
      }
    }
    captureAudioPlusScreen(commonConfig)
    button.mediaCapturedCallback = function () {
      var options = {
        type: type,
        mimeType: mimeType,
        disableLogs: params.disableLogs || false,
        getNativeBlob: false, // enable it for longer recordings
        video: recordingPlayer
      }
      if (recorderType) {
        options.recorderType = recorderType
        if (
          recorderType == WhammyRecorder ||
          recorderType == GifRecorder ||
          recorderType == WebAssemblyRecorder
        ) {
          options.canvas = options.video = {
            width: defaultWidth || 320,
            height: defaultHeight || 240
          }
        }
      }
      options.ignoreMutedMedia = false
      button.recordRTC = RecordRTC(button.stream, options)
      button.recordRTC.startRecording()
    }
  } else {
    $('.record-modal').fadeIn(FADE_SPEED)
  }
}
$('#recording_accept').on('click', function () {
  localStorage.setItem(
    'checkConfirmRecord',
    document.querySelector('#check_record').checked
  )
  var commonConfig = {
    onMediaCaptured: function (stream) {
      $('#toggle-record').prop('checked', true)
      $('#toggle-record-playing').prop('checked', false)
      document.getElementById('record-button-playing').style.display = 'block'
      document.getElementById('record-button').style.display = 'none'
      button.stream = stream
      if (button.mediaCapturedCallback) {
        button.mediaCapturedCallback()
      }
      recording = true
      button.disabled = false
    },
    onMediaStopped: function () {
      $('#toggle-record').prop('checked', false)
      $('#toggle-record-playing').prop('checked', true)
      recording = false
      if (!button.disableStateWaiting) {
        button.disabled = false
      }
    },
    onMediaCapturingFailed: function (error) {
      if (
        error.toString().indexOf('no audio or video tracks available') !== -1
      ) {
        alert(
          'RecordRTC failed to start because there are no audio or video tracks available.'
        )
      }
      if (
        error.name === 'PermissionDeniedError' &&
        DetectRTC.browser.name === 'Firefox'
      ) {
        alert('Firefox requires version >= 52. Firefox also requires HTTPs.')
      }
      commonConfig.onMediaStopped()
    }
  }
  captureAudioPlusScreen(commonConfig)
  button.mediaCapturedCallback = function () {
    var options = {
      type: type,
      mimeType: mimeType,
      disableLogs: params.disableLogs || false,
      getNativeBlob: false, // enable it for longer recordings
      video: recordingPlayer
    }
    if (recorderType) {
      options.recorderType = recorderType
      if (
        recorderType == WhammyRecorder ||
        recorderType == GifRecorder ||
        recorderType == WebAssemblyRecorder
      ) {
        options.canvas = options.video = {
          width: defaultWidth || 320,
          height: defaultHeight || 240
        }
      }
    }
    options.ignoreMutedMedia = false
    button.recordRTC = RecordRTC(button.stream, options)
    button.recordRTC.startRecording()
  }
})
$('#recording_reject').on('click', function () {
  $('#toggle-record').prop('checked', false)
  $('#toggle-record-playing').prop('checked', true)
  $('.record-modal').fadeOut(FADE_SPEED)
  return false
})
$('.record-modal-close').on('click', function () {
  $('#toggle-record').prop('checked', false)
  $('#toggle-record-playing').prop('checked', true)
  $('.record-modal').fadeOut(FADE_SPEED)
  return false
})

function sendMessageRecord() {
  var data = {
    room_id: roomName,
    username: nickName,
    message: 'stop',
    start_time: getTimeData()
  }
  fetch(`${URL_LESSON_ROOM}/chatregister`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(function (response1) {
      return response1.json()
    })
    .then(function (data1) {
      var json = JSON.stringify(data1)
      var parsed = JSON.parse(json)
      if (parsed.result == 0) {
        //正常な処理
        debugLog('chatRegister', 'Done', 'orange')
      } else {
        errorLog(parsed.error_code, parsed.error_message['room_id'])
      }
    })
    .catch(function (e) {
      debugLog('chatRegister', 'error!', 'red')
    })
  createRecordBubble(Converter.getMyUserName(), 'stop', undefined)
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
function stopStream() {
  if (button.stream && button.stream.stop) {
    button.stream.stop()
    button.stream = null
  }
  videoBitsPerSecond = null
}
function getFileName(fileExtension) {
  var dateTime = new Date()
  var date = '' + dateTime.getFullYear()
  date += addDigit(dateTime.getMonth() + 1)
  date += addDigit(dateTime.getDate())
  date += addDigit(dateTime.getHours())
  date += addDigit(dateTime.getMinutes())
  date += addDigit(dateTime.getSeconds())
  return 'Eigox_Lesson_' + date + '.' + fileExtension
}

function saveToDiskOrOpenNewTab(recordRTC) {
  if (!recordRTC.getBlob().size) {
    alert('Error! Try later!')
  }
  var fileName = getFileName(fileExtension)
  var file = new File([recordRTC.getBlob()], fileName, {
    type: 'video/webm;codecs=vp9'
  })
  invokeSaveAsDialog(file, file.name)
  // window.open(videoURL);
}

// function getURL(arg) {
//   var url = arg

//   if (arg instanceof Blob || arg instanceof File) {
//     url = URL.createObjectURL(arg)
//   }

//   if (arg instanceof RecordRTC || arg.getBlob) {
//     url = URL.createObjectURL(arg.getBlob())
//   }

//   if (arg instanceof MediaStream || arg.getTracks) {
//     // url = URL.createObjectURL(arg);
//   }

//   return url
// }
const mergeAudioStreams = (
  desktopStream,
  voiceStream,
  callStream,
  shareStream
) => {
  const context = new AudioContext()
  const destination = context.createMediaStreamDestination()
  let hasDesktop = false
  let hasVoice = false
  let hasCall = false
  let hasShare = false

  if (desktopStream && desktopStream.getAudioTracks().length > 0) {
    // If you don't want to share Audio from the desktop it should still work with just the voice.
    const source1 = context.createMediaStreamSource(desktopStream)
    const desktopGain = context.createGain()
    desktopGain.gain.value = 0.7
    source1.connect(desktopGain).connect(destination)
    hasDesktop = true
  }
  if (voiceStream && voiceStream.getAudioTracks().length > 0) {
    const source2 = context.createMediaStreamSource(voiceStream)
    const voiceGain = context.createGain()
    voiceGain.gain.value = 0.7
    source2.connect(voiceGain).connect(destination)
    hasVoice = true
  }
  if (callStream && callStream.getAudioTracks().length > 0) {
    const source3 = context.createMediaStreamSource(callStream)
    const voiceGain = context.createGain()
    voiceGain.gain.value = 0.7
    source3.connect(voiceGain).connect(destination)
    hasCall = true
  }
  if (shareStream && shareStream.getAudioTracks().length > 0) {
    const source4 = context.createMediaStreamSource(shareStream)
    const voiceGain = context.createGain()
    voiceGain.gain.value = 0.7
    source4.connect(voiceGain).connect(destination)
    hasShare = true
  }

  return hasDesktop || hasVoice || hasCall || hasShare
    ? destination.stream.getAudioTracks()
    : []
}
async function captureAudioPlusScreen(config) {
  if (navigator.mediaDevices.getDisplayMedia) {
    let callStream = document.getElementById('remoteVideo').srcObject
    let shareStream = document.getElementById('share_video').srcObject
    let desktopStream = await navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: true
      })
      .catch(function (error) {
        config.onMediaCapturingFailed(error)
        return
      })
    // let voiceStream = await navigator.mediaDevices.getUserMedia({
    //   video: false,
    //   audio: true
    // })
    let voiceStream = document.getElementById('localVideo').srcObject

    if (desktopStream) {
      const tracks = [
        ...desktopStream.getVideoTracks(),
        ...mergeAudioStreams(
          desktopStream,
          voiceStream,
          callStream,
          shareStream
        )
      ]
      stream = new MediaStream(tracks)
      config.onMediaCaptured(stream)
      addStreamStopListener(stream, function () {
        // btnRecord.onclick()
        btnRecordPlay.onclick()
      })
      var data = {
        room_id: roomName,
        username: nickName,
        message: 'start',
        start_time: getTimeData()
      }
      fetch(`${URL_LESSON_ROOM}/chatregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(function (response1) {
          return response1.json()
        })
        .then(function (data1) {
          var json = JSON.stringify(data1)
          var parsed = JSON.parse(json)
          if (parsed.result == 0) {
            //正常な処理
            debugLog('chatRegister', 'Done', 'orange')
          } else {
            errorLog(parsed.error_code, parsed.error_message['room_id'])
          }
        })
        .catch(function (e) {
          debugLog('chatRegister', 'error!', 'red')
        })
      createRecordBubble(Converter.getMyUserName(), 'start', undefined)
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          text: 'start',
          channel: 'record'
        }),
        false,
        'device'
      )
    }
  } else {
    var error =
      'Record screen are not supported in smartphone and Internet Explorer!!\nSupported with browser Edge, Chrome, Safari, Firefox'
    config.onMediaCapturingFailed(error)
    alert(error)
  }
}
