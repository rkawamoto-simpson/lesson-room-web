const sendSignalGetTextBook = () => {
  if (isMobile()) {
    $('#draw_component').css({ 'z-index': 1, position: 'absolute' })
    $('#stream-contents').css({ height: '100%' })
    $('#side-contents').css({ 'z-index': 0 })
  }
  nextmode = 3
  modeChange(3)
  textbookChannel = 'textbookShare'
  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        languageType: languageType,
        channel: 'textbookShare'
      }),
      false,
      'device'
    )
  }
}

const RenderTextBook = (data, languageType) => {
  let displayENValue = languageType % 2 === 0 ? 'block' : 'none'
  let displayJPValue = languageType % 2 === 1 ? 'block' : 'none'
  const materialGroupList = data.map((item) => {
    const groupHTML = `<div class="col-6 col-sm-4 col-xl-3 p-2" style="height: auto;" >
    <div id="${item.id}" data-title-en="${item.name_en}" data-title-ja="${item.name_ja}" class="material-group en" style="display: ${displayENValue};background-image: url(${item.thumbnail_en});" onclick="getMaterialListByGroup(${item.id})"></div>
    <div id="${item.id}" data-title-en="${item.name_en}" data-title-ja="${item.name_ja}" class="material-group jp" style="display: ${displayJPValue}; background-image: url(${item.thumbnail_ja});" onclick="getMaterialListByGroup(${item.id})"></div>
</div>`
    return groupHTML
  })
  document.querySelector('#material-content').innerHTML =
    materialGroupList.join('')
}

const RenderListTextBook = (data, titleEN, titleJA) => {
  textBookData = data

  document.querySelector('#group-title-en').innerHTML = titleEN
  document.querySelector('#group-title-ja').innerHTML = titleJA
  document.querySelector('#material-title-en').innerHTML = titleEN
  document.querySelector('#material-title-ja').innerHTML = titleJA
  const convertLevels = [
    ['Beginner', '入門'],
    ['Beginner_Elementary', '入門・初級'],
    ['Elementary', '初級'],
    ['Elementary_Intermediate', '初中級'],
    ['Intermediate', '中級'],
    ['Intermediate_Advanced', '中上級'],
    ['Advanced', '上級'],
    ['Common', '全共通'],
    ['Not registered', '登録なし']
  ]

  let displayENValue = languageType % 2 === 0 ? 'block' : 'none'
  let displayJPValue = languageType % 2 === 1 ? 'block' : 'none'

  var canvas = document.createElement('canvas')

  listTextBook = textBookData.map((item) => {
    // const levelsEN = item.material_levels.map(
    //   (lv) => convertLevels[parseInt(lv.level) - 1][0]
    // )
    // const levelsJA = item.material_levels.map(
    //   (lv) => convertLevels[parseInt(lv.level) - 1][1]
    // )

    const textBookRender =
      `
      <div class="textbook-item"  data-html="${item.text_html_url}" data-pdf="${
        item.text_pdf_ufl
      }" data-filename="${
        item.lesson_name_en + '_' + item.level_en
      }" style="width:100%;height:auto;" onclick="changeTextShareMode(); showBackTextbook(` +
      true +
      `);assignTextBook();showTextbookHtml();" id="` +
      item.teaching_materials +
      `">
        <div style="display: flex;" class="lesson-info-left">
        <div class="lesson-name en" style="display: ${displayENValue}">${item.lesson_name_en} [${item.level_en}]</div>
        <div class="lesson-name jp" style="display: ${displayJPValue}">${item.lesson_name} [${item.level}]</div>
        </div>
       
      </div>
      `
    return textBookRender
  })
  document.querySelector('#list-textbook').innerHTML =
    listTextBook.length > 0
      ? listTextBook.join('')
      : `<div class="no-data">
            <div class="empty-icon"></div>
            <div style="display: ${displayENValue}; height: auto" class="en">Under preparation</div>
            <div style="display: ${displayJPValue}; height: auto" class="jp">現在準備中です</div>
          </div>
          `
}

