const getCurrentDateTime = () => {
  let dateTime = new Date()
  let year = dateTime.getFullYear()
  let month = addDigit(dateTime.getMonth() + 1)
  let day = addDigit(dateTime.getDate())
  let hour = addDigit(dateTime.getHours())
  let min = addDigit(dateTime.getMinutes())
  let second = addDigit(dateTime.getSeconds())

  return '' + year + month + day + hour + min + second
}

const partnerSelected = ({ selectObj, partnerUserType }) => {
  unMarkFunc({ isMe: false, partnerUserType })

  // Init
  let selection = document.getSelection()
  const {
    // commonAncestorContainer,
    anchor,
    anchorOffset,
    focus,
    focusOffset,
    isCollapsed,
    text
  } = selectObj

  console.log(selectObj)

  const anchorParentEl =
    anchor?.parentElementID &&
    document.querySelector(`#${anchor.parentElementID}`)
  const focusParentEl =
    focus?.parentElementID &&
    document.querySelector(`#${focus.parentElementID}`)
  // console.log('anchorParentEl', anchorParentEl)
  // console.log('focusParentEl', focusParentEl)

  // Find anchor node
  const anchorNode =
    anchorParentEl &&
    [...anchorParentEl?.childNodes].find(
      (item) => item.textContent === anchor.textContent
    )
  // Find focus node
  const focusNode =
    focusParentEl &&
    [...focusParentEl?.childNodes].find(
      (item) => item.textContent === focus.textContent
    )

  console.log('Anchor node', anchorNode)
  console.log('Focus node', focusNode)

  // Add selection
  if (anchorNode && focusNode) {
    selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset)
    // Highlight
    highlight(
      '',
      partnerUserType === 'teacher' ? 'teacher-selection' : 'student-selection'
    )

    selection.removeAllRanges()
  }
}

const getTextSelected = () => {
  let selection = null
  let text = ''
  if (typeof window.getSelection != 'undefined') {
    selection = window.getSelection()
    text = selection.toString()
  } else if (typeof document.selection != 'undefined') {
    selection = document.selection
    text = selection.createRange().text
  }

  const {
    anchorNode,
    focusNode,
    anchorOffset,
    focusOffset,
    rangeCount,
    isCollapsed
  } = selection || {}

  // const range = selection.rangeCount > 0 && selection?.getRangeAt(0)

  newSelection = {
    anchor: {
      textContent: anchorNode?.textContent,
      length: anchorNode?.length,
      parentElementClass: anchorNode?.parentElement.className,
      parentElementID: anchorNode?.parentElement.id
    },
    focus: {
      textContent: focusNode?.textContent,
      length: focusNode?.length,
      parentElementClass: focusNode?.parentElement.className,
      parentElementID: focusNode?.parentElement.id
    },
    // commonAncestorContainer: {
    //   commonAncestorContainerClass: range.commonAncestorContainer.className,
    //   commonAncestorContainerText: range.commonAncestorContainer.innerText,
    //   commonAncestorContainerParent:
    //     range.commonAncestorContainer.parentElement.className
    // },
    anchorOffset,
    focusOffset,
    rangeCount,
    isCollapsed,
    text,
    userType
  }

  unMarkFunc({ isMe: true })
  highlight(
    '',
    userType === 'teacher' ? 'teacher-selection' : 'student-selection'
  )
  return newSelection
}

const stripHtml = (htmlStr) => {
  if (htmlStr === null || htmlStr === '') return false
  else htmlStr = htmlStr.toString()

  // Regular expression to identify HTML tags in
  // the input string. Replacing the identified
  // HTML tag with a null string.
  return htmlStr.replace(/(<([^>]+)>)/gi, '')
}

