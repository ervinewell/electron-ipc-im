"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * * Created by lee on 2018/12/8
 */
var RendererManager = /*#__PURE__*/function () {
  function RendererManager(props) {
    _classCallCheck(this, RendererManager);

    this.BrowserWindow = props.BrowserWindow;
    this.state = {};
    this.registers = [];
    this.debug = props.debug || false;
  }

  _createClass(RendererManager, [{
    key: "_broadcast",
    value: function _broadcast(id, status) {
      this.registers.forEach(function (fn) {
        return fn(id, status);
      });
    }
  }, {
    key: "_load",
    value: function _load(id, winId) {
      this.state[id] = winId;
    }
  }, {
    key: "_unload",
    value: function _unload(id) {
      delete this.state[id];
    }
  }, {
    key: "getWin",
    value: function getWin(id) {
      if (this.exists(id)) {
        return this.BrowserWindow.fromId(this.state[id]);
      }

      return null;
    }
  }, {
    key: "_monitor",
    value: function _monitor(id, win) {
      var _this = this;

      win.on('close', function (e) {
        e.preventDefault();

        _this.unload(id);

        _this._broadcast(id, 'close');
      });
      win.on('blur', function () {
        _this._broadcast(id, 'blur');
      });
      win.on('focus', function () {
        _this._broadcast(id, 'focus');
      });
    }
  }, {
    key: "focus",
    value: function focus(id) {
      if (this.exists(id)) {
        var win = this.getWin(id);
        win && typeof win.focus === 'function' && win.focus();
      }
    }
  }, {
    key: "blur",
    value: function blur(id) {
      if (this.exists(id)) {
        var win = this.getWin(id);
        win && typeof win.blur === 'function' && win.blur();
      }
    }
  }, {
    key: "load",
    value: function load(url, id) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (this.exists(id)) {
        this.focus(id);

        var _win = this.getWin(id);

        if (options.reloadWhenURLChanged && _win.webContents.getURL() !== url) {
          _win.loadURL(url);
        }

        return _win;
      }

      var defaultOptions = {
        width: 800,
        height: 600 // frame: false

      };
      var win = new this.BrowserWindow(Object.assign({}, defaultOptions, options));

      if (options.loadURL !== false) {
        win.loadURL(url);
      }

      if (this.debug === true) {
        win.webContents.openDevTools();
      }

      this._load(id, win.id);

      win.webContents.on('did-finish-load', function () {}); // 注册win事件监听

      this._monitor(id, win);

      return win;
    }
  }, {
    key: "exists",
    value: function exists(id) {
      return this.state[id] !== void 0;
    }
  }, {
    key: "unload",
    value: function unload(id) {
      var win = this.getWin(id);

      if (win !== null) {
        if (!win.isDestroyed()) {
          win.destroy();
        } // win.close();


        this._unload(id);
      }
    } // 订阅事件，窗口事件close blur focus

  }, {
    key: "register",
    value: function register(fn) {
      this.registers.push(fn);
    }
  }, {
    key: "unregister",
    value: function unregister(fn) {
      var index = this.registers.indexOf(fn);

      if (index !== -1) {
        this.registers.splice(index, 1);
      }
    } // 设置主窗口

  }, {
    key: "setMain",
    value: function setMain(id, winId) {
      this.state[id] = winId;
    }
  }]);

  return RendererManager;
}();

module.exports = RendererManager;