const resetTextbookHtml = () => {
  // $('#draw').html('')
  document.querySelectorAll('#textbook-html').forEach((item) => item.remove())
  loading('#draw_parent', false)
  // $('#textbook-html').remove()
  $('#remoteDrawCanvas').css({ 'z-index': 1 })
  $('#localDrawCanvas').css({ 'z-index': 2 })
  $('#localPointerCanvas').css({ 'z-index': 3 })
  $('#remotePointerCanvas').css({ 'z-index': 4 })
  $('#backgroundCanvas').css({ 'z-index': 0 })
}

const reShowTextbookHtml = (result) => {
  resetTextbookHtml()

  if ((nextmode === 5 && !isChatShare) || (mode === 5 && !isChatShare)) {
    $('#draw').append(`<div id="textbook-html">${result.data}</div>`)
    $('#remoteDrawCanvas').css({ 'z-index': -1 })
    $('#localDrawCanvas').css({ 'z-index': -1 })
    $('#localPointerCanvas').css({ 'z-index': -1 })
    $('#remotePointerCanvas').css({ 'z-index': -1 })
    $('#backgroundCanvas').css({ 'z-index': -1 })

    if (userType === 'teacher') {
      $('#textbook-html').removeClass('page-wrapper')
      $('#textbook-html').addClass('page-wrapper-teacher')
    } else {
      $('#textbook-html').removeClass('page-wrapper-teacher')
      $('#textbook-html').addClass('page-wrapper')
    }

    destroyLoading()
    textbookChannel = 'recvTextbook'
    isTextBook = true

    // Add ID
    const htmlTextbook = document.getElementById('textbook-html')
    const textbookEl = document.querySelector('#page-container')
    const divEls = textbookEl.querySelectorAll('div')
    const spanEls = textbookEl.querySelectorAll('span')
    divEls.forEach((item, idx) =>
      item.setAttribute('id', `textbook-div-${idx}`)
    )
    spanEls.forEach((item, idx) =>
      item.setAttribute('id', `textbook-span-${idx}`)
    )

    htmlTextbook.style.width = '100%'

    scaleTextbook($('#textbook-html').innerWidth())
  }
}

// Get list
// C6kcQa5v4f5jMqrVgNCFkyHgJDQC9zn%2BYg%2BqH6Nw4smoelE%2Fqmlt8dRtK4xelmv3RUD5SSWQ0rKxWp9uyLg4FA%3D%3D
// C6kcQa5v4f5jMqrVgNCFkyHgJDQC9zn%2BYg%2BqH6Nw4smoelE%2Fqmlt8dRtK4xelmv353UPqxe%2BLcFlVOENvK0gtA%3D%3D

