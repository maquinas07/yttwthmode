var pageManager;
var pageManagerContainer;

var theaterContainer;

var meta;
var info;
var related;
var headerNav;
var primaryColumn;

var normalComments;

var chatWidth = 400;

var isTheater = false;
var isOneColumn = false;

var chat;
var chatFrame;
var hideButton;
var isChatDisabled;

var isLive;
var isArchive;

var prevScroll = 0;

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
        pageManager.style.marginTop = "0px";
        if (isChatDisabled) {
            theaterContainer.style.width = "100%";
        } else {
            theaterContainer.style.width = `calc(100% - ${chatWidth}px)`;
        }
        theaterContainer.style.height = "100vh";
        theaterContainer.style.maxHeight = "none";
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
        if (isLive) {
            scroll(0, prevScroll);
        }
    }
}

const toggleChatFrameStyle = () => {
    reloadChatElems();
    if (isTheater && isLive && !isChatDisabled) {
        chatFrame.style.width = `${chatWidth}px`;
        chatFrame.style.height = "100vh";
        chatFrame.style.position = "absolute";
        chatFrame.style.right = "0px";
        chatFrame.style.top = "0px";
    } else {
        chatFrame.style.width = "";
        chatFrame.style.height = "";
        chatFrame.style.position = "";
        chatFrame.style.right = "";
        chatFrame.style.top = "";
    }
}

const toggleHideElements = () => {
    if (isTheater && isLive) {
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
            if (video.style.width !== `${vw - chatWidth}px`) {
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
        But even stranger, it works when ran directly from the debug console. */
    const primaryColumn = document.getElementById("primary-inner") ? document.getElementById("primary-inner").parentElement : null;
    if (isTheater && isOneColumn) {
        reloadChatElems();
        theaterContainer.style.width = "100%";
        theaterContainer.style.height = "";
        if (!isChatDisabled) {
            chat.style.marginTop = "0px";
            chat.style.height = `calc(100vh - ((var(--ytd-watch-flexy-height-ratio) / var(--ytd-watch-flexy-width-ratio)) * 100vw)`;
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
            isOneColumn = !isOneColumn;
            toggleIsOneColumn();
        } else if (mutation.attributeName === "fullscreen") {
            if (mutation.target.getAttribute("fullscreen") != null) {
                chatFrame.style.zIndex = -1;
                theaterContainer.style.width = "100%";
            } else {
                chatFrame.style.zIndex = "";
                toggleVideoPlayerStyle();
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
            isOneColumn = true
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

tryInject(20);