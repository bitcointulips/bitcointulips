// see if this document mentions bitcoin at all initially
var bitcoin=hasBitcoin(document.documentElement.innerHTML);

//console.log("Bitcoin reference "+ (bitcoin==true ? "":"not ") + "found in intial document load.");
var initialized=false;

// checks a string for direct bitcoin references
function hasBitcoin(text)
{
    return /\b[Bb]it[Cc]oins?\b/.test(text);
}


function walk(rootNode)
{
    // Find all the text nodes in rootNode
    var walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        null,
        false
    ),
    node;

    // Modify each text node's value
    while (node = walker.nextNode()) {
        handleText(node);
    }
}

function handleText(textNode) {
    var nodeVal=textNode.nodeValue;

    // if no bitcoin text has been found so far,
    // maybe this callback is adding some?
    if (initialized && !bitcoin) {
	bitcoin=hasBitcoin(nodeVal);
	if (bitcoin) {
	    console.log ("Bitcoin text introduced via callback.");
	}
    }

    if (bitcoin) {
	textNode.nodeValue = replaceText(nodeVal);
    }
}

function replaceText(v)
{
    // compound phrases
    v = v.replace(/\b(a|one|single|each)\s+[Bb]it[Cc]oin\b/g,"$1 tulip");

    v = v.replace(/\bBitcoin\s+mining\b/g,"Tulip gardening");
    v = v.replace(/\bBitcoin\s+Mining\b/g,"Tulip Gardening");
    v = v.replace(/\bbitcoin\s+mining\b/g,"tulip gardening");

    v = v.replace(/\bMining\s+[Bb]itcoins?\b/g,"Planting tulips");
    v = v.replace(/\bmining\s+[Bb]itcoins?\b/g,"planting tulips");

    v = v.replace(/\bmine\s+[Bb]itcoins?\b/g,"plant tulips");

    v = v.replace(/\bBitcoin\s+miner(s)?\b/g,"Tulip gardener$1");
    v = v.replace(/\bbitcoin\s+miner(s)?\b/g,"tulip gardener$1");

    v = v.replace(/\bbitcoin\s+(is|isn[\'\’]t)\b/g,"a tulip $1");
    v = v.replace(/\bBitcoin\s+(is|isn[\'\’]t)\b/g,"A tulip $1");

    v = v.replace(/\b([Ii]s|[Ii]sn[\'\’]t)\s+Bitcoin\b/g,"$1 a Tulip");
    v = v.replace(/\b([Ii]s|[Ii]sn[\'\’]t)\s+bitcoin\b/g,"$1 a tulip");

    v = v.replace(/\bbitcoin\s+block[\s-]*chain(s)?\b/g, "tulip fertilizer$1");
    v = v.replace(/\bBitcoin\s+block[\s-]*chain(s)?\b/g, "Tulip fertilizer$1");
    
    // bitcoin
    v = v.replace(/\bBit[Cc]oins\b/g, "Tulips");
    v = v.replace(/\bbit[Cc]oins\b/g, "tulips");

    v = v.replace(/\bbitcoin\b/g, "tulips");
    v = v.replace(/\bBit[Cc]oin\b/g, "Tulips");

    v = v.replace(/\bBITCOIN(S)?\b/g, "TULIPS");


    // clean up plural possessives
    v = v.replace(/\b(T|t)(ulips|ULIPS)(\'|\’)[Ss]\b/g, "$1$2$3");


    
    // blockchain
    v = v.replace(/\bblock[\s-]*chain(s)?\b/g, "fertilizer$1");
    v = v.replace(/\bBlock[\s-]*[Cc]hain(s)?\b/g, "Fertilizer$1");
    v = v.replace(/\bBLOCK[\s-]*CHAIN(S)?\b/g, "FERTILIZER$1");

    // mining
    v=v.replace(/\bmining\b/g,"gardening");
    v=v.replace(/\bMining\b/g,"Gardening");
    v=v.replace(/\bMINING\b/g,"GARDENING");
    v=v.replace(/\bminer(s)?\b/g,"gardener$1");
    v=v.replace(/\bMiner(s)?\b/g,"Gardener$1");
    v=v.replace(/\bMINER(S)?\b/g,"GARDENER$1");
    
    return v;
}

// Returns true if a node should *not* be altered in any way
function isForbiddenNode(node) {
    return node.isContentEditable || // DraftJS and many others
    (node.parentNode && node.parentNode.isContentEditable) || // Special case for Gmail
    (node.tagName && (node.tagName.toLowerCase() == "textarea" || // Some catch-alls
                     node.tagName.toLowerCase() == "input"));
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
    var i, node;

    mutations.forEach(function(mutation) {
        for (i = 0; i < mutation.addedNodes.length; i++) {
            node = mutation.addedNodes[i];
            if (isForbiddenNode(node)) {
                // Should never operate on user-editable content
                continue;
            } else if (node.nodeType === 3) {
                // Replace the text for text nodes
                handleText(node);
            } else {
                // Otherwise, find text nodes within the given node and replace text
                walk(node);
            }
        }
    });
}

// Walk the doc (document) body, replace the title, and observe the body and title
function walkAndObserve(doc) {
    var docTitle = doc.getElementsByTagName('title')[0],
    observerConfig = {
        characterData: true,
        childList: true,
        subtree: true
    },
    bodyObserver, titleObserver;

    // Do the initial text replacements in the document body and title
    // This is only done if page contents include "bitcoin",
    // so that "mining" in other contexts isn't accidentally replaced.
    if (bitcoin) {
	walk(doc.body);
	doc.title = replaceText(doc.title);
    }

    // Observe the body so that we replace text in any added/modified nodes
    bodyObserver = new MutationObserver(observerCallback);
    bodyObserver.observe(doc.body, observerConfig);

    // Observe the title so we can handle any modifications there
    if (docTitle) {
        titleObserver = new MutationObserver(observerCallback);
        titleObserver.observe(docTitle, observerConfig);
    }
}

walkAndObserve(document);
initialized=true;
