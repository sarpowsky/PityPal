// Path: src/utils/pywebview-bridge.js
export const isPyWebViewReady = () => {
    return window.pywebview !== undefined;
};

export const waitForPyWebView = () => {
    return new Promise((resolve) => {
        if (isPyWebViewReady()) {
            resolve();
            return;
        }

        const checkInterval = setInterval(() => {
            if (isPyWebViewReady()) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
};