const pageManager = document.getElementById("page-manager");
const pageManagerContainer = document.getElementsByClassName("ytd-page-manager")[0];

const theaterContainer = document.getElementById("player-theater-container");

const meta = document.getElementById("meta");
const info = document.getElementById("info");
const related = document.getElementById("related");
const headerNav = document.getElementById("masthead-container");

const miniPlayer = document.getElementsByClassName("ytd-miniplayer")[0];

var chatWidth = "400px";

var isTheater = false;
var isOneColumn = false;

var chat = document.getElementById("chat");
var chatFrame = document.getElementById("chatframe");
var hideButton = document.getElementById("show-hide-button");

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
    } else {
        toggleVideoPlayerStyle();
        toggleChatFrameStyle();
        chat.style.marginTop = "";
        chatFrame.style.left = "";
        chatFrame.style.maxHeight = "";
        meta.style.display = "";
        info.style.display = "";
        hideButton.style.display = "";
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

const theaterToggleObserver = new MutationObserver(handleTheaterMode);
theaterToggleObserver.observe(pageManagerContainer, { attributes: true });

if (pageManagerContainer.getAttribute("is-two-columns_") == null) {
    isOneColumn = true
}

if (theaterContainer.hasChildNodes()) {
    isTheater = true;
    toggleMode();
}