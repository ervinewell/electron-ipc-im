const ContainerManager = require('./dist').default;
const debug = console.log;
module.exports = new ContainerManager({
    debug,
});