// Click
// C6kcQa5v4f5jMqrVgNCFkyHgJDQC9zn%2BYg%2BqH6Nw4smoelE%2Fqmlt8dRtK4xelmv3RUD5SSWQ0rKxWp9uyLg4FA%3D%3D
// C6kcQa5v4f5jMqrVgNCFkyHgJDQC9zn%2BYg%2BqH6Nw4smoelE%2Fqmlt8dRtK4xelmv353UPqxe%2BLcFlVOENvK0gtA%3D%3D
const showTextbookHtml = (param = {}) => {
  // if (mode === 5) {
  //   $('#btn-pen').hide()
  //   $('#btn-eraser').hide()
  // }

  isChatShare = false
  const {
    textbookURL: textbookParam,
    isMe = true,
    textSelection,
    textbookPDF: textbookPDFParam,
    fileNameTextbook: fileNameTextbookParam
  } = param

  fileNameTextbook = fileNameTextbookParam
    ? fileNameTextbookParam
    : event?.currentTarget?.getAttribute('data-filename')

  textbookPDF = textbookPDFParam
    ? textbookPDFParam
    : event?.currentTarget?.getAttribute('data-pdf')

  textbookURL = textbookParam
    ? textbookParam
    : event?.currentTarget?.getAttribute('data-html')

  // console.log('2', textbookPDF, '\n', textbookURL)

  console.log(textbookURL.split('param=')[1])
  loading('#draw_parent', true)
  fetch(
    `${URL_LESSON_ROOM}/material/textbook/file?file_type=html&param=${
      textbookURL.split('param=')[1]
    }`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
      // body: makeJsonData()
    }
  )
    .then(function (rs) {
      console.log(rs)
      return rs.json()
    })
    .then(function (result) {
      resetTextbookHtml()
      if ((nextmode === 5 && !isChatShare) || (mode === 5 && !isChatShare)) {
        $('#draw').append(`<div id="textbook-html">${result.data}</div>`)
        $('#remoteDrawCanvas').css({ 'z-index': -1 })
        $('#localDrawCanvas').css({ 'z-index': -1 })
        $('#localPointerCanvas').css({ 'z-index': -1 })
        $('#remotePointerCanvas').css({ 'z-index': -1 })
        $('#backgroundCanvas').css({ 'z-index': -1 })

        if (userType === 'teacher') {
          $('#textbook-html').removeClass('page-wrapper')
          $('#textbook-html').addClass('page-wrapper-teacher')
        } else {
          $('#textbook-html').removeClass('page-wrapper-teacher')
          $('#textbook-html').addClass('page-wrapper')
        }

        destroyLoading()
        textbookChannel = 'recvTextbook'
        isTextBook = true

        // Add ID
        const htmlTextbook = document.getElementById('textbook-html')
        const textbookEl = document.querySelector('#page-container')
        const divEls = textbookEl.querySelectorAll('div')
        const spanEls = textbookEl.querySelectorAll('span')
        divEls.forEach((item, idx) =>
          item.setAttribute('id', `textbook-div-${idx}`)
        )
        spanEls.forEach((item, idx) =>
          item.setAttribute('id', `textbook-span-${idx}`)
        )

        // if (textSelection) {
        //   partnerSelected({
        //     selectObj: textSelection,
        //     partnerUserType: userType === 'teacher' ? 'student' : 'teacher'
        //   })
        // }

        htmlTextbook.style.width = '100%'
        var widthHtmlTextbook = $('#textbook-html').innerWidth()

        if (isMobile() && !isIpad()) {
          var panzoom

          const elem = document.getElementById('page-container')
          panzoom = Panzoom(elem, {
            minScale: widthHtmlTextbook / 800,
            startScale: widthHtmlTextbook / 800,
            maxScale: 2,
            contain: 'outside',
            step: 0.2
          })
          $('#btn-extend-landscape').on('click', () => {
            setTimeout(() => {
              panzoom.setOptions({
                minScale: widthHtmlTextbook / 800,
                startScale: widthHtmlTextbook / 800,
                maxScale: 2,
                contain: 'outside',
                step: 0.2
              })
              panzoom.zoom(widthHtmlTextbook / 800)
            }, 1000)
          })

          elem.addEventListener('wheel', (e) => {
            if (panzoom.getScale() < widthHtmlTextbook / 800) {
              panzoom.reset()
              return
            }
            panzoom.zoomWithWheel(e)
          })
          // window.addEventListener('orientationchange', () => {
          //   setTimeout(() => {
          //     panzoom.setOptions({
          //       minScale: $('#draw_parent').innerWidth() / 800,
          //       startScale: $('#draw_parent').innerWidth() / 800,
          //       maxScale: 2,
          //       contain: 'outside',
          //       step: 0.2
          //     })
          //     panzoom.zoom($('#draw_parent').innerWidth() / 800)
          //   }, 1000)
          // })
          window.addEventListener('orientationchange', () => {
            // window.addEventListener('resize', () => {
            setTimeout(() => {
              panzoom.setOptions({
                minScale: widthHtmlTextbook / 800,
                startScale: widthHtmlTextbook / 800,
                maxScale: 2,
                contain: 'outside',
                step: 0.2
              })
              panzoom.zoom(widthHtmlTextbook / 800, {
                focal: { x: 0, y: 0 }
              })
            }, 1000)
            // })
          })

          const parent = elem.parentElement
          elem.style.userSelect = 'text'
          // elem.style.touchAction = 'initial'
          parent.style.userSelect = 'text'
          parent.style.position = 'absolute'
          parent.style.bottom = 0
          parent.style.left = 0
        } else {
          scaleTextbook($('#textbook-html').innerWidth())
        }

        if (isIpad()) {
          window.addEventListener('orientationchange', () => {
            setTimeout(() => {
              console.log(result)
              reShowTextbookHtml(result)
              sendReRenderTextbook()
            }, 1000)
          })
          // window.addEventListener('resize', () => {
          //   setTimeout(() => {
          //     console.log(result)
          //     reShowTextbookHtml(result)
          //     sendReRenderTextbook()
          //   }, 1000)
          // })

          $('#btn-extend-landscape').on('click', () => {
            setTimeout(() => {
              console.log(result)
              reShowTextbookHtml(result)
              sendReRenderTextbook()
            }, 1000)
          })
        }

        if ($partner && !isMe) {
          console.log('selectionText')
          vsWebRTCClient.sendMessage(
            $room,
            $partner,
            JSON.stringify({
              channel: 'textbookLoaded'
            }),
            false,
            'device'
          )
        }

        if ($partner && isMe) {
          vsWebRTCClient.sendMessage(
            $room,
            $partner,
            JSON.stringify({
              textbookURL,
              textbookPDF,
              isTextBook: true,
              categoryId,
              titleEN,
              titleJA,
              fileNameTextbook,
              isChatShare: false,
              channel: 'recvTextbook'
            }),
            false,
            'device'
          )
        }
      }
    })
    .catch((err) => {
      $('#draw').append(
        `<div id="textbook-html">Your network is low. Please reload this page and try again</div>`
      )
      destroyLoading()
    })
}

