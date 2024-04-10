'use strict';

var namedLogs = require('named-logs');
var node_async_hooks = require('node:async_hooks');

const nop = () => void 0;
const disabledRegexps = [];
const enabledRegexps = [];
const context = new node_async_hooks.AsyncLocalStorage();
function runWithLogger(logger, callback) {
  return context.run(logger, callback);
}
function getLogFunc(cLogger, level) {
  if (cLogger.enabled && (cLogger.level >= level || factory.level >= level)) {
    const logger = context.getStore();
    switch (level) {
      case 0:
        return logger.error.bind(logger);
      case 1:
        return logger.error.bind(logger);
      case 2:
        return logger.warn.bind(logger);
      case 3:
        return logger.info.bind(logger);
      case 4:
        return logger.log.bind(logger);
      case 5:
        return logger.debug.bind(logger);
      case 6:
        return logger.debug.bind(logger);
      default:
        return logger.debug.bind(logger);
    }
  } else {
    return nop;
  }
}
const loggers = {};
const factory = (namespace) => {
  let logger = loggers[namespace];
  if (logger) {
    return logger;
  }
  let level = factory.level;
  return logger = loggers[namespace] = {
    get assert() {
      return nop;
    },
    get error() {
      return getLogFunc(logger, 1);
    },
    get warn() {
      return getLogFunc(logger, 2);
    },
    get info() {
      return getLogFunc(logger, 3);
    },
    get write() {
      return getLogFunc(logger, 3);
    },
    get log() {
      return getLogFunc(logger, 4);
    },
    get debug() {
      return getLogFunc(logger, 5);
    },
    get trace() {
      return getLogFunc(logger, 6);
    },
    get dir() {
      return getLogFunc(logger, 5);
    },
    get table() {
      return getLogFunc(logger, 5);
    },
    get time() {
      return nop;
    },
    get timeEnd() {
      return nop;
    },
    get timeLog() {
      return nop;
    },
    get level() {
      return level;
    },
    set level(newLevel) {
      level = newLevel;
    },
    enabled: enabled(namespace, { disabledRegexps, enabledRegexps })
  };
};
const logLevels = { error: 1, warn: 2, info: 3, log: 4, debug: 5, trace: 6 };
factory.level = 2;
factory.disable = () => {
  disabledRegexps.splice(0, disabledRegexps.length);
  enabledRegexps.splice(0, enabledRegexps.length);
  for (const namespace of Object.keys(loggers)) {
    loggers[namespace].enabled = false;
  }
};
factory.enable = (namespaces) => {
  disabledRegexps.splice(0, disabledRegexps.length);
  enabledRegexps.splice(0, enabledRegexps.length);
  if (namespaces === "") {
    namespaces = "*";
  } else {
    namespaces = namespaces || "*";
  }
  processNamespaces(
    namespaces,
    { disabledRegexps, enabledRegexps },
    (namespace, enabled2) => loggers[namespace].enabled = enabled2
  );
};
function enabled(name, { disabledRegexps: disabledRegexps2, enabledRegexps: enabledRegexps2 }) {
  if (name[name.length - 1] === "*") {
    return true;
  }
  let i;
  let len;
  for (i = 0, len = disabledRegexps2.length; i < len; i++) {
    if (disabledRegexps2[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = enabledRegexps2.length; i < len; i++) {
    if (enabledRegexps2[i].test(name)) {
      return true;
    }
  }
  return false;
}
function processNamespaces(namespaces, { disabledRegexps: disabledRegexps2, enabledRegexps: enabledRegexps2 }, func) {
  const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
  const len = split.length;
  for (let i = 0; i < len; i++) {
    if (!split[i]) {
      continue;
    }
    namespaces = split[i].replace(/\*/g, ".*?");
    if (namespaces[0] === "-") {
      disabledRegexps2.push(new RegExp("^" + namespaces.substr(1) + "$"));
    } else {
      enabledRegexps2.push(new RegExp("^" + namespaces + "$"));
    }
  }
  for (const namespace of Object.keys(loggers)) {
    func(namespace, enabled(namespace, { disabledRegexps: disabledRegexps2, enabledRegexps: enabledRegexps2 }));
  }
}
function hookup() {
  namedLogs.hook(factory);
}
if (typeof process !== "undefined") {
  let val = process.env["NAMED_LOGS"];
  if (val) {
    factory.enable(val);
  } else {
    factory.disable();
  }
  val = process.env["NAMED_LOGS_LEVEL"];
  if (val) {
    factory.level = logLevels[val] || parseInt(val) || factory.level;
  }
}
global._logFactory = factory;

exports.factory = factory;
exports.hookup = hookup;
exports.runWithLogger = runWithLogger;
