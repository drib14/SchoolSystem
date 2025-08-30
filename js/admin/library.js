document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect the page
    protectPage(['admin']);

    // 2. Get DOM elements
    const myLibraryTableBody = document.getElementById('my-library-table-body');
    const searchForm = document.getElementById('book-search-form');
    const searchResultsContainer = document.getElementById('search-results-container');

    // 3. Initial display of the school's library
    displayMyLibrary();

    // 4. Add event listener for the search form (logic to be added in next step)
    searchForm.addEventListener('submit', handleSearch);


    /**
     * Populates the "My School's Library" table with books from localStorage.
     */
    function displayMyLibrary() {
        const myLibrary = getData('library') || [];
        myLibraryTableBody.innerHTML = ''; // Clear existing content

        if (myLibrary.length === 0) {
            const row = myLibraryTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = 'Your library is empty. Search for books to add them.';
            cell.style.textAlign = 'center';
            return;
        }

        myLibrary.forEach(book => {
            const row = myLibraryTableBody.insertRow();
            row.insertCell().textContent = book.title;
            row.insertCell().textContent = book.author_name ? book.author_name.join(', ') : 'N/A';
            row.insertCell().textContent = book.isbn ? book.isbn[0] : 'N/A'; // Display first ISBN

            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `<button class="btn btn-sm btn-danger" onclick="removeBook('${book.key}')">Remove</button>`;
        });
    }

    /**
     * Handles the book search form submission by fetching data from Open Library API.
     */
    async function handleSearch(event) {
        event.preventDefault();
        const query = document.getElementById('search-query').value.trim();
        if (!query) {
            alert('Please enter a search term.');
            return;
        }

        searchResultsContainer.innerHTML = '<p>Searching...</p>';
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            displaySearchResults(data.docs);
        } catch (error) {
            console.error('Error fetching book data:', error);
            searchResultsContainer.innerHTML = '<p>Error fetching results. Please try again.</p>';
        }
    }

    /**
     * Displays the search results from the API.
     * @param {Array} books - The array of book documents from the API response.
     */
    function displaySearchResults(books) {
        searchResultsContainer.innerHTML = ''; // Clear previous results

        if (books.length === 0) {
            searchResultsContainer.innerHTML = '<p>No books found for your search.</p>';
            return;
        }

        books.slice(0, 20).forEach(book => { // Limit to first 20 results
            const bookCard = document.createElement('div');
            bookCard.className = 'result-card';

            const title = book.title;
            const author = book.author_name ? book.author_name[0] : 'Unknown Author';
            const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'https://via.placeholder.com/100x150';

            // We need to pass the entire book object to the addBook function.
            // Stringifying it and escaping quotes is a reliable way to do this in an onclick handler.
            const bookDataString = JSON.stringify(book).replace(/'/g, "\\'");

            bookCard.innerHTML = `
                <img src="${coverUrl}" alt="Cover of ${title}">
                <strong>${title}</strong>
                <p>${author}</p>
                <button class="btn btn-sm btn-primary" onclick='addBookToLibrary(${bookDataString})'>Add to Library</button>
            `;
            searchResultsContainer.appendChild(bookCard);
        });
    }
});

/**
 * Adds a book object to the local library stored in localStorage.
 * @param {object} bookData - The full book object from the Open Library API.
 */
function addBookToLibrary(bookData) {
    let myLibrary = getData('library') || [];

    // Check if book is already in the library
    const isAlreadyAdded = myLibrary.some(book => book.key === bookData.key);
    if (isAlreadyAdded) {
        alert('This book is already in your library.');
        return;
    }

    myLibrary.push(bookData);
    saveData('library', myLibrary);
    alert(`"${bookData.title}" has been added to your library.`);
    location.reload(); // Refresh the page to show the updated "My Library" table
}

/**
 * Removes a book from the local library.
 * @param {string} bookKey The unique key of the book to remove.
 */
function removeBook(bookKey) {
    const confirmed = confirm('Are you sure you want to remove this book from your library?');
    if (confirmed) {
        let myLibrary = getData('library') || [];
        const updatedLibrary = myLibrary.filter(book => book.key !== bookKey);
        saveData('library', updatedLibrary);
        location.reload(); // Easiest way to refresh the table
    }
}
