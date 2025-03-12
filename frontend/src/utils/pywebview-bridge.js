// Path: src/utils/pywebview-bridge.js

// Provides utilities for safely communicating with Python backend through pywebview
// Ensures API is available before making calls to prevent race conditions
// Used throughout the frontend to maintain stable Python-JavaScript interaction

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