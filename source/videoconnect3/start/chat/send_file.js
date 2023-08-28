//send
//var currentSendFile;
var currentSendFiles = []
const fileStatus = {
  PREPARING: 'preparing',
  SENDING: 'sending',
  SENT: 'sent'
}
function upload(files, data) {
  const { id: idEl, username, file_link } = data
  var file = files
  filename = file.name
  currentSendFiles.push({
    file: file,
    status: fileStatus.PREPARING,
    fileLink: file_link
  })
  var fileReader = new FileReader()
  fileReader.onload = (function (e) {
    return function (event) {
      showFileOnChatContent(
        idEl,
        file.name,
        event.target.result,
        true,
        username,
        file_link
      )
      notifyStartSendingFile(idEl)
    }
  })(file)

  fileReader.readAsDataURL(file)
}
function notifyStartSendingFile(idEl) {
  if (!$room || !$partner) return
  currentSendFiles.forEach((obj) => {
    if (obj.status == fileStatus.PREPARING) {
      vsWebRTCClient.sendMessage(
        $room,
        $partner,
        JSON.stringify({
          name: obj.file.name,
          size: obj.file.size,
          meta: obj.file.type,
          id: idEl,
          fileLink: obj.fileLink,
          type: 'notify',
          channel: 'send-file'
        }),
        false,
        'device'
      )
      obj.status = fileStatus.SENDING
    }
  })
}

function onAcceptStartSending() {
  currentSendFiles.forEach((obj) => {
    if (obj.status == fileStatus.SENDING) {
      sendFileToPartner(obj.file)
    }
    obj.status = fileStatus.SENT
  })
  currentSendFiles = currentSendFiles.filter(
    (obj) => obj.status !== fileStatus.SENT
  )
}

function sendFileToPartner(file) {
  if (file) {
    const chunkSize = 166384
    fileReader = new FileReader()
    let offset = 0
    fileReader.addEventListener('error', (error) =>
      console.error('Error reading file:', error)
    )
    fileReader.addEventListener('abort', (event) =>
      console.log('File reading aborted:', event)
    )
    fileReader.addEventListener('load', (e) => {
      if ($partner != undefined) {
        vsWebRTCClient.sendData($room, $partner, e.target.result, 'device')
      }
      offset += e.target.result.byteLength
      if (offset < file.size) {
        readSlice(offset)
      }
    })
    const readSlice = (o) => {
      const slice = file.slice(offset, o + chunkSize)
      fileReader.readAsArrayBuffer(slice)
    }
    readSlice(0)
  }
}

function notifyUseAsBgWhiteboard(isPdf, idEl) {
  if (!$room || !$partner) return
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      fileName: fileNameTextbook,
      is_pdf: isPdf,
      id: idEl,
      isChatShare,
      type: 'show',
      channel: 'send-file'
    }),
    false,
    'device'
  )
}

//receive
var currentReceiveFileSize
var currentReceiveFileName
var currentReceiveFileType
var currentReceiveElId
var currentReceiveFileLink

let receiveBuffer = []
let receivedSize = 0

function onReceiveStartSendingFile(name, size, type, elId, fileLink) {
  currentReceiveFileSize = size
  currentReceiveFileName = name
  currentReceiveFileType = type
  currentReceiveElId = elId
  currentReceiveFileLink = fileLink

  acceptStartSendingFile()
}

function acceptStartSendingFile() {
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      type: 'accept',
      channel: 'send-file'
    }),
    false,
    'device'
  )
}

const convertPDFtoImage = (fileLink) => {
  var isPdfFileExt = /(\.pdf)$/i
  if (isPdfFileExt.exec(currentReceiveFileName)) {
    var loadingTask = pdfjsLib.getDocument(fileLink)
    var img = new Image()

    loadingTask.promise.then(function (pdf) {
      //Dummy Canvas
      var canvas = document.createElement('canvas')
      renderPage(canvas, pdf, 1, function pageRenderingComplete() {
        img.src = canvas.toDataURL()
      })
    })
    return img
  }
  return false
}

function onReceiveFileData(buffer, username) {
  receiveBuffer.push(buffer)
  receivedSize += buffer.byteLength
  if (receivedSize === currentReceiveFileSize) {
    // debugger
    // const received = new Blob(receiveBuffer, { type: currentReceiveFileType })
    receiveBuffer = []
    receivedSize = 0
    currentReceiveFileSize = 0
    showFileOnChatContent(
      currentReceiveElId,
      currentReceiveFileName,
      // window.URL.createObjectURL(received),
      convertPDFtoImage(currentReceiveFileLink),
      false,
      username,
      currentReceiveFileLink
    )
  }
}
