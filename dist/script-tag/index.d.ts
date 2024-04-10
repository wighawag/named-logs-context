type Logger = {
    readonly assert: (condition?: boolean, ...data: any[]) => void;
    readonly error: (...data: any[]) => void;
    readonly warn: (...data: any[]) => void;
    readonly info: (...data: any[]) => void;
    readonly log: (...data: any[]) => void;
    readonly debug: (...data: any[]) => void;
    readonly dir: (item?: any, options?: any) => void;
    readonly table: (tabularData?: any, properties?: string[]) => void;
    readonly time: (label: string) => void;
    readonly timeEnd: (label: string) => void;
    readonly timeLog: (label?: string) => void;
    readonly trace: (...data: any[]) => void;
    readonly write: (msg: string) => void;
};
type CLogger = Logger & {
    level: number;
    enabled: boolean;
};
type MiniLogger = {
    readonly error: (...data: any[]) => void;
    readonly warn: (...data: any[]) => void;
    readonly info: (...data: any[]) => void;
    readonly log: (...data: any[]) => void;
    readonly debug: (...data: any[]) => void;
};
type G = Record<string, unknown> & {
    console: Console;
};
declare const nop: () => undefined;
declare const W: G;
declare const oldConsole: Console;
declare const disabledRegexps: RegExp[];
declare const enabledRegexps: RegExp[];
declare const context: any;
declare function runWithLogger<T extends Promise<unknown> | unknown>(logger: MiniLogger, callback: () => T): T;
declare function getLogFunc<T>(cLogger: CLogger, level: number): (...args: T[]) => void;
declare const loggers: {
    [namespace: string]: CLogger;
};
declare const factory: {
    (namespace: string): CLogger;
    level: number;
    disable: () => void;
    enable: (namespaces?: string) => void;
};
declare const logLevels: {
    [name: string]: number;
};
declare function enabled(name: string, { disabledRegexps, enabledRegexps }: {
    disabledRegexps: RegExp[];
    enabledRegexps: RegExp[];
}): boolean;
declare function processNamespaces(namespaces: string, { disabledRegexps, enabledRegexps }: {
    disabledRegexps: RegExp[];
    enabledRegexps: RegExp[];
}, func: (namespace: string, enabled: boolean) => void): void;
//# sourceMappingURL=index.d.ts.map