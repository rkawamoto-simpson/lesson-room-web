const recordButton = document.getElementById('btn_recording')
const localVideoElement = document.getElementById('localVideo')
const remoteVideoElement = document.getElementById('remoteVideo')
const shareVideoElement = document.getElementById('share_video')
const btnRecordAccept = document.getElementById('recording_accept')
const btnRecordReject = document.getElementById('recording_reject')

let shouldStop = false
let stopped = false
let localVoiceStream
let remoteVoiceStream
let shareVoiceStream
let audioTrack
let isManualStop
let recording
let stream = null
let audioDestination
let tracks
let displayStream

$('#btn_exit').on('click', () => {
  if (recording) {
    recording = false
    shouldStop = true
    isManualStop = true

    sendRecordStatus(false)
  }
})

recordButton.addEventListener('click', () => {
  if (document.getElementById('loader').style.visibility == 'visible') return
  if ($('#toggle-record').prop('checked')) {
    recording = false
    shouldStop = true
    isManualStop = true
  } else {
    const localConfirm = localStorage.getItem('checkConfirmRecord')

    if (localConfirm === 'true') {
      startRecord()
    } else {
      $('.record-modal').fadeIn(FADE_SPEED)
    }
  }
})

btnRecordReject.addEventListener('click', () => {
  $('.record-modal').fadeOut(FADE_SPEED)
  $('#toggle-record').prop('checked', false)
})

btnRecordAccept.addEventListener('click', () => {
  localStorage.setItem('checkConfirmRecord', $('#check_record').prop('checked'))
  $('.record-modal').fadeOut(FADE_SPEED)
  startRecord()
})

const startRecord = () => {
  // if (localVoiceStream) {
  //   localVoiceStream.addTrack(audioTrack)
  // }
  isManualStop = false
  recordScreen()
}
function getSeekableBlob(inputBlob, mimeType, callback) {
  var reader = new EBML.Reader()
  var decoder = new EBML.Decoder()
  var tools = EBML.tools
  var fileReader = new FileReader()
  fileReader.onload = function (e) {
    var ebmlElms = decoder.decode(this.result)
    ebmlElms.forEach(function (element) {
      reader.read(element)
    })
    reader.stop()
    var refinedMetadataBuf = tools.makeMetadataSeekable(
      reader.metadatas,
      reader.duration,
      reader.cues
    )
    var body = this.result.slice(reader.metadataSize)
    var newBlob = new Blob([refinedMetadataBuf, body], {
      type: mimeType
    })
    callback(newBlob)
  }
  fileReader.readAsArrayBuffer(inputBlob)
}

const downloadRecordedVideo = (blob, stream, displayStream) => {
  recordedChunks = []
  const filename = getFileName()
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = `${filename}.webm`
  downloadLink.click()
  $('.toast').toast('show')
  downloadLink.remove()

  shouldStop = true

  // Stop sharing
  stream.getTracks().forEach((track) => track.stop())
  displayStream.getTracks().forEach((track) => track.stop())

  // Send notification
  sendMessageRecord('stop')
}
const stopRecord = (mimeType, recordedChunks, stream, displayStream) => {
  if (recordedChunks) {
    // Download record video
    const blob = new Blob(recordedChunks, { type: mimeType })
    if (!isMac()) {
      getSeekableBlob(blob, mimeType, function (blob) {
        downloadRecordedVideo(blob, stream, displayStream)
      })
    } else {
      downloadRecordedVideo(blob, stream, displayStream)
    }
  }

  // Uncheck record
  $('#toggle-record').prop('checked', false)
  if (converterDone(Converter.sendRecordStatus)) {
    Converter.sendRecordStatus($('#toggle-record').prop('checked'))
  }
  recording = false
}

const handleRecord = ({ stream, mimeType }, displayStream) => {
  //send record status
  if (converterDone(Converter.sendRecordStatus)) {
    Converter.sendRecordStatus($('#toggle-record').prop('checked'))
  }

  let recordedChunks = []
  stopped = false
  const mediaRecorder = new MediaRecorder(stream)

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data)
    }

    if (shouldStop === true && stopped === false) {
      mediaRecorder.stop()
      stopped = true
    }
  }
  mediaRecorder.onstop = () => {
    if (isManualStop) {
      stopRecord(mimeType, recordedChunks, stream, displayStream)
    }
  }

  stream.getVideoTracks()[0].onended = () => {
    isManualStop = false
    stopRecord(mimeType, recordedChunks, stream, displayStream)
  }

  window.addEventListener('beforeunload', (e) => {
    isManualStop = false
    if (!shouldStop) {
      stopRecord(mimeType, recordedChunks, stream, displayStream)
    }
  })

  mediaRecorder.start(200)
}

const recordScreen = async () => {
  const mimeType = 'video/webm'
  shouldStop = false
  recording = true

  if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
    return window.alert('Screen Record not supported!')
  }

  localVoiceStream = localStreamCopy
  remoteVoiceStream = remoteVideoElement.srcObject
  shareVoiceStream = shareVideoElement.srcObject

  audioTrack = localVoiceStream.getAudioTracks()[0]

  displayStream = await navigator.mediaDevices
    .getDisplayMedia({
      video: { cursor: 'motion', width: 1920, height: 1080 },
      audio: { echoCancellation: false }
    })
    .then((rs) => {
      sendMessageRecord('start')
      return rs
    })
    .catch((err) => {
      stopRecord()
      //localVoiceStream.removeTrack(audioTrack)

      throw err
    })

  audioTrack.enabled = useMic

  audioDestination = mergeAudioStreams(
    localVoiceStream,
    remoteVoiceStream,
    shareVoiceStream,
    displayStream
  )

  tracks = [
    ...displayStream.getVideoTracks(),
    ...audioDestination.stream.getTracks()
  ]

  //localVoiceStream.removeTrack(audioTrack)

  stream = new MediaStream(tracks)

  handleRecord({ stream, mimeType }, displayStream)
}

const sendMessageRecord = (status) => {
  recordingLog(status)
  createRecordBubble(Converter.getMyUserName(), status, undefined)
  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        text: status,
        channel: 'record'
      }),
      false,
      'device'
    )
  }
}

const mergeAudioStreams = (...audioStreams) => {
  const audioContext = new AudioContext()
  const audioDestination = audioContext.createMediaStreamDestination()

  audioStreams.forEach((stream) => {
    if (stream?.getAudioTracks().length > 0) {
      const userAudio = audioContext.createMediaStreamSource(stream)
      userAudio.connect(audioDestination)
    }
  })

  return audioDestination
}

const getFileName = () => {
  var dateTime = new Date()
  var date = '' + dateTime.getFullYear()
  date += addDigit(dateTime.getMonth() + 1)
  date += addDigit(dateTime.getDate())
  date += addDigit(dateTime.getHours())
  date += addDigit(dateTime.getMinutes())
  date += addDigit(dateTime.getSeconds())

  const dateTimeRecord = `${moment(new Date())
    .tz('Asia/Tokyo')
    .format('YYYYMMDDHHmmss')}`

  return 'Eigox_Lesson_' + dateTimeRecord
}
