export let browser = require("webextension-polyfill");

export let properties = {
    chatWidth: 400,
    hideChat: false,
    leftChat: false,
    headerNav: false,
    enabledInArchives: true
}

export function cleanProperties(properties) {
    for (const property in properties) {
        if (property.indexOf('_') !== -1) {
            delete properties[property];
            continue;
        }
    }
}

export async function initProperties() {
    return browser.storage.local.get("yttw_props").then((response) => {
        if (response.yttw_props) {
            cleanProperties(response.yttw_props)
            for (const property in response.yttw_props) {
                properties[property] = response.yttw_props[property];
            }
        }
        return Promise.resolve(properties);
    });
}
