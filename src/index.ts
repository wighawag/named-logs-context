import {hook, Logger} from 'named-logs';
import { AsyncLocalStorage } from 'node:async_hooks';

export type CLogger = Logger & {
	level: number;
	enabled: boolean;
};

type MiniLogger = {
  readonly error: (...data: any[]) => void;
  readonly warn: (...data: any[]) => void;
  readonly info: (...data: any[]) => void;
  readonly log: (...data: any[]) => void;
  readonly debug: (...data: any[]) => void;
}

type G = Record<string, unknown> & {
	console: Console;
};

const nop = () => undefined;
const W: G = globalThis as unknown as G;
const oldConsole = W.console;

const disabledRegexps: RegExp[] = [];
const enabledRegexps: RegExp[] = [];

const context = new AsyncLocalStorage();
export function runWithLogger(logger: Logger, callback: () => unknown) {
    return context.run(logger, callback);
}

function getLogFunc<T>(cLogger: CLogger, level: number): (...args: T[]) => void {
	if (cLogger.enabled && (cLogger.level >= level || factory.level >= level)) {
        const logger = context.getStore() as MiniLogger;
        switch (level) {
            case 0: return logger.error.bind(logger);
            case 1: return logger.error.bind(logger);
            case 2: return logger.warn.bind(logger);
            case 3: return logger.info.bind(logger);
            case 4: return logger.log.bind(logger);
            case 5: return logger.debug.bind(logger);
            case 6: return logger.debug.bind(logger);
            default: return logger.debug.bind(logger);
        }
	} else {
		return nop;
	}
}

const loggers: {[namespace: string]: CLogger} = {};


export const factory: {
	(namespace: string): CLogger;
	level: number; // TODO setting should affect all logger (unless set before ?)
	disable: () => void;
	enable: (namespaces?: string) => void;
} = (namespace: string): CLogger => {
	let logger = loggers[namespace];

	if (logger) {
		return logger;
	}
	let level = factory.level;

	return (logger = loggers[namespace] =
		{
			get assert() {
				// return bindCall(oldConsole.assert, logger,  1);
                return nop;
			},
			get error() {
				return getLogFunc(logger,  1);
			},
			get warn() {
				return getLogFunc(logger,  2);
			},
			get info() {
				return getLogFunc(logger,  3);
			},
			get write() {
				return getLogFunc(logger,  3);
			},
			get log() {
				return getLogFunc(logger,  4);
			},
			get debug() {
				return getLogFunc(logger,  5);
			},
			get trace() {
				return getLogFunc(logger,  6);
			},
			get dir() {
				return getLogFunc(logger,  5);
			},
			get table() {
				return getLogFunc(logger,  5);
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
			set level(newLevel: number) {
				level = newLevel;
			},
			enabled: enabled(namespace, {disabledRegexps, enabledRegexps}),
		});
};

const logLevels: {[name: string]: number} = {error: 1, warn: 2, info: 3, log: 4, debug: 5, trace: 6};

factory.level = 2;

factory.disable = () => {
	disabledRegexps.splice(0, disabledRegexps.length);
	enabledRegexps.splice(0, enabledRegexps.length);
	for (const namespace of Object.keys(loggers)) {
		loggers[namespace].enabled = false;
	}
};
factory.enable = (namespaces?: string) => {
	disabledRegexps.splice(0, disabledRegexps.length);
	enabledRegexps.splice(0, enabledRegexps.length);
	if (namespaces === '') {
		namespaces = '*';
	} else {
		namespaces = namespaces || '*';
	}
	processNamespaces(
		namespaces,
		{disabledRegexps, enabledRegexps},
		(namespace, enabled) => (loggers[namespace].enabled = enabled)
	);
};

function enabled(
	name: string,
	{disabledRegexps, enabledRegexps}: {disabledRegexps: RegExp[]; enabledRegexps: RegExp[]}
): boolean {
	if (name[name.length - 1] === '*') {
		return true;
	}

	let i;
	let len;
	for (i = 0, len = disabledRegexps.length; i < len; i++) {
		if (disabledRegexps[i].test(name)) {
			return false;
		}
	}

	for (i = 0, len = enabledRegexps.length; i < len; i++) {
		if (enabledRegexps[i].test(name)) {
			return true;
		}
	}
	return false;
}

function processNamespaces(
	namespaces: string,
	{disabledRegexps, enabledRegexps}: {disabledRegexps: RegExp[]; enabledRegexps: RegExp[]},
	func: (namespace: string, enabled: boolean) => void
) {
	const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
	const len = split.length;

	for (let i = 0; i < len; i++) {
		if (!split[i]) {
			// ignore empty strings
			continue;
		}

		namespaces = split[i].replace(/\*/g, '.*?');

		if (namespaces[0] === '-') {
			disabledRegexps.push(new RegExp('^' + namespaces.substr(1) + '$'));
		} else {
			enabledRegexps.push(new RegExp('^' + namespaces + '$'));
		}
	}

	for (const namespace of Object.keys(loggers)) {
		func(namespace, enabled(namespace, {disabledRegexps, enabledRegexps}));
	}
}

export function replaceConsole(namespace = 'console'): Console {
	const logger = factory(namespace);
	W.console = {
		...logger,
		clear: oldConsole.clear.bind(oldConsole),
		count: nop,
		countReset: nop,
		dirxml: nop, // TODO ?
		exception: nop,
		group: nop,
		groupCollapsed: nop,
		groupEnd: nop,
		timeStamp: nop,
		profile: nop,
		profileEnd: nop,
		// timeStamp: oldConsole.timeStamp.bind(oldConsole),
		// profile: (oldConsole as any).profile.bind(oldConsole),
		// profileEnd: (oldConsole as any).profileEnd.bind(oldConsole),
	} as unknown as Console;
	return oldConsole;
}

export function hookup(): void {
	hook(factory);
}

if (typeof process !== 'undefined') {
	let val = process.env['NAMED_LOGS'];
	if (val) {
		factory.enable(val);
	} else {
		factory.disable();
	}
	val = process.env['NAMED_LOGS_LEVEL'];
	if (val) {
		factory.level = (logLevels[val] || parseInt(val) || factory.level) as number;
	}
}

(global as any)._logFactory = factory;
