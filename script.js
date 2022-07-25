const modal = document.getElementById('modal');
const modalShow = document.getElementById('show-modal');
const modalClose = document.getElementById('close-modal');
const bookmarkForm = document.getElementById('bookmark-form');
const websiteNameEl = document.getElementById('website-name');
const websiteUrlEl = document.getElementById('website-url');
const bookmarksContainer = document.getElementById('bookmarks-container');

let bookmarks = {};
let urls = new Set();

//Show Modal, Focus on Input
function showModal() {
    modal.classList.add('show-modal');
    websiteNameEl.focus();
}

//Modal event listener
modalShow.addEventListener('click', showModal);
modalClose.addEventListener('click', () => modal.classList.remove('show-modal'));
window.addEventListener('click', (e) => e.target === modal ? modal.classList.remove('show-modal') : false);

//Validate form
function validate(nameValue, urlValue) {
    const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const regex = new RegExp(expression);
    if (!nameValue || !urlValue) {
        alert('Please submit values for both fields.');
        return false;
    }
    if (!urlValue.match(regex)) {
        alert('please provide a valid web address');
        return false;
    }
    //valid
    return true;
}

//Build Bookmarks DOM
function buildBookmarks() {
    //Remove all bookmarks elements
    bookmarksContainer.textContent = '';
    //Build items
    Object.keys(bookmarks).forEach((id) => {
        const { name, url } = bookmarks[id];
        //Item
        const item = document.createElement('div');
        item.classList.add('item');
        item.setAttribute('onmouseover', `showFull(this)`);
        item.setAttribute('onmouseout', 'showLess(this)');
        item.setAttribute('onclick', `toggleTextClick(this)`);
        //View icon 
        const viewIcon = document.createElement('p');
        viewIcon.textContent = "View";
        //close icon
        const closeIcon = document.createElement('i');
        closeIcon.classList.add('fa-solid', 'fa-xmark');
        closeIcon.setAttribute('title', 'Delete Bookmark');
        closeIcon.setAttribute('onclick', `deleteBookmark('${id}')`);
        //Favicon / Link container
        const linkInfo = document.createElement('div');
        linkInfo.classList.add('name');
        //Favicon
        const favicon = document.createElement('img');
        favicon.setAttribute('src', `https://www.google.com/s2/u/0/favicons?domain=${url}`);
        favicon.setAttribute('alt', 'Favicon');
        //Link
        const link = document.createElement('a');
        link.setAttribute('href', `${url}`);
        link.setAttribute('target', '_blank');
        link.textContent = name;
        //Append to bookmark container
        linkInfo.append(favicon, link);
        item.append(viewIcon, closeIcon, linkInfo);
        bookmarksContainer.appendChild(item);
    });
}

//time counter
let timeout = null;
//showFull content
function showFull(curr) {
    timeout = setTimeout(() => { curr.querySelector('a').classList.add('show-full'); }, 3000);
}

//showLess content
function showLess(curr) {
    clearTimeout(timeout);
    curr.querySelector('a').classList.remove('show-full');
}

//Toggle text 
function toggleTextClick(curr) {
    curr.querySelector('a').classList.toggle('show-full');
}

//Fetch bookmarks
function fetchBookmarks() {
    //Get bookmarks from localstorage if available
    if (localStorage.getItem('bookmarks')) {
        bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
    } else {
        //Create bookmarks array in localStorage
        const id = idGenerator("https://github.com/milan10110");
        bookmarks[id] = {
            name: 'Milan\'s Github',
            url: 'https://github.com/milan10110',
        };
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
    populateUrls();
    buildBookmarks();
}

//Delete Bookmark
function deleteBookmark(id) {
    if (bookmarks[id]) {
        urls.delete(id.slice(0, id.length - 13));
        delete bookmarks[id];
        delete bookmarks.id;
    }
    //Update bookmarks array in localStorage, re-populate DOM
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    fetchBookmarks();
    populateUrls();
    console.log(urls);
}

//Handle data from form
function storeBookmark(e) {
    e.preventDefault();
    const nameValue = websiteNameEl.value;
    let urlValue = websiteUrlEl.value;
    if (!(urlValue.includes('http://') || urlValue.includes('https://'))) {
        urlValue = `https://${urlValue}`;
    }
    if (!validate(nameValue, urlValue)) {
        return false;
    };

    if (urls.has(urlValue)) {
        confirm("This url already exists, Still want to continue?");
    }

    const bookmark = {
        name: nameValue,
        url: urlValue,
    }

    bookmarks[idGenerator(urlValue)] = bookmark;
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    fetchBookmarks();
    bookmarkForm.reset();
    websiteNameEl.focus();
}

function populateUrls() {
    Object.keys(bookmarks).forEach((id) => {
        urls.add(id.slice(0, id.length - 13));
    });
}

//Unique id generator 
function idGenerator(url) {
    return url + Date.now();
}

//Event Listener
bookmarkForm.addEventListener('submit', storeBookmark);

//On load, fetch bookmarks
fetchBookmarks();
