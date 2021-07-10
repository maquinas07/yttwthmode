import { browser, properties, initProperties } from "../../common/properties";

const switches = document.getElementsByClassName("switch");
const headerNavSwitch = switches[0].childNodes[1];
const hideChatSwitch = switches[1].childNodes[1];
const chatPositionSwitch = switches[2].childNodes[1];
const chatWidthInput = document.getElementById("chat-width-input");
const saveAsDefaultsButton = document.getElementsByClassName("dirtyable")[0];

var port;
var dirty = false;

function handleDirty(key) {
    if (properties[`${key}_o`] !== properties[key]) {
        properties[`${key}_dirty`] = true;
    } else if (properties[`${key}_dirty`]) {
        properties[`${key}_dirty`] = false;
    }

    dirty = false;

    Object.entries(properties).map((property) => {
        if (property[0].indexOf("_dirty") != -1) {
            if (property[1]) {
                dirty = true;
            }
            return;
        }
    })

    saveAsDefaultsButton.style.backgroundColor = dirty ? "#D48D21" : "#4CAF50";
}

function cleanProperties() {
    dirty = false;
    for (var property in properties) {
        properties[`${property}_o`] = properties[property];
        properties[`${property}_dirty`] = false;
    }
    saveAsDefaultsButton.style.backgroundColor = dirty ? "#D48D21" : "#4CAF50";
}

function sendPropertiesChangeToContentScript(property) {
    try {
        var propertyChange = { yttw_layoutChange: true, [`yttw_${property}`]: properties[property] };
        port.postMessage(propertyChange);
    } catch (error) {
    }
    handleDirty(property);
}

function toggleHeaderNav() {
    properties.headerNav = !properties.headerNav;
    sendPropertiesChangeToContentScript("headerNav");
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
        browser.storage.local.set({ yttw_props: properties });
        cleanProperties();
    }
}

function setValues() {
    switches[0].childNodes[3].classList.add("notransition");
    switches[1].childNodes[3].classList.add("notransition");
    switches[2].childNodes[3].classList.add("notransition");
    headerNavSwitch.checked = properties.headerNav;
    hideChatSwitch.checked = properties.hideChat;
    chatPositionSwitch.checked = !properties.leftChat;
    chatWidthInput.value = properties.chatWidth;
    hideChatSwitch.offsetHeight;
    switches[0].childNodes[3].classList.remove("notransition");
    switches[1].childNodes[3].classList.remove("notransition");
    switches[2].childNodes[3].classList.remove("notransition");
}

function getActiveTab() {
    return browser.tabs.query({ currentWindow: true, active: true });
}

function connectToContentScript() {
    const connectToTab = (tabs) => {
        if (tabs.length > 0) {
            port = browser.tabs.connect(tabs[0].id);
        }
        return Promise.resolve(port);
    }
    return getActiveTab().then(connectToTab);
}

initProperties().then(() => {
    cleanProperties();

    getActiveTab().then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
            yttw_getTabProperties: true
        }).then((response) => {
            if (response.data) {
                const data = response.data;
                for (var property in properties) {
                    if (typeof data[`yttw_${property}`] !== "undefined") {
                        properties[property] = data[`yttw_${property}`];
                    }
                }
            }
            setValues();
            for (var property in properties) {
                if (property.indexOf("_") === -1) {
                    handleDirty(property);
                }
            }
        }).catch(() => {
            setValues();
        });
    });
    connectToContentScript().then(() => {
        headerNavSwitch.addEventListener("click", toggleHeaderNav);
        hideChatSwitch.addEventListener("click", toggleHideChat);
        chatPositionSwitch.addEventListener("click", toggleChatPosition);
        chatWidthInput.onchange = handleChatWidthInput;
        saveAsDefaultsButton.addEventListener("click", saveAsDefaults);
    });
});
