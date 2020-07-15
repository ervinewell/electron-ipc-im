"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * * Created by lee on 2018/12/9
 * ipcClient ipc通信客户端，与ipcServer匹配
 * imClient 非主窗口抽象
 */
var _Client = require('post-message-im/dist/client');

var Client = function Client(props) {
  _classCallCheck(this, Client);

  var _props$channel = props.channel,
      channel = _props$channel === void 0 ? 'main-renderer' : _props$channel,
      _props$serverId = props.serverId,
      serverId = _props$serverId === void 0 ? 'im' : _props$serverId,
      id = props.id,
      ipcRenderer = props.ipcRenderer,
      _props$pipeType = props.pipeType,
      pipeType = _props$pipeType === void 0 ? 'pipe' : _props$pipeType,
      contentsId = props.contentsId;
  /**
   * ipcClient
   */

  var ipcClient = new _Client({
    id: id,
    postMessage: function postMessage(data) {
      data.meta = Object.assign({}, data.meta || {}, {
        fromContentsId: contentsId
      });
      ipcRenderer.send(channel, data);
    },
    subscribe: function subscribe() {
      var $$symbol = this.$$symbol;
      var distribute = this.distribute;
      ipcRenderer.on(channel, function (event, data) {
        if (data && data.$$symbol === $$symbol) {
          distribute(data);
        }
      });
    }
  });
  var imClient = new _Client({
    id: id,
    postMessage: function postMessage(data) {
      ipcClient.request({
        type: pipeType,
        params: {
          from: id,
          to: serverId,
          data: data
        },
        callback: function callback(err, res) {}
      });
    },
    subscribe: function subscribe() {
      var $$symbol = this.$$symbol;
      var distribute = this.distribute;
      ipcClient.on({
        type: pipeType,
        callback: function callback(err, _ref) {
          var rescode = _ref.rescode,
              _ref$data = _ref.data,
              from = _ref$data.from,
              to = _ref$data.to,
              data = _ref$data.data;

          if (data && data.$$symbol === $$symbol) {
            distribute(data);
          }
        }
      });
      ipcClient.request({
        type: 'offline',
        callback: function callback(err, res) {
          ipcClient.distribute(res);
        }
      });
    }
  });
  return imClient;
};

module.exports = Client;