function replaceTargetWith(targetID, replaceHtml) {
  /// find our target
  let i,
    div,
    elm,
    last,
    target = document.querySelector(targetID)
  /// create a temporary div
  if (!target) return false
  div = document.createElement('div')
  /// fill that div with our html, this generates our children
  div.innerHTML = replaceHtml.replace('&nbsp;', ' ')
  /// step through the temporary div's children and insertBefore our target
  i = div.childNodes.length
  /// the insertBefore method was more complicated than I first thought so I
  /// have improved it. Have to be careful when dealing with child lists as they
  /// are counted as live lists and so will update as and when you make changes.
  /// This is why it is best to work backwards when moving children around,
  /// and why I'm assigning the elements I'm working with to `elm` and `last`
  last = target
  while (i--) {
    target.parentNode.insertBefore((elm = div.childNodes[i]), last)
    last = elm
  }
  /// remove the target.
  target.parentNode.removeChild(target)
  last.parentNode.innerHTML = last.parentNode.innerHTML.replaceAll(
    '&nbsp;',
    ' '
  )
}

let selectionRange

function highlight(highlightID, color) {
  if (window.getSelection && window.getSelection().toString()) {
    let node = getSelectionParentElement()
    if (
      node != null &&
      document.querySelector('#textbook-html')?.contains(node)
    ) {
      let text = getSelectionText()
      console.log('Selected text: ' + text)
      markFunc(node, text, /*HIGHLIGHT_CLASS + " " + */ color)
    } else {
      console.log('Parent nde is null for some reason')
    }
  } else {
    console.log('tapped without selection')
  }
}

function getSelectionText() {
  if (window.getSelection) {
    let sel = window.getSelection()
    return sel.toString()
  }
}

function getSelectionParentElement() {
  let parentEl = null,
    sel
  if (window.getSelection) {
    sel = window.getSelection()
    if (sel.rangeCount) {
      selectionRange = sel.getRangeAt(0)
      parentEl = selectionRange.commonAncestorContainer
      if (parentEl.nodeType != 1) {
        parentEl = parentEl.parentNode
      }
    }
  } else if ((sel = document.selection) && sel.type != 'Control') {
    parentEl = sel.createRange().parentElement()
  }

  // parentEl.style.display = 'block'
  return parentEl
}

function markFunc(node, text, color) {
  let instance = new Mark(node)
  let idx = 0
  instance.mark(text, {
    element: 'span',
    className: color,
    acrossElements: true,
    separateWordSearch: false,
    accuracy: 'partially',
    diacritics: true,
    ignoreJoiners: true,
    each: (element) => {
      element.setAttribute('id', `sohayb${idx}`)
      idx++
      // element.setAttribute('title', 'sohayb_title')
    },
    done: function (totalMarks) {
      window.getSelection().empty() //This only in Chrome
      // console.log('total marks: ' + totalMarks)
    },
    filter: function (node, term, totalCounter, counter) {
      let res = false
      if (counter == 0) {
        res = selectionRange.isPointInRange(node, selectionRange.startOffset)
      } else {
        res = selectionRange.isPointInRange(node, 1)
      }
      // console.log(
      //   'Counter: ' + counter + ', startOffset: ' + selectionRange.startOffset
      // )
      return res
    }
  })
}

function unMarkFunc({ isMe, partnerUserType }) {
  const bodyNode = document.body
  let instance = new Mark(bodyNode)
  if (isMe) {
    instance.unmark({
      className: `${userType}-selection`
    })
  } else {
    instance.unmark({
      className: `${partnerUserType}-selection`
    })
  }
}

const destroyLoading = () => {
  const loading = document.querySelectorAll('.loading-wrapper')
  loading.forEach((item) => item.remove())
}
function iOSversion() {
  if (/iP(hone|od|ad)/.test(navigator.platform)) {
    // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
    var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/)
    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)]
  }
  return null
}

const debounceCustom = (callback, wait) => {
  let timeoutId = null

  console.log('debounce')
  clearTimeout(timeoutId)

  timeoutId = setTimeout(() => {
    callback()
  }, wait)
}

const showLoadingChat = (position = 'bottom') => {
  const countLoading = document.querySelectorAll('.loading-chat')?.length || 0
  if (countLoading < 1) {
    switch (position) {
      case 'top':
        $('#chat-area').prepend(
          `<img class="loading-chat" src="./svg/spiner.svg" />`
        )
        // scrollControl(document.getElementById('chat-area'), 'loadMore', 0)
        break
      default:
        $('#chat-area').append(
          `<img class="loading-chat" src="./svg/spiner.svg" />`
        )
        scrollControl(document.getElementById('chat-area'), 'end')
        break
    }
  }
}

