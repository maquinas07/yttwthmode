export var browser = require("webextension-polyfill");

export var properties = {
    chatWidth: 400,
    hideChat: false,
    leftChat: false,
    headerNav: false
}

export function initProperties() {
    return browser.storage.local.get("yttw_props").then((response) => {
        if (response.yttw_props) {
            properties = response.yttw_props;
        }
        return Promise.resolve(properties);
    });
}
