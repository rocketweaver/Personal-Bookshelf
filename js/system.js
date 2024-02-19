// {
//     id: string | number,
//     title: string,
//     author: string,
//     year: number,
//     isComplete: boolean,
// }

const books = [];
const RENDER_EVENT = 'render-books';

const SEARCH_EVENT = 'search-books';

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'PERSONAL_BOOKSHELF';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete
    }
}

function findBook(bookId) {
    for(bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function findBookIndex(bookId) {
    for (index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }

    return -1;
}

function searchBook(words) {
    let searchedBooks = books.filter(item => 
        item.title.includes(words) || 
        item.author.includes(words) || 
        item.year.toString().includes(words)
    );

    const searchEvent = new CustomEvent(SEARCH_EVENT, { detail: { searchedBooks } });
    document.dispatchEvent(searchEvent);
}


function isStorageExist() {
    if(typeof(Storage) === undefined) {
        alert('Browser tidak mendukung!');
        return false;
    } 

    return true;
}

function saveData(action) {
    if(isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);

        const saveDataEvent = new CustomEvent(SAVED_EVENT, { detail: {
            action : action
        } });

        document.dispatchEvent(saveDataEvent);
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


function makeBook(bookObject) {
    const {id, title, author, year, isComplete} = bookObject;
  
    const textTitle = document.createElement('h3');
    textTitle.innerText = title;
  
    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun: ' + year;

    const action = document.createElement('div');
    action.classList.add('action');
  
    const container = document.createElement('div');
    container.classList.add('item', 'w-100');
    container.append(textTitle, textAuthor, textYear, action);

    container.setAttribute('id', `book-${id}`);

  
    if (isComplete) {

        const undoButton = document.createElement('img');
        undoButton.setAttribute('src', 'icon/yellow-undo.svg');
        undoButton.setAttribute('alt', 'Belum Dibaca');
        undoButton.classList.add('undo-icon');
        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(id);
        });
    
        const trashButton = document.createElement('img');
        trashButton.setAttribute('src', 'icon/red-trash.svg');
        trashButton.setAttribute('alt', 'Buang');
        trashButton.classList.add('trash-icon');
        trashButton.addEventListener('click', function () {
            removeBook(id);
        });
    
        action.append(undoButton, trashButton);
  
    } else {
        const checkButton = document.createElement('img');
        checkButton.setAttribute('src', 'icon/green-checked.svg');
        checkButton.setAttribute('alt', 'Sudah Dibaca');
        checkButton.classList.add('checked-icon');
        checkButton.addEventListener('click', function () {
            addBookToCompleted(id);
        });

        const trashButton = document.createElement('img');
        trashButton.setAttribute('src', 'icon/red-trash.svg');
        trashButton.setAttribute('alt', 'Buang');
        trashButton.classList.add('trash-icon');
        trashButton.addEventListener('click', function () {
            removeBook(id);
        });
    
        action.append(checkButton, trashButton);
    }
  
    return container;
}

function makeNotif(action) {
    const existingNotif = document.querySelector('.notification');

    if (existingNotif) {
        existingNotif.parentNode.removeChild(existingNotif);
    }

    const container = document.createElement('div');
    container.classList.add('notification', 'w-100', 'shadow');

    const text = document.createElement('p');
    text.textContent = 'Data berhasil ' + action;

    const closeBtn = document.createElement('img');
    closeBtn.src = 'icon/green-x.svg';
    closeBtn.alt = 'Close';
    closeBtn.classList.add('x-icon');

    closeBtn.addEventListener('click', function() {
        container.classList.add('fade-out');
        setTimeout(() => {
            container.parentNode.removeChild(container);
        }, 300);
    });

    container.appendChild(text);
    container.appendChild(closeBtn);

    const form = document.getElementById('form');
    form.parentNode.insertBefore(container, form);
}

function addBook() {
    const title = document.getElementById('judul').value;
    const author = document.getElementById('penulis').value;
    const year = document.getElementById('tahun').value;
    const stat = document.getElementById('stat').checked;
    
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, Number(year), stat);
    books.push(bookObject);
  
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData('ditambahkan');
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
  
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData('dipindahkan');
}

function confirmDelete(callback) {

    const container = document.createElement('div');
    container.classList.add('dialog');

    const modal = document.createElement('div');
    modal.classList.add('modal', 'shadow');

    const heading = document.createElement('h2');
    heading.innerText = 'Data akan dihapus';

    const paragraph = document.createElement('p');
    paragraph.innerText = 'Apakah Anda yakin ingin menghapus data tersebut?';

    const modalAction = document.createElement('div');
    modalAction.classList.add('modal-action');

    const confirmBtn = document.createElement('div');
    confirmBtn.classList.add('confirm');
    confirmBtn.innerText = 'Hapus';

    const rejectBtn = document.createElement('div');
    rejectBtn.classList.add('reject');
    rejectBtn.innerText = 'Batal';

    modalAction.appendChild(confirmBtn);
    modalAction.appendChild(rejectBtn);

    modal.appendChild(heading);
    modal.appendChild(paragraph);
    modal.appendChild(modalAction);

    container.appendChild(modal);

    document.body.insertBefore(container, document.body.firstChild);

    confirmBtn.addEventListener('click', function() {
        document.body.removeChild(container);
        callback(true);
    });

    rejectBtn.addEventListener('click', function() {
        document.body.removeChild(container);
        callback(false);
    });
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    confirmDelete(function(result) {
        if(result) {
            if (bookTarget !== -1) {
                books.splice(bookTarget, 1);
                saveData('dihapuskan');
            }
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    });
}
  
function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
  
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData('dipindahkan');
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    const searchForm = document.getElementById('search-form');
  
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addBook();
    });

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const search = document.getElementById('search').value;
        
        searchBook(search);
    });

    if(isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, (event) => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    const msgAction = event.detail.action;
    
    makeNotif(msgAction);
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('uncompleted-book');
    const completedBookList = document.getElementById('completed-book');
  
    uncompletedBookList.innerHTML = '';
    completedBookList.innerHTML = '';
  
    for (bookItem of books) {
      const bookElement = makeBook(bookItem);
      if (bookItem.isComplete) {
        completedBookList.append(bookElement);
      } else {
        uncompletedBookList.append(bookElement);
      }
    }
});

document.addEventListener(SEARCH_EVENT, function (event) {
    const uncompletedBookList = document.getElementById('uncompleted-book');
    const completedBookList = document.getElementById('completed-book');

    uncompletedBookList.innerHTML = '';
    completedBookList.innerHTML = '';
  
    const { searchedBooks } = event.detail;

    for (bookItem of searchedBooks) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            completedBookList.append(bookElement);
        } else {
            uncompletedBookList.append(bookElement);
        }
    }
});