const removeLoadingChat = () => {
  document.querySelectorAll('.loading-chat').forEach((item) => item.remove())
}

const resetIsChatShareFunc = () => {
  isChatShare = false
  if ($partner != undefined) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        channel: 'resetIsChatShare'
      }),
      false,
      'device'
    )
  }
}

const acceptExitTextbook = () => {
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
}

const acceptExitShareScreen = () => {
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

  setTimeout(() => {
    $('#toggle-screenshare').prop('checked', false)
  })

  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      channel: 'stopShareSound'
    }),
    false,
    'device'
  )

  var streamSrc = document.getElementById('share_video').srcObject
  var audioTrackSrc = streamSrc.getAudioTracks()[0]

  // Ngừng phát sóng track âm thanh
  if (audioTrackSrc) audioTrackSrc.stop()

  return false
}

const createNewVideo = () => {
  if (isIOS() || isIpad()) {
    createVideoElement(
      vsWebRTCClient.getLocalStream('device'),
      nickName,
      nickName,
      useMic,
      useCamera,
      true
    )
    if ($partner) {
      createVideoElement(
        vsWebRTCClient.getRemoteStream($room, $partner, 'device'),
        $partner.getName(),
        $partner.getName(),
        true,
        true,
        false
      )
    }
  }
}

const windowLoad = (callback, newWindow) => {
  const stateCheck = setInterval(() => {
    if (!newWindow.document) {
      clearInterval(stateCheck)
      return
    }
    if (newWindow.document.readyState === 'complete') {
      setTimeout(() => {
        clearInterval(stateCheck)
        callback()
      }, 1000)
      clearInterval(stateCheck)
    }
  }, 500)
}

const downloadByOpenNewTab = (url) => {
  let newWindow = window.open(url)

  setTimeout(() => {
    // if (newWindow.document.readyState === 'complete') {
    //   newWindow.close()
    // }
    windowLoad(() => newWindow.close(), newWindow)
  }, 500)
}

const stopShareScreenAndSound = () => {
  vsWebRTCClient.stopStream(['screen'])
  var streamSrc = document.getElementById('share_video').srcObject
  var audioTrackSrc = streamSrc.getAudioTracks()[0]

  // Ngừng phát sóng track âm thanh
  if (audioTrackSrc) audioTrackSrc.stop()
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      channel: 'stopShareSound'
    }),
    false,
    'device'
  )
  vsWebRTCClient.sendMessage(
    $room,
    $partner,
    JSON.stringify({
      channel: 'stopShareScreen'
    }),
    false,
    'device'
  )
}

const calHeightFocus = () => {
  console.log(window.innerWidth, window.innerHeight)
  if (window.innerWidth >= 1024 && window.innerHeight <= 850) {
    if (isChromeIOS()) {
      return '55vh'
    } else {
      return '100vh'
    }
  }

  if (window.innerWidth >= 1366 && window.innerHeight <= 1024) {
    if (isChromeIOS()) {
      return '55vh'
    } else {
      return '100vh'
    }
  }

  if (iOSversion() && iOSversion()[0] < 16) {
    if (isChromeIOS()) {
      return '65vh'
    } else {
      return `min(calc(${
        window.innerHeight / 2
      }px + min(15vw, 80px) * 1.1 + 180px + ${Math.min(
        window.scrollY,
        80
      )}px), 100vh)`
    }
  } else {
    if (isChromeIOS()) {
      return '65vh'
    } else {
      return `min(calc(${
        window.innerHeight / 2
      }px + min(15vw, 80px) * 1.1 + 180px + ${Math.min(
        window.scrollY,
        80
      )}px), 100vh)`
    }
  }
}

const firstCameraList = () => {
  getDeviceList().then(function (results) {
    const listCam = results.filter((item) => item.kind === 'videoinput')

    if (listCam.length !== previousCameraCount) {
      previousCameraCount = listCam.length
    }
  })
}
