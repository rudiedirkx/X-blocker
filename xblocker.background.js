
// Ignore blocking per tab
var ignoredTabs = {};
function setPageActionIcon(tabId, ignored) {
	var icon = ignored ? '128x128-grayscale' : '128x128';
	chrome.pageAction.setIcon({
		tabId: tabId,
		path: chrome.runtime.getURL('images/' + icon + '.png'),
	});
}

// Init patterns from local storage
console.time('Back-end init');
var regexes;
function loadPatterns() {
	xb.load(function(patterns) {
		regexes = patterns.map(xb.strToRegex);

		console.timeEnd('Back-end init');
		console.log('patterns', regexes);
	});
}
loadPatterns();



// Set up request filter
var filter = {
	// Check all URLs dynamically.
	urls: ["<all_urls>"],
	// Block everything but 'main_frame'.
	types: ["sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"],
};
var extraInfoSpec = ['blocking'];
chrome.webRequest.onBeforeRequest.addListener(function(details) {

	// Ignore this tab
	if (ignoredTabs[details.tabId]) {
		setPageActionIcon(details.tabId, true);
		chrome.pageAction.show(details.tabId);
		return;
	}

	if ( !regexes ) return;

	for (var i=0, L=regexes.length; i<L; i++) {
		var regex = regexes[i];
		if (regex.test(details.url)) {

			console.log('BLOCKING', details.url);

			if (details.tabId) {
				chrome.pageAction.show(details.tabId);
			}

			return {
				cancel: true
			};
		}
	}

}, filter, extraInfoSpec);



// Listen for config changes from options page
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	// Options page saved tokens
	if ( msg && msg.RELOAD ) {
		loadPatterns();
		console.log('Incoming RELOAD event handled from options page');

		sendResponse();
	}
});



// Listen for page action click
chrome.pageAction.onClicked.addListener(function(tab) {
	ignoredTabs[tab.id] = !ignoredTabs[tab.id];
	setPageActionIcon(tab.id, ignoredTabs[tab.id]);

	if (ignoredTabs[tab.id]) {
		chrome.tabs.reload(tab.id);
		console.log('IGNORING TAB:', tab.id)
	}
	else {
		console.log('STOP IGNORING TAB:', tab.id)
	}
});
