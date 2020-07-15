"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * * Created by lee on 2018/12/8
 * 主窗口使用
 * ipcClient ipc通信客户端，与ipcServer匹配
 * imServer 主窗口抽象
 */
var _Server = require('post-message-im/dist/server');

var _Client = require('post-message-im/dist/client');

var _require = require('./lib/utils'),
    _dataFilter = _require.dataFilter,
    _validator = _require.validator;

var Server = function Server(props) {
  _classCallCheck(this, Server);

  var _props$channel = props.channel,
      channel = _props$channel === void 0 ? 'main-renderer' : _props$channel,
      _props$serverId = props.serverId,
      serverId = _props$serverId === void 0 ? 'im' : _props$serverId,
      ipcRenderer = props.ipcRenderer,
      rendererManager = props.rendererManager,
      winId = props.winId,
      _props$pipeType = props.pipeType,
      pipeType = _props$pipeType === void 0 ? 'pipe' : _props$pipeType,
      _props$offlineType = props.offlineType,
      offlineType = _props$offlineType === void 0 ? 'offline' : _props$offlineType,
      _props$dataFilter = props.dataFilter,
      dataFilter = _props$dataFilter === void 0 ? _dataFilter : _props$dataFilter,
      _props$validator = props.validator,
      validator = _props$validator === void 0 ? _validator : _props$validator; // 设置主窗口

  rendererManager.setMain(serverId, winId);
  /**
   * ipcClient
   */

  var ipcClient = new _Client({
    id: serverId,
    postMessage: function postMessage(data) {
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
  var imServer = new _Server({
    validator: validator,
    dataFilter: dataFilter,
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
        type: offlineType,
        callback: function callback(err, res) {
          ipcClient.distribute(res);
        }
      });
    },
    getFrameWindow: function getFrameWindow(id) {
      return rendererManager.getWin(id);
    },
    postMessageToChild: function postMessageToChild(win, data) {
      var id = data.token.id;
      ipcClient.request({
        type: pipeType,
        params: {
          from: serverId,
          to: id,
          data: data
        },
        callback: function callback(err, res) {}
      });
    }
  });
  imServer.rendererManager = rendererManager;
  return imServer;
};

module.exports = Server;