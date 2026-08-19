export abstract class BaseLoader<TResult = unknown> {
    onDisabled(..._args: unknown[]): void {
        return undefined;
    }

    syncAuthorization(..._args: unknown[]): unknown {
        return undefined;
    }

    init(...args: unknown[]): TResult | void | Promise<TResult | void> {
        return this.refresh(...args);
    }

    refresh(...args: unknown[]): TResult | void | Promise<TResult | void> {
        return this.get(...args);
    }

    get(...args: unknown[]): TResult | void | Promise<TResult | void> {
        return this.refresh(...args);
    }
}

export default BaseLoader;
