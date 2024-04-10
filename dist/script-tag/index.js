"use strict";var nop=function(){},W=globalThis,oldConsole=W.console,disabledRegexps=[],enabledRegexps=[],context=new AsyncLocalStorage;function runWithLogger(e,r){return context.run(e,r)}function getLogFunc(e,r){if(!e.enabled||!(e.level>=r||factory.level>=r))return nop;var n=context.getStore();if(!n)return nop;switch(r){case 0:case 1:return n.error.bind(n);case 2:return n.warn.bind(n);case 3:return n.info.bind(n);case 4:return n.log.bind(n);default:return n.debug.bind(n)}}var loggers={},factory=function(e){var r=loggers[e];if(r)return r;var n=factory.level;return r=loggers[e]={get assert(){return nop},get error(){return getLogFunc(r,1)},get warn(){return getLogFunc(r,2)},get info(){return getLogFunc(r,3)},get write(){return getLogFunc(r,3)},get log(){return getLogFunc(r,4)},get debug(){return getLogFunc(r,5)},get trace(){return getLogFunc(r,6)},get dir(){return getLogFunc(r,5)},get table(){return getLogFunc(r,5)},get time(){return nop},get timeEnd(){return nop},get timeLog(){return nop},get level(){return n},set level(e){n=e},enabled:enabled(e,{disabledRegexps:disabledRegexps,enabledRegexps:enabledRegexps})}},logLevels={error:1,warn:2,info:3,log:4,debug:5,trace:6};function enabled(e,r){var n,t,g=r.disabledRegexps,l=r.enabledRegexps;if("*"===e[e.length-1])return!0;for(n=0,t=g.length;n<t;n++)if(g[n].test(e))return!1;for(n=0,t=l.length;n<t;n++)if(l[n].test(e))return!0;return!1}function processNamespaces(e,r,n){for(var t=r.disabledRegexps,g=r.enabledRegexps,l=("string"==typeof e?e:"").split(/[\s,]+/),s=l.length,o=0;o<s;o++)l[o]&&("-"===(e=l[o].replace(/\*/g,".*?"))[0]?t.push(new RegExp("^"+e.substr(1)+"$")):g.push(new RegExp("^"+e+"$")));for(var a=0,u=Object.keys(loggers);a<u.length;a++){var d=u[a];n(d,enabled(d,{disabledRegexps:t,enabledRegexps:g}))}}factory.level=2,factory.disable=function(){disabledRegexps.splice(0,disabledRegexps.length),enabledRegexps.splice(0,enabledRegexps.length);for(var e=0,r=Object.keys(loggers);e<r.length;e++){var n=r[e];loggers[n].enabled=!1}},factory.enable=function(e){disabledRegexps.splice(0,disabledRegexps.length),enabledRegexps.splice(0,enabledRegexps.length),processNamespaces(e=""===e?"*":e||"*",{disabledRegexps:disabledRegexps,enabledRegexps:enabledRegexps},(function(e,r){return loggers[e].enabled=r}))},globalThis._logFactory=factory,globalThis.runWithLogger=runWithLogger;