"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * * Created by lee on 2018/12/8
 * 主进程
 * ipcServer 负责ipc通信
 * rendererManager 窗口生命周期管理
 */
var Server = require('post-message-im/dist/server');

var RendererManager = require('./lib/rendererManager');

var _require = require('./lib/utils'),
    _dataFilter = _require.dataFilter,
    _validator = _require.validator;

var Main = function Main() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, Main);

  var _props$debug = props.debug,
      debug = _props$debug === void 0 ? false : _props$debug,
      ipcMain = props.ipcMain,
      BrowserWindow = props.BrowserWindow,
      _props$channel = props.channel,
      channel = _props$channel === void 0 ? 'main-renderer' : _props$channel,
      _props$globalVariable = props.globalVariable,
      globalVariable = _props$globalVariable === void 0 ? 'rendererManager' : _props$globalVariable,
      _props$pipeType = props.pipeType,
      pipeType = _props$pipeType === void 0 ? 'pipe' : _props$pipeType,
      _props$capacity = props.capacity,
      capacity = _props$capacity === void 0 ? 100 : _props$capacity,
      _props$dataFilter = props.dataFilter,
      dataFilter = _props$dataFilter === void 0 ? _dataFilter : _props$dataFilter,
      _props$validator = props.validator,
      validator = _props$validator === void 0 ? _validator : _props$validator; // 窗口管理

  var rendererManager = new RendererManager({
    debug: debug,
    BrowserWindow: BrowserWindow
  }); // 挂在到全局，保证主窗口能获取到

  global[globalVariable] = rendererManager;
  this.rendererManager = rendererManager;
  /**
   * 消息透传
   * Server中的方法，this绑定到Server实例上
   */

  this.ipcServer = new Server({
    capacity: capacity,
    validator: validator,
    dataFilter: dataFilter,
    subscribe: function subscribe() {
      var $$symbol = this.$$symbol;
      var distribute = this.distribute;
      ipcMain.on(channel, function (event, data) {
        if (data && data.$$symbol === $$symbol) {
          var fromContentsId = event.sender.id;
          data.meta = Object.assign({}, data.meta || {}, {
            fromContentsId: fromContentsId
          });

          if (data.params && data.params.data) {
            data.params.data.meta = Object.assign({}, data.params.data.meta || {}, {
              fromContentsId: fromContentsId
            });
          }

          distribute(data);
        }
      });
    },
    getFrameWindow: function getFrameWindow(id) {
      return rendererManager.getWin(id);
    },
    postMessageToChild: function postMessageToChild(win, data) {
      if (win.webContents.id !== data.meta.fromContentsId) {
        win.webContents.send(channel, data);
      }
    }
  });
  var ipcServer = this.ipcServer;
  ipcServer.on({
    type: pipeType,
    callback: function callback(err, res) {
      var _res$params = res.params,
          from = _res$params.from,
          to = _res$params.to,
          data = _res$params.data; // 响应请求

      ipcServer.response(Object.assign({}, res, {
        data: {
          ok: true
        }
      })); // 转发消息
      // 这步特别重要，保证on pipe 能拿到数据

      ipcServer.response(to, pipeType, {
        rescode: 0,
        data: {
          from: from,
          to: to,
          data: data
        }
      });
    }
  });
};

module.exports = Main;