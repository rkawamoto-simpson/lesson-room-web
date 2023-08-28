'use strict';

const e = React.createElement;

const io = Y['websockets-client'].io


// create a connection
const connection = io(URL_SOCKET_SERVER) ;

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

let sessionParam = getQueryString()
let decodedString = atob(sessionParam['session'])
let param = getQueryStringFromDecodeURL(decodedString)
let roomId = param['room_id']

class TextEditContainer extends React.Component {
  constructor() {
    super()
    this.state = {
      connectionExists: true,
      showRoom: roomId, 
    };
    this.setConnectionExistsToTrue = this.setConnectionExistsToTrue.bind(this)
    this.setConnectionExistsToFalse = this.setConnectionExistsToFalse.bind(this)
  } //end constructor

  setConnectionExistsToTrue() {
    this.setState({ connectionExists: true });
  }

  setConnectionExistsToFalse() {
    this.setState({ connectionExists: false });
  }

  render() {
    var connectionId = connection.id
    console.log('connectionId is: ', connection, connectionId)

    if (this.state.connectionExists === false) {
        connection.disconnect()
        console.log('connection disconnected...')
    } 

    if (this.state.connectionExists === true) {
      Y({
        db: {
          name: 'memory'
        },
        connector: {
          name: 'websockets-client', 
          room: this.state.showRoom, 
          socket: connection, 
          url: URL_SOCKET_SERVER 
        },
        share: {
          richtext: 'Richtext'
        }
      }).then( (y) => {
        window.yquill = y
        var toolbarOptions = [
          ['bold', 'italic', 'underline'],
        ];
        window.quill = new window.Quill('#editor', {
          modules: {
            toolbar: toolbarOptions,
          },
          theme: 'snow',
        });
        y.share.richtext.bindQuill(window.quill)
      })
    } 
    return e("div", {
      className: "TextEditContainer-style"
    }, /*#__PURE__*/e("div", {
      className: "TextEdit-style"
    }, this.state.connectionExists === true ? /*#__PURE__*/e("div", {
      id: "QuillEditor-container"
    }, /*#__PURE__*/e("div", {
      id: "editor"
    })) : /*#__PURE__*/e("div", null, "LOADING...")));
  }
}

const domContainer = document.getElementById('editor-table');
ReactDOM.render(e(TextEditContainer), domContainer);

