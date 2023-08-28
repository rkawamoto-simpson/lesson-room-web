const handleDeleteChat = (idEl, btnDeleteFile, btnDownload, fileName) => {
  document.getElementById('confirm-delete').style.display = 'block'

  if (btnDownload) {
    document.getElementById('delete-confirm-file').style.display = 'block'
    document.getElementById('delete-confirm').style.display = 'none'
  } else {
    document.getElementById('delete-confirm-file').style.display = 'none'
    document.getElementById('delete-confirm').style.display = 'block'
  }
  console.log(btnDownload)
  var btnDeleteCancel = document.getElementById('delete-cancel')
  btnDeleteCancel.onclick = function deleteCancel() {
    document.getElementById('confirm-delete').style.display = 'none'
  }
  var btnDeleteYes = document.getElementById('delete-yes')
  btnDeleteYes.onclick = function deleteYes() {
    document.getElementById('confirm-delete').style.display = 'none'

    const url = `${URL_LESSON_ROOM}/chathistory/${idEl}`
    fetch(url, {
      method: 'DELETE'
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        var chat_item = document.querySelectorAll(
          `[data-value="chat_text_${idEl}"]`
        )[0]
        if ($partner != undefined) {
          vsWebRTCClient.sendMessage(
            $room,
            $partner,
            JSON.stringify({
              text: idEl,
              channel: 'remove_chat'
            }),
            false,
            'device'
          )
        }
        btnDeleteFile.parentElement.children[0].innerHTML =
          languageType % 2 == 1 ? '--- 削除済み ---' : '--- deleted ---'
        btnDeleteFile.parentElement.children[0].classList.remove(
          'file-text-chat-delete'
        )
        btnDeleteFile.remove()
        if (btnDownload) btnDownload.remove()
      })
  }
}
