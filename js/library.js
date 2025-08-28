document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserId = localStorage.getItem('userId');
    if (!loggedInUserId) return;

    const searchForm = document.getElementById('book-search-form');
    const searchQuery = document.getElementById('search-query');
    const resultsGrid = document.getElementById('search-results-grid');
    const myLoansTbody = document.getElementById('my-loans-tbody');

    let libraryBooks = JSON.parse(localStorage.getItem('libraryBooks')) || [];
    let loans = JSON.parse(localStorage.getItem('loans')) || [];

    function renderMyLoans() {
        myLoansTbody.innerHTML = '';
        const myCurrentLoans = loans.filter(l => l.userId === loggedInUserId && !l.dateIn);
        if (myCurrentLoans.length === 0) {
            myLoansTbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">You have no books checked out.</td></tr>';
            return;
        }
        myCurrentLoans.forEach(loan => {
            const book = libraryBooks.find(b => b.key === loan.bookKey);
            if (book) {
                const row = myLoansTbody.insertRow();
                row.innerHTML = `
                    <td data-label="Title">${book.title}</td>
                    <td data-label="Author">${book.author}</td>
                    <td data-label="Due Date">${new Date(loan.dueDate).toLocaleDateString()}</td>
                `;
            }
        });
    }

    async function searchBooks(query) {
        resultsGrid.innerHTML = '<p>Searching...</p>';
        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            displayResults(data.docs);
        } catch (error) {
            console.error("Error fetching book data:", error);
            resultsGrid.innerHTML = '<p>Error searching for books. Please try again.</p>';
        }
    }

    function displayResults(books) {
        resultsGrid.innerHTML = '';
        if (books.length === 0) {
            resultsGrid.innerHTML = '<p>No books found for your query.</p>';
            return;
        }

        books.slice(0, 12).forEach(book => { // Show top 12 results
            const title = book.title;
            const author = book.author_name ? book.author_name.join(', ') : 'N/A';
            const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'https://via.placeholder.com/200x300';

            const localBook = libraryBooks.find(b => b.key === book.key);
            const isLoaned = localBook ? loans.some(l => l.bookKey === localBook.key && !l.dateIn) : false;

            let status = 'Not in Collection';
            if (localBook && !isLoaned) status = 'Available';
            if (localBook && isLoaned) status = 'Checked Out';

            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <img src="${coverUrl}" alt="Cover for ${title}">
                <h4>${title}</h4>
                <p>${author}</p>
                <p><strong>Status:</strong> ${status}</p>
            `;
            resultsGrid.appendChild(card);
        });
    }

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchQuery.value.trim();
        if (query) {
            searchBooks(query);
        }
    });

    renderMyLoans();
});
