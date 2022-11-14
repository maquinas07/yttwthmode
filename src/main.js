import { browser, properties, initProperties } from "./common/properties";

let pageManager;
let pageManagerContainer;

let theaterContainer;
let secondaryColumn;

let meta;
let info;
let related;
let headerNav;

let normalComments;

let isTheater = false;
let isOneColumn = false;

let chat;
let chatFrame;
let hideButton;
let isChatDisabled;

let isLive;
let isArchive;

let prevScroll = 0;
const headerNavHeight = 56;

const reloadPageElems = () => {
    pageManager = document.getElementById("page-manager");
    pageManagerContainer = document.querySelector("ytd-watch-flexy.ytd-page-manager");

    theaterContainer = document.getElementById("player-theater-container");
    secondaryColumn = document.querySelector("#secondary.ytd-watch-flexy");

    meta = document.getElementById("meta");
    info = document.getElementById("info");
    related = document.getElementById("related");
    headerNav = document.getElementById("masthead-container");

    normalComments = document.getElementById("comments");
}

const reloadChatElems = () => {
    chat = document.getElementById("chat");
    chatFrame = document.getElementById("chatframe");
    hideButton = document.querySelector("#show-hide-button");

    if (chatFrame && !hideButton.querySelector("button")) {
        isChatDisabled = true;
    } else {
        isChatDisabled = false;
    }
}

const reloadIsLive = () => {
    isLive = chat || chatFrame;
    isArchive = isLive && normalComments;
    if (isChatDisabled || (isArchive && normalComments.getAttribute("hidden") === null && !properties.enabledInArchives)) {
        isLive = false
    }
}

const toggleVideoPlayerStyle = () => {
    if (isTheater && isLive) {
        document.documentElement.style.overflow = "hidden";
        pageManager.style.marginTop = `${properties.headerNav ? headerNavHeight : 0}px`;
        secondaryColumn.style.position = "static";
        theaterContainer.style.width = `calc(100% - ${(properties.hideChat || isChatDisabled) ? 0 : properties.chatWidth}px)`;
        theaterContainer.style.height = `calc(100vh - ${properties.headerNav ? headerNavHeight : 0}px)`;
        theaterContainer.style.maxHeight = "none";
        if (properties.leftChat) {
            theaterContainer.style.left = `${(properties.hideChat || isChatDisabled || isOneColumn) ? 0 : properties.chatWidth}px`;
        } else {
            theaterContainer.style.left = "";
        }
        if (isOneColumn) {
            toggleIsOneColumn();
        }
        prevScroll = document.documentElement.scrollTop;
        scroll(0, 0);
    } else {
        document.documentElement.style.overflow = "";
        pageManager.style.marginTop = "";
        secondaryColumn.style.position = "";
        theaterContainer.style.width = "";
        theaterContainer.style.height = "";
        theaterContainer.style.maxHeight = "";
        theaterContainer.style.left = "";
        if (isLive) {
            scroll(0, prevScroll);
        }
    }
}

const toggleChatFrameStyle = (chatElem) => {
    reloadChatElems();
    if (isTheater && isLive) {
        hideButton.style.display = "none";
        chat.removeAttribute("collapsed");
        chatElem.style.width = `${properties.chatWidth}px`;
        chatElem.style.height = `calc(100vh - ${properties.headerNav ? headerNavHeight : 0}px)`;
        chatElem.style.position = "absolute";
        if (chatElem !== chatFrame) {
            chatElem.style.top = `${properties.headerNav ? headerNavHeight : 0}px`;
        }

        if (properties.leftChat) {
            chatElem.style.left = "0px";
            chatElem.style.right = "";
        } else {
            chatElem.style.right = "0px";
            chatElem.style.left = "";
        }
        if (properties.hideChat) {
            chatElem.style.zIndex = -1;
        } else {
            chatElem.style.zIndex = "";
        }
        window.dispatchEvent(new Event("resize"));
    } else {
        chatElem.style.zIndex = "";
        chatElem.style.width = "";
        chatElem.style.height = "";
        chatElem.style.position = "";
        chatElem.style.top = "";
        chatElem.style.left = "";
        chatElem.style.right = "";
        hideButton.style.display = "";
    }
}

const toggleHideElements = () => {
    if (isTheater && isLive && !properties.headerNav) {
        related.style.display = "none";
        headerNav.style.display = "none";
    } else {
        related.style.display = "";
        headerNav.style.display = "";
    }
}

const toggleMode = () => {
    reloadChatElems();
    reloadIsLive();
    if (isLive) {
        toggleHideElements();
        toggleChatFrameStyle(chat);
        toggleChatFrameStyle(chatFrame);
        toggleVideoPlayerStyle();

        // Bad (but working) workaround for initialization race condition where the video player would be wider
        // than the theater container and clip inside the chat.
        const video = document.getElementsByClassName("video-stream")[0];
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const dirtyWorkaround = () => {
            if (video.style.width !== `${vw - properties.chatWidth}px` && video.style.width !== vw) {
                window.dispatchEvent(new Event("resize"));
                setTimeout(() => {
                    dirtyWorkaround();
                }, 500);
            } else {
                return;
            }
        }
        dirtyWorkaround();
        return true;
    } else {
        toggleHideElements();
        toggleVideoPlayerStyle();

        return false;
    }
}

