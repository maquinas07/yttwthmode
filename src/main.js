import { browser, properties, initProperties } from "./common/properties";

var pageManager;
var pageManagerContainer;

var theaterContainer;

var meta;
var info;
var related;
var headerNav;

var normalComments;

var isTheater = false;
var isOneColumn = false;

var chat;
var chatFrame;
var hideButton;
var isChatDisabled;

var isLive;
var isArchive;

var prevScroll = 0;
const headerNavHeight = 56;

const reloadPageElems = () => {
    pageManager = document.getElementById("page-manager");
    const pageManagerList = document.getElementsByClassName("ytd-page-manager");
    for (var i = 0; i < pageManagerList.length; i++) {
        if (pageManagerList[i].nodeName === "YTD-WATCH-FLEXY") {
            pageManagerContainer = pageManagerList[i];
        }
    }

    theaterContainer = document.getElementById("player-theater-container");

    meta = document.getElementById("meta");
    info = document.getElementById("info");
    related = document.getElementById("related");
    headerNav = document.getElementById("masthead-container");

    normalComments = document.getElementById("comments");
}

const reloadChatElems = () => {
    chat = document.getElementById("chat");
    chatFrame = document.getElementById("chatframe");
    hideButton = document.getElementById("show-hide-button");

    if (chatFrame && hideButton && hideButton.childElementCount === 0) {
        isChatDisabled = true;
    } else {
        isChatDisabled = false;
    }
}

const reloadIsLive = () => {
    isLive = chat || chatFrame;
    isArchive = isLive && normalComments;
}

const toggleVideoPlayerStyle = () => {
    if (isTheater && isLive) {
        document.documentElement.style.overflow = "hidden";
        pageManager.style.marginTop = `${properties.headerNav ? headerNavHeight : 0}px`;
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
        theaterContainer.style.width = "";
        theaterContainer.style.height = "";
        theaterContainer.style.maxHeight = "";
        theaterContainer.style.left = "";
        if (isLive) {
            scroll(0, prevScroll);
        }
    }
}

const toggleChatFrameStyle = () => {
    reloadChatElems();
    if (isTheater && isLive && !isChatDisabled) {
        if (chat.getAttribute("collapsed") !== null) {
            hideButton.querySelector("#button").click();
        }
        chatFrame.style.width = `${properties.chatWidth}px`;
        chatFrame.style.height = `calc(100vh - ${properties.headerNav ? headerNavHeight : 0}px)`;
        chatFrame.style.position = "absolute";
        chatFrame.style.top = `${properties.headerNav ? headerNavHeight : 0}px`;
        if (properties.leftChat) {
            chatFrame.style.left = "0px";
            chatFrame.style.right = "";
        } else {
            chatFrame.style.right = "0px";
            chatFrame.style.left = "";
        }
        if (properties.hideChat) {
            chatFrame.style.zIndex = -1;
        } else {
            chatFrame.style.zIndex = "";
        }
        window.dispatchEvent(new Event("resize"));
    } else {
        chatFrame.style.zIndex = "";
        chatFrame.style.width = "";
        chatFrame.style.height = "";
        chatFrame.style.position = "";
        chatFrame.style.top = "";
        chatFrame.style.left = "";
        chatFrame.style.right = "";
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
        toggleChatFrameStyle();
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
    if (isTheater && isOneColumn) {
        reloadChatElems();
        theaterContainer.style.width = "100%";
        theaterContainer.style.height = "";
        if (!isChatDisabled && !properties.hideChat) {
            chat.style.marginTop = "0px";
            chat.style.height = `max(100vh - ((var(--ytd-watch-flexy-height-ratio) / var(--ytd-watch-flexy-width-ratio)) * 100vw, 100vh - ${window.getComputedStyle(theaterContainer).minHeight})`;
            /*
                Weird behavior in Firefox (described above) doesn't allow to set this minimum height.
                This causes chat to overflow down in some screen sizes when YouTube is in one column mode.
            */
            // chat.style.minHeight = `max(100vh - ((var(--ytd-watch-flexy-height-ratio) / var(--ytd-watch-flexy-width-ratio)) * 100vw, 100vh - ${window.getComputedStyle(theaterContainer).minHeight})`;
            chatFrame.style.width = "100%";
            chatFrame.style.height = `max(100vh - ((var(--ytd-watch-flexy-height-ratio) / var(--ytd-watch-flexy-width-ratio)) * 100vw, 100vh - ${window.getComputedStyle(theaterContainer).minHeight})`;
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
        hideButton.style.display = "none";
        if (isArchive) {
            normalComments.style.display = "none";
        }
    } else {
        toggleVideoPlayerStyle();
        toggleChatFrameStyle();
        chat.style.marginTop = "";
        chat.style.height = "";
        if (primaryColumn) {
            primaryColumn.style.marginLeft = "";
            primaryColumn.style.paddingRight = "";
        }
        meta.style.display = "";
        info.style.display = "";
        hideButton.style.display = "";
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
            if (mutation.target.getAttribute("fullscreen") == null) {
                isOneColumn = mutation.target.getAttribute("is-two-columns_") == null;
                toggleVideoPlayerStyle();
                toggleIsOneColumn();
            }
        } else if (mutation.attributeName === "fullscreen") {
            if (mutation.target.getAttribute("fullscreen") != null) {
                chatFrame.style.zIndex = -1;
                chat.style.zIndex = -1;
                theaterContainer.style.width = "100%";
            } else {
                chatFrame.style.zIndex = "";
                toggleVideoPlayerStyle();
                toggleChatFrameStyle();
                toggleIsOneColumn();
            }
        } else if (mutation.attributeName === "hidden" || mutation.attributeName === "video-id") {
            var ready;

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

    var ready;
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
            var thisProperties = {};
            for (var property in properties) {
                thisProperties[`yttw_${property}`] = properties[property];
            }
            return Promise.resolve({
                data: thisProperties
            });
        }
    });
    
    browser.runtime.onConnect.addListener((port) => {
        port.onMessage.addListener((request) => {
            if (request.yttw_layoutChange) {
                var changed = false;
                for (var property in properties) {
                    if (typeof request[`yttw_${property}`] !== "undefined" && properties[property] !== request[`yttw_${property}`]) {
                        properties[property] = request[`yttw_${property}`];
                        changed = true;
                        break;
                    }
                }
                if (changed) {
                    toggleHideElements();
                    toggleVideoPlayerStyle();
                    toggleChatFrameStyle();
                    toggleIsOneColumn();
                }
            }
        })
    });
    tryInject(20);
});
