import { browser, properties, initProperties, cleanProperties } from "../../common/properties";

const switches = document.getElementsByClassName("switch");
const headerNavSwitch = switches[0].childNodes[1];
const enabledInArchivesSwitch = switches[1].childNodes[1];
const hideChatSwitch = switches[2].childNodes[1];
const chatPositionSwitch = switches[3].childNodes[1];
const chatWidthInput = document.getElementById("chat-width-input");
const saveAsDefaultsButton = document.getElementsByClassName("dirtyable")[0];

let port;
let dirty = false;

function handleDirty(key) {
    if (!key) {
        dirty = false;
    } else if (!properties[`${key}_dirty`]) {
        properties[`${key}_dirty`] = true;
        dirty = true;
    } else {
        delete properties[`${key}_dirty`];
        dirty = false;
        for (const property in properties) {
            if (property.indexOf("_dirty") !== -1) {
                dirty = true;
                break;
            }
        }
    }

    saveAsDefaultsButton.style.backgroundColor = dirty ? "#D48D21" : "#4CAF50";
}

function sendPropertiesChangeToContentScript(property) {
    try {
        const propertyChange = { yttw_layoutChange: true, "property": property, [property]: properties[property] };
        port.postMessage(propertyChange);
    } catch (error) {
    }
    handleDirty(property);
}

function toggleHeaderNav() {
    properties.headerNav = !properties.headerNav;
    sendPropertiesChangeToContentScript("headerNav");
}

function toggleEnabledInArchives() {
    properties.enabledInArchives = !properties.enabledInArchives;
    sendPropertiesChangeToContentScript("enabledInArchives");
}

function toggleHideChat() {
    properties.hideChat = !properties.hideChat;
    sendPropertiesChangeToContentScript("hideChat");
}

function toggleChatPosition() {
    properties.leftChat = !properties.leftChat;
    sendPropertiesChangeToContentScript("leftChat");
}

function handleChatWidthInput() {
    if (chatWidthInput.value < 300) {
        chatWidthInput.value = 300;
    }
    properties.chatWidth = Number(chatWidthInput.value);
    sendPropertiesChangeToContentScript("chatWidth");
}

function saveAsDefaults() {
    if (dirty) {
        cleanProperties(properties);
        browser.storage.local.set({ yttw_props: properties });
        handleDirty();
    }
}

function setValues() {
    for (let i = 0; i < switches.length; ++i) {
        switches[i].childNodes[3].classList.add("notransition");
    }
    headerNavSwitch.checked = properties.headerNav;
    enabledInArchivesSwitch.checked = properties.enabledInArchives;
    hideChatSwitch.checked = properties.hideChat;
    chatPositionSwitch.checked = !properties.leftChat;
    chatWidthInput.value = properties.chatWidth;
    hideChatSwitch.offsetHeight;
    for (let i = 0; i < switches.length; ++i) {
        switches[i].childNodes[3].classList.remove("notransition");
    }
}

function getActiveTab() {
    return browser.tabs.query({ currentWindow: true, active: true });
}

function connectToContentScript(activeTab) {
    activeTab = activeTab ?? getActiveTab();
    const connectToTab = (tabs) => {
        if (tabs.length > 0) {
            port = browser.tabs.connect(tabs[0].id);
        }
        return Promise.resolve(port);
    }
    return activeTab.then(connectToTab);
}

initProperties().then(() => {
    setValues();

    let activeTab = getActiveTab();
    activeTab.then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
            yttw_getTabProperties: true
        }).then((response) => {
            if (response.data) {
                const data = response.data;
                for (const property in data) {
                    if (properties[property] !== data[property]) {
                        handleDirty(property);
                    }
                    properties[property] = data[property];
                }
            }
        })
        .catch(() => {})
        .finally(() => {
            setValues();
        });
    });
    connectToContentScript(activeTab).then(() => {
        headerNavSwitch.addEventListener("click", toggleHeaderNav);
        enabledInArchivesSwitch.addEventListener("click", toggleEnabledInArchives);
        hideChatSwitch.addEventListener("click", toggleHideChat);
        chatPositionSwitch.addEventListener("click", toggleChatPosition);
        chatWidthInput.onchange = handleChatWidthInput;
        saveAsDefaultsButton.addEventListener("click", saveAsDefaults);
    });
});