const toggleIsOneColumn = () => {
    /* There's strange behavior using calc() in Firefox.
        `chatFrame.style.maxHeight = calc(100vh - ${window.getComputedStyle(theaterContainer).minHeight})`
        sets calc(-480px + 100vh) to the max-height attribute and it fails to render.
        But even stranger, it works when ran directly from the debug console.
    */
    const primaryColumn = document.getElementById("primary-inner") ? document.getElementById("primary-inner").parentElement : null;
    if (isTheater && isLive && isOneColumn) {
        reloadChatElems();
        theaterContainer.style.width = "100%";
        theaterContainer.style.height = "";
        if (!properties.hideChat) {
            hideButton.style.display = "none";
            chat.style.marginTop = "0px";
            chat.style.right = "";
            chat.style.top = "";
            chat.style.position = "";
            chat.style.width = "100%";
            chat.style.height = `min(100vh - var(--ytd-watch-flexy-height-ratio) / var(--ytd-watch-flexy-width-ratio) * 100vw - ${properties.headerNav ? headerNavHeight : 0}px, 100vh - ${window.getComputedStyle(theaterContainer).minHeight} - ${properties.headerNav ? headerNavHeight : 0}px)`;
            /*
                Weird behavior in Firefox (described above) doesn't allow to set this minimum height.
                This causes chat to overflow down in some screen sizes when YouTube is in one column mode.
            */
            // chat.style.minHeight = `max(100vh - ((var(--ytd-watch-flexy-height-ratio) / var(--ytd-watch-flexy-width-ratio)) * 100vw, 100vh - ${window.getComputedStyle(theaterContainer).minHeight})`;
            chatFrame.style.width = "100%";
            chatFrame.style.height = `100%`;
            chatFrame.style.right = "";
            chatFrame.style.top = "";
            chatFrame.style.position = "";
        }
        if (primaryColumn) {
            primaryColumn.style.marginLeft = "0px";
            primaryColumn.style.paddingRight = "0px";
        }
        meta.style.display = "none";
        info.style.display = "none";
        if (isArchive) {
            normalComments.style.display = "none";
        }
    } else {
        chat.style.marginTop = "";
        chat.style.height = "";
        toggleVideoPlayerStyle();
        toggleChatFrameStyle(chat);
        toggleChatFrameStyle(chatFrame);
        if (primaryColumn) {
            primaryColumn.style.marginLeft = "";
            primaryColumn.style.paddingRight = "";
        }
        meta.style.display = "";
        info.style.display = "";
        if (isArchive) {
            normalComments.style.display = "";
        }
    }
}

const handleTheaterMode = (mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.attributeName === "theater") {
            isTheater = !isTheater;
            toggleMode();
        } else if (mutation.attributeName === "is-two-columns_") {
            isOneColumn = mutation.target.getAttribute("is-two-columns_") == null;
            if (mutation.target.getAttribute("fullscreen") == null) {
                toggleVideoPlayerStyle();
                toggleIsOneColumn();
            }
        } else if (mutation.attributeName === "fullscreen") {
            if (mutation.target.getAttribute("fullscreen") != null) {
                chatFrame.style.zIndex = -1;
                chat.style.zIndex = -1;
                theaterContainer.style.width = "100%";
                theaterContainer.style.height = "100vh";
                pageManager.style.marginTop = "";
            } else {
                chat.style.zIndex = "";
                chatFrame.style.zIndex = "";
                reloadIsLive();
                toggleHideElements();
                toggleVideoPlayerStyle();
                toggleChatFrameStyle(chat);
                toggleChatFrameStyle(chatFrame);
                toggleIsOneColumn();
            }
        } else if (mutation.attributeName === "hidden" || mutation.attributeName === "video-id") {
            let ready;

            isLive = false;
            chat = null;
            chatFrame = null;

            const tryToggle = (count) => {
                ready = toggleMode();
                if (count < 1 || ready) {
                    return;
                }
                setTimeout(() => {
                    tryToggle(--count);
                }, 500);
            }
            tryToggle(20);

            if (!ready) {
                toggleMode();
            }
        }
    }
}

const tryInject = (count) => {
    if (count < 1) {
        return;
    }

    reloadPageElems();

    let ready;
    if (theaterContainer && pageManagerContainer) {
        const theaterToggleObserver = new MutationObserver(handleTheaterMode);
        theaterToggleObserver.observe(pageManagerContainer, { attributes: true });

        if (pageManagerContainer.getAttribute("is-two-columns_") == null) {
            isOneColumn = true;
        }

        if (theaterContainer.hasChildNodes()) {
            isTheater = true;
            toggleMode();
        }
        ready = true;
    }
    if (ready) {
        return;
    }
    setTimeout(() => {
        tryInject(--count);
    }, 500);
}

initProperties().then(() => {
    browser.runtime.onMessage.addListener((request) => {
        if (request.yttw_getTabProperties) {
            return Promise.resolve({
                data: properties
            });
        }
    });

    browser.runtime.onConnect.addListener((port) => {
        port.onMessage.addListener((request) => {
            if (request.yttw_layoutChange) {
                let changed = false;
                const property = request.property;
                if (properties[property] !== request[property]) {
                    properties[property] = request[property];
                    changed = true;
                }
                if (changed) {
                    reloadIsLive();
                    toggleHideElements();
                    toggleVideoPlayerStyle();
                    toggleChatFrameStyle(chat);
                    toggleChatFrameStyle(chatFrame);
                    toggleIsOneColumn();
                    window.dispatchEvent(new Event("resize"));
                }
            }
        });
    });
    tryInject(20);
});
