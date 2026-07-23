export {};

declare global {
    interface Window {
        electronAPI?: {
            getVersion(): Promise<string>;
            // add more methods here later
        };
    }
}