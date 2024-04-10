import { Logger } from 'named-logs';

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
declare function runWithLogger<T extends Promise<unknown> | unknown>(logger: MiniLogger, callback: () => T): T;
declare const factory: {
    (namespace: string): CLogger;
    level: number;
    disable: () => void;
    enable: (namespaces?: string) => void;
};
declare function hookup(): void;

export { type CLogger, factory, hookup, runWithLogger };
