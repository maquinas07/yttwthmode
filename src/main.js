const pageManager = document.getElementById("page-manager");
const pageManagerContainer = document.getElementsByClassName("ytd-page-manager")[0];

const theaterContainer = document.getElementById("player-theater-container");

const chatFrame = document.getElementById("chatframe");

const primaryColumn = document.getElementById("primary");
const related = document.getElementById("related");
const headerNav = document.getElementById("masthead-container");

const miniPlayer = document.getElementsByClassName("ytd-miniplayer")[0];

const toggleVideoPlayerStyle = () => {
    if (!document.documentElement.style.overflow) {
        document.documentElement.style.overflow = "hidden";
    } else {
        document.documentElement.style.overflow = "";
    }
    if (!pageManager.style.marginTop) {
        pageManager.style.marginTop = "0px";
    } else {
        pageManager.style.marginTop = "";
    }
    if (theaterContainer.style.height !== "100vh") {
        theaterContainer.style.cssText = theaterContainer.style.cssText + "width: calc(100% - 400px); height: 100vh; max-height: none;"
    } else {
        theaterContainer.style.width = "";
        theaterContainer.style.height = "";
        theaterContainer.style.maxHeight = "";
    }
}

const toggleChatFrameStyle = () => {
    if (chatFrame.style.height !== "100vh") {
        chatFrame.style.cssText = chatFrame.style.cssText + "width: 400px; height: 100vh; position: absolute; right: 0px; top: 0px;"
    } else {
        chatFrame.style.width = "";
        chatFrame.style.height = "";
        chatFrame.style.position = "";
        chatFrame.style.right = "";
        chatFrame.style.top = "";
    }
}

const toggleHideElements = () => {
    if (!related.style.display) {
        related.style.display = "none";
    } else {
        related.style.display = "";
    }
    if (!headerNav.style.display) {
        headerNav.style.display = "none";
    } else {
        headerNav.style.display = "";
    }
}

const toggleMode = () => {
    toggleHideElements();
    toggleVideoPlayerStyle();
    toggleChatFrameStyle();
}

const handleTheaterMode = (mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.attributeName === 'theater') {
            toggleMode();
        }
    }
}

const theaterToggleObserver = new MutationObserver(handleTheaterMode);
theaterToggleObserver.observe(pageManagerContainer, { attributes: true });

if (theaterContainer.hasChildNodes()) {
    toggleMode();
}