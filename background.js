window.signature = null;
window.bookmarks = null;
window.lastId = null;
window.labels = null;
window.error = null;

function getXmlField(xml, field) {
  for (let child of xml.children) {
    if (child.nodeName === field) {
      return child;
    }
  }
  return null;
}

async function reloadBookmarks() {
  try {
    const xmlDocument = await $.ajax({
      method: 'GET',
      url: 'https://www.google.com/bookmarks/lookup?output=rss',
    });
    window.signature = getXmlField(
      xmlDocument.firstChild.firstChild,
      'smh:signature',
    ).textContent;
  } catch (error) {
    console.error('get signature error:', error);
    window.error = error;
  }

  try {
    const xmlDocument = await $.ajax({
      method: 'GET',
      url: 'https://www.google.com/bookmarks/lookup?output=xml',
    });
    console.log('reload bookmarks:', xmlDocument);

    window.bookmarks = xmlDocument.firstChild.firstChild.children;

    labels = {};
    for (let bookmark of window.bookmarks) {
      let blabels = getXmlField(bookmark, 'labels');
      for (let blabel of blabels.children) {
        labels[blabel.textContent] = true;
      }
    }
    window.labels = Object.keys(labels);
  } catch (error) {
    console.error('reload bookmarks error:', error);
    window.error = error;
  }
}

function openRandomBookmark(label) {
  if (!bookmarks) {
    return;
  }

  function hasLabel(bookmark, label) {
    for (let l of getXmlField(bookmark, 'labels').children) {
      if (l.textContent === label) {
        return true;
      }
    }
    return false;
  }

  while (true) {
    const idx = Math.floor(Math.random() * bookmarks.length);
    const bookmark = bookmarks[idx];
    if (hasLabel(bookmark, label)) {
      const url = getXmlField(bookmark, 'url').textContent;
      browser.tabs.create({ url });
      window.lastId = getXmlField(bookmark, 'id').textContent;
      break;
    }
  }
}

async function deleteLastOpened() {
  if (!window.lastId) {
    return;
  }

  try {
    const response = await $.ajax({
      method: 'GET',
      url: `https://www.google.com/bookmarks/mark?dlq=${window.lastId}&sig=${
        window.signature
      }`,
    });
    console.log('delete last opened:', response);
  } catch (error) {
    console.error('delete last opened error:', error);
    window.error = error;
  }
}

browser.runtime.onMessage.addListener(msg => {
  switch (msg.cmd) {
    case 'reload':
      reloadBookmarks();
      break;
    case 'random':
      openRandomBookmark(msg.label);
      break;
    case 'delete':
      deleteLastOpened();
      break;
  }
});

reloadBookmarks();
