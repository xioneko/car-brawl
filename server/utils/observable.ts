export class ObservableMap<K, V> extends Map<K, V> {
    private onChange: () => void

    constructor(onChange: () => void, map: Map<K, V>) {
        super(map)
        this.onChange = onChange
    }

    set(key: K, value: V): this {
        super.set(key, value)
        this.onChange?.()
        return this
    }

    delete(key: K): boolean {
        const result = super.delete(key)
        this.onChange?.()
        return result
    }

    clear(): void {
        super.clear()
        this.onChange?.()
    }

    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: any,
    ): void {
        throw new Error('Method not supported.')
    }
}

export class ObservableSet<T> extends Set<T> {
    private onChange: () => void

    constructor(onChange: () => void, set: Set<T>) {
        super(set)
        this.onChange = onChange
    }

    add(value: T): this {
        super.add(value)
        this.onChange?.()
        return this
    }

    delete(value: T): boolean {
        const result = super.delete(value)
        this.onChange?.()
        return result
    }

    clear(): void {
        super.clear()
        this.onChange?.()
    }

    forEach(
        callbackfn: (value: T, value2: T, set: Set<T>) => void,
        thisArg?: any,
    ): void {
        throw new Error('Method not supported.')
    }
}
