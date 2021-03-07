var pageManager;
var pageManagerContainer;

var theaterContainer;

var meta;
var info;
var related;
var headerNav;

var normalComments;

var chatWidth = "400px";

var isTheater = false;
var isOneColumn = false;

var chat;
var chatFrame;
var hideButton;

var isLive;
var isArchive;

const reloadPageElems = () => {
    pageManager = document.getElementById("page-manager");
    pageManagerContainer = document.getElementsByClassName("ytd-page-manager")[0];

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
}

const toggleVideoPlayerStyle = () => {
    if (isTheater) {
        document.documentElement.style.overflow = "hidden";
        pageManager.style.marginTop = "0px";
        theaterContainer.style.width = `calc(100% - ${chatWidth})`;
        theaterContainer.style.height = "100vh";
        theaterContainer.style.maxHeight = "none";
        if (isOneColumn) {
            toggleIsOneColumn();
        }
    } else {
        document.documentElement.style.overflow = "";
        pageManager.style.marginTop = "";
        theaterContainer.style.width = "";
        theaterContainer.style.height = "";
        theaterContainer.style.maxHeight = "";
    }
}

const toggleChatFrameStyle = () => {
    reloadChatElems();
    if (isTheater) {
        chatFrame.style.width = chatWidth;
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
    if (isTheater) {
        related.style.display = "none";
        headerNav.style.display = "none";
    } else {
        related.style.display = "";
        headerNav.style.display = "";
    }
}

const toggleMode = () => {
    toggleHideElements();
    toggleChatFrameStyle();
    toggleVideoPlayerStyle();
}

const toggleIsOneColumn = () => {
    if (isTheater && isOneColumn) {
        reloadChatElems();
        theaterContainer.style.width = "100%";
        theaterContainer.style.height = "";
        chat.style.marginTop = "0px";
        chatFrame.style.width = "100%";
        chatFrame.style.height = "calc(100vh - ((var(--ytd-watch-flexy-height-ratio)/var(--ytd-watch-flexy-width-ratio))*100vw))";
        chatFrame.style.maxHeight = `calc(100vh - ${getComputedStyle(theaterContainer).minHeight})`;
        chatFrame.style.position = "absolute";
        chatFrame.style.left = "0px";
        chatFrame.style.bottom = "0px";
        chatFrame.style.right = "";
        chatFrame.style.top = "";
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
        chatFrame.style.left = "";
        chatFrame.style.maxHeight = "";
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
        }
    }
}

const tryInject = (count) => {
    if (count < 1) {
        return;
    }
    reloadPageElems();
    reloadChatElems();
    isLive = chat || chatFrame;
    isArchive = isLive && normalComments;

    var ready;
    if (isLive && theaterContainer && pageManagerContainer) {
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
    } else {
        setTimeout(() => {
            tryInject(--count);
        }, 500);
    }
}

tryInject(20);