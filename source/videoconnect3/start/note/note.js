const { Subject, ReplaySubject, debounceTime, distinctUntilChanged } = rxjs
let checkPointer
const sendMessage = function (content) {
  checkPointer = true
  if (!$partner) return
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      content: content,
      mode: 'content',
      channel: 'note'
    }),
    false,
    'device'
  )
  // this.lockChanged$.next(false);
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

function Note() {
  this.editor
  this.editorSelector
  this.roomName
  this.contentChanged$
  this.lockChanged$
  this.content
  this.contentNoteApi
  this.checkInit
  this.checkFirst
  this.arrayPointer
  this.__construct = function () {
    this.contentChanged$ = new Subject()
    this.lockChanged$ = new ReplaySubject(false)
    this.arrayPointer = [0, 0]
    // this.contentChanged$.pipe(
    //   distinctUntilChanged(),
    //   debounceTime(500)
    // ).subscribe(val => {
    //   this.sendMessage(val);
    // });

    // this.lockChanged$.pipe(
    //   distinctUntilChanged(),
    // ).subscribe(val => {
    //   this.sendLock(val);
    // });
  }

  this.init = function (editorSelector, toolbarSelector) {
    this.editorSelector = editorSelector
    DecoupledEditor.create(document.querySelector(this.editorSelector), {
      toolbar: ['bold', 'italic', 'underline']
    })
      .then((editor) => {
        const toolbarContainer = document.querySelector(toolbarSelector)
        toolbarContainer.appendChild(editor.ui.view.toolbar.element)
        this.editor = editor
        this.checkInit = true
        this.checkFirst = true
        this.listenEvents()
        let sessionParam = getQueryString()
        let decodedString = atob(sessionParam['session'])
        let param = getQueryStringFromDecodeURL(decodedString)
        let roomId = param['room_id']
        this.roomName = roomId
        this.loadHistory(roomId)
      })
      .catch((error) => {})
  }

  this.listenEvents = function () {
    this.editor.model.document.on('change', (eventInfo, batch) => {
      if (this.checkFirst) {
        this.lockChanged$.next(true)
        sendMessage(this.editor.getData())
        this.checkFirst = false
        this.checkPointer = false
      }
    })

    this.editor.listenTo(
      this.editor.editing.view.document,
      'click',
      (evt, data) => {
        const selection = this.editor.model.document.selection
        const range = selection.getFirstPosition().path
        this.arrayPointer = range
      }
    )

    this.editor.editing.view.document.on('keyup', () => {
      const selection = this.editor.model.document.selection
      const range = selection.getFirstPosition().path
      this.arrayPointer = range
      this.lockChanged$.next(true)
      sendMessage(this.editor.getData())
    })

    $('#toolbar-container').click(function () {
      const data = document.getElementById('editor').innerHTML
      sendMessage(data)
    })
  }

  this.exportToCSV = function () {
    let csvData = ''
    $(this.editorSelector + ' p').each(function () {
      if ($(this).text().trim() != '') {
        var data = $(this).html()
        /*
          data = replaceAll(data, '<br>', "\n");
          data = replaceAll(data, '<strong>', "");
          data = replaceAll(data, '</strong>', "");
          data = replaceAll(data, '<i>', "");
          data = replaceAll(data, '</i>', "");
          data = replaceAll(data, '<u>', "");
          data = replaceAll(data, '</u>', "");
          */
        data = data.replaceAll('<br>', '\n')
        data = data.replaceAll('<strong>', '')
        data = data.replaceAll('</strong>', '')
        data = data.replaceAll('<i>', '')
        data = data.replaceAll('</i>', '')
        data = data.replaceAll('<u>', '')
        data = data.replaceAll('</u>', '')
        csvData = csvData + data + '\n'
      }
    })

    return csvData
  }

  // this.disableEditor = function(isDisable) {
  //   this.editor.isReadOnly = isDisable
  //     if (isDisable) {
  //       document.querySelector( this.editorSelector ).style.opacity = 0.5;
  //     }
  //     else {
  //       document.querySelector( this.editorSelector ).style.opacity = 1;
  //     }
  // }

  // this.sendLock = function(isLock) {
  //   if(!$partner) return;
  //   vsWebRTCClient.sendMessage($room, $partner, JSON.stringify({
  //     "val": isLock,
  //     "mode": "lock",
  //     "channel": "note"
  //   }), false, "device");
  // }

  this.onReceiveMessage = function (msg) {
    if (msg.content && msg.content.length === 0) {
      this.arrayPointer = [0, 0]
    }
    if (msg.mode == 'content') {
      if (msg.content === this.editor.getData()) return
      this.editor.setData(msg.content)
    } else if (msg.mode == 'lock') {
      this.editor.config.readOnly = msg.val
      // this.disableEditor(msg.val);
    }
    try {
      this.editor.model.change((writer) => {
        writer.setSelection(
          writer.createPositionFromPath(
            this.editor.model.document.getRoot(),
            this.arrayPointer,
            'toNone'
          )
        )
      })
    } catch (e) {
      this.editor.model.change((writer) => {
        writer.setSelection(
          writer.createPositionAt(this.editor.model.document.getRoot(), 'end')
        )
      })
    }
  }

  this.loadHistory = function (roomId) {
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
          this.contentNoteApi = data.log.note
        } else {
          this.contentNoteApi = ''
        }
      })
      .catch((err) => {
        this.contentNoteApi = ''
      })
      .finally(() => {
        // this.disableEditor(false);
      })
  }

  this.__construct()
}
