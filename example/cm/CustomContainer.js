const events = require('events');

const { ContainerType } = require('./dist/utils/constants');
const cm = require('./index');

const containers = {};

/**
 * 容器管理器和大象开放插件的中间层，将原生窗口操作代理通过CustomContainer代理到ContainerManager，
 * 以不侵入开放插件的形式实现容器的扩展
 * todo: 这里需要和开放插件商定下BrowserWindow选项的格式（需要的暴露属性、方法等），只要满足这个格式的BrowserWindow都可以在插件中使用
 */
class CustomContainer extends events.EventEmitter {
    constructor(options) {
        super();
        let container = null;
        const { winType, parentId, url } = options;

        if (winType === 'navigation') {
            container = cm.create(ContainerType.TYPE_WINDOW_NAVIGATION, {
                viewOptions: options,
            });
        } else if (winType === 'navigationTab') {
            const parent = containers[parentId];
            container = parent.container.createTab(url);
        } else {
            container = cm.create(ContainerType.TYPE_WINDOW_BASE, {
                viewOptions: options,
            });
        }
        this.container = container;
        this.id = container.id;
        this.webContents = container.$view.webContents;

        this.addListenerProxy(container);
        containers[container.id] = this;
    }

    addListenerProxy(container) {
        // 将原生事件绑定到当前对象
        const eventNames = [
            'focus',
            'blur',
            'show',
            'hide',
            'close',
            'destroy',
        ];
        this.events = eventNames.map((eventName) => ({
            eventName,
            listener: (...args) => {
                this.emit(eventName, ...args);
            },
        }));
        this.events.forEach(({ eventName, listener }) => {
            container.addListener(eventName, listener);
        });
        container.addListener('destroy', this.onDestroy.bind(this));
    }

    onDestroy() {
        // 销毁时统一注销所有监听（包含自身）
        this.events.forEach(({ eventName, listener }) => {
            this.container.$view.removeListener(eventName, listener);
        });
        this.container.$view.removeListener('destroy', this.onDestroy);
    }

    loadURL(...args) {
        return this.container.loadURL(...args);
    }

    show(...args) {
        return this.container.show(...args);
    }

    hide(...args) {
        return this.container.hide(...args);
    }

    close(...args) {
        return this.container.destroy(...args);
    }

    focus(...args) {
        return this.container.focus(...args);
    }

    destroy(...args) {
        delete containers[this.container.id];
        return this.container.destroy(...args);
    }

    isDestroyed() {
        return this.container.isDestroyed();
    }
}

CustomContainer.fromId = (id) => {
    return containers[id] || null;
};

module.exports = CustomContainer;
