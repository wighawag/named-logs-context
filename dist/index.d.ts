import { Logger } from 'named-logs';

type CLogger = Logger & {
    level: number;
    enabled: boolean;
};
declare function runWithLogger(logger: Logger, callback: () => unknown): unknown;
declare const factory: {
    (namespace: string): CLogger;
    level: number;
    disable: () => void;
    enable: (namespaces?: string) => void;
};
declare function replaceConsole(namespace?: string): Console;
declare function hookup(): void;

export { type CLogger, factory, hookup, replaceConsole, runWithLogger };