const changeTextBookMode = () => {
  $('#toggle-textshare').prop('checked', true)
  $('#toggle-textbook').prop('checked', true)
  $('#toggle-board').prop('checked', false)
  $('#toggle-chat').prop('checked', false)
  videoContentsView(true)
  $('#textbook_component').show()

  if (isMobile()) {
    $('#textbook_component').css({ 'z-index': 1, position: 'absolute' })
    $('#stream-contents').css({ height: '100%' })
    $('#side-contents').css({ 'z-index': 0 })
    // $('#video-contents').css({ height: '40%' })
  }
  $('#video-contents').show()
  $('#share-contents').hide()
  $('#materialSelect-contents').hide()

  nextmode = 5
  modeChange(5)
}

const sendReRenderTextbook = () => {
  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        channel: 'sendReRenderTextbook'
      }),
      false,
      'device'
    )
  }
}

const sendTextSelection = () => {
  if ($partner) {
    vsWebRTCClient.sendMessage(
      $room,
      $partner,
      JSON.stringify({
        textSelection: getTextSelected(),
        channel: 'selectionText'
      }),
      false,
      'device'
    )
  }
}

const getCategoryList = () => {
  loading('#material-content', true)
  fetch(
    `${URL_LESSON_ROOM}/material/category?usertype=${userType}&roomid=${roomName}`,
    {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
  )
    .then(function (rs) {
      return rs.json()
    })
    .then(function (result) {
      const convertData = result.category_list.map((item) => {
        const {
          category_id,
          category_name,
          category_name_en,
          thubnail,
          thubnail_en
        } = item

        return {
          name_en: category_name_en,
          name_ja: category_name,
          thumbnail_en: thubnail_en,
          thumbnail_ja: thubnail,
          id: category_id
        }
      })
      RenderTextBook(convertData, languageType)
    })
    .catch(function (err) {})
}

const getDataTextBookList = (id, titleEN, titleJA) => {
  loading('#list-textbook', true)

  fetch(
    `${URL_LESSON_ROOM}/material/textbook?usertype=${userType}&roomid=${roomName}&categoryid=${id}`,
    {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
  )
    .then(function (rs) {
      return rs.json()
    })
    .then(function (result) {
      const convertData = result.text_list.map((item) => {
        const {
          lesson_name,
          lesson_name_en,
          level,
          level_en,
          target_age,
          text_download_flag,
          text_html_url,
          text_id,
          text_name,
          text_name_en,
          text_pdf_ufl,
          user_kbn
        } = item

        return {
          category: id,
          id: text_id,
          lesson_name: lesson_name,
          lesson_name_en: lesson_name_en,
          name_en: text_name_en,
          name_ja: text_name,
          level,
          level_en,
          target_age,
          text_html_url,
          text_pdf_ufl,
          user_kbn,
          text_download_flag
        }
      })

      RenderListTextBook(convertData, titleEN, titleJA)

      // RenderTextBook(convertData, languageType)
    })
    .catch(function (err) {
      console.log(err)
    })
}
