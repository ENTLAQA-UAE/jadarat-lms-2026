declare global {
    interface Window {
        Weglot: {
            getCurrentLang(): string,
            on(eventName, callback),
            switchTo(code: string): void,
            options: any,
            getLanguageName: any,
            initialize: any
        }
    }
}

export { }