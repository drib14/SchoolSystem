document.addEventListener("DOMContentLoaded", () => {
    // Forms & Inputs
    const apiSearchForm = document.getElementById("book-api-search-form");
    const apiSearchQuery = document.getElementById("api-search-query");
    const loanForm = document.getElementById("loan-form");
    const returnForm = document.getElementById("return-form");
    const bookSelect = document.getElementById("book-select");
    const userSelect = document.getElementById("user-select");
    const dueDateInput = document.getElementById("due-date");
    const loanedBookSelect = document.getElementById("loaned-book-select");

    // Display Areas
    const apiSearchResults = document.getElementById("api-search-results");
    const libraryCollectionTbody = document.getElementById("library-collection-tbody");

    // Local Storage DB
    const DB = {
        getItem: (key) => JSON.parse(localStorage.getItem(key) || "[]"),
        setItem: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    };

    // Data
    let localLibrary = DB.getItem("library");
    let students = DB.getItem("students") || [];
    let teachers = DB.getItem("teachers") || [];
    let users = [...students, ...teachers];
    let loans = DB.getItem("loans");

    // --- RENDER FUNCTIONS ---

    const renderLibraryCollection = () => {
        libraryCollectionTbody.innerHTML = "";
        if (localLibrary.length === 0) {
            libraryCollectionTbody.innerHTML = "<tr><td colspan='5'>The library is empty. Add books using the search form.</td></tr>";
            return;
        }
        localLibrary.forEach(book => {
            const tr = document.createElement("tr");
            const isOnLoan = loans.some(loan => loan.bookKey === book.key);
            tr.innerHTML = `
                <td><img src="${book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg` : 'https://placehold.co/50x75?text=No+Cover'}" alt="Cover"></td>
                <td>${book.title}</td>
                <td>${book.author_name ? book.author_name.join(', ') : 'N/A'}</td>
                <td><span class="badge bg-${isOnLoan ? 'secondary' : 'success'}">${isOnLoan ? 'On Loan' : 'Available'}</span></td>
                <td><button class="btn btn-sm btn-danger" data-action="delete" data-key="${book.key}">Delete</button></td>
            `;
            libraryCollectionTbody.appendChild(tr);
        });
    };

    const renderApiResults = (books) => {
        apiSearchResults.innerHTML = "";
        if (!books || books.length === 0) {
            apiSearchResults.innerHTML = "<p>No books found.</p>";
            return;
        }
        books.slice(0, 8).forEach(book => { // Show top 8 results
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";
            bookCard.innerHTML = `
                <img src="${book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'https://placehold.co/150x200?text=No+Cover'}" alt="Cover">
                <h6>${book.title}</h6>
                <button class="btn btn-sm btn-success" data-book-key="${book.key}">Add</button>
            `;
            bookCard.querySelector("button").addEventListener("click", () => addBookToLibrary(book));
            apiSearchResults.appendChild(bookCard);
        });
    };

    const populateLoanDropdowns = () => {
        // Populate Books
        bookSelect.innerHTML = '<option value="">Select a book...</option>';
        localLibrary.forEach(book => {
            const isOnLoan = loans.some(loan => loan.bookKey === book.key);
            if (!isOnLoan) {
                bookSelect.innerHTML += `<option value="${book.key}">${book.title}</option>`;
            }
        });

        // Populate Users
        userSelect.innerHTML = '<option value="">Select a user...</option>';
        users.forEach(user => {
            userSelect.innerHTML += `<option value="${user.id}">${user.firstName} ${user.lastName} (${user.id})</option>`;
        });

        // Populate Return Form
        loanedBookSelect.innerHTML = '<option value="">Select a loaned book...</option>';
        loans.forEach(loan => {
             const book = localLibrary.find(b => b.key === loan.bookKey);
             const user = users.find(u => u.id === loan.userId);
             if(book && user) {
                loanedBookSelect.innerHTML += `<option value="${loan.id}">${book.title} (Loaned to ${user.firstName})</option>`;
             }
        });
    };

    // --- DATA MANIPULATION FUNCTIONS ---

    const addBookToLibrary = (book) => {
        if (localLibrary.some(b => b.key === book.key)) {
            Toastify({ text: "This book is already in the library.", duration: 3000, className: "toast-warning" }).showToast();
            return;
        }
        localLibrary.push(book);
        DB.setItem("library", localLibrary);
        Toastify({ text: `"${book.title}" added to library.`, duration: 3000, className: "toast-success" }).showToast();
        rerenderAll();
    };

    const rerenderAll = () => {
        renderLibraryCollection();
        populateLoanDropdowns();
    };

    // --- EVENT LISTENERS ---

    apiSearchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const query = apiSearchQuery.value;
        if (!query) return;
        apiSearchResults.innerHTML = '<p>Searching...</p>';
        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            renderApiResults(data.docs);
        } catch (error) {
            console.error("Error fetching from Open Library:", error);
            apiSearchResults.innerHTML = '<p>Error during search. Check console.</p>';
            Toastify({ text: "Error searching Open Library.", duration: 3000, className: "toast-error" }).showToast();
        }
    });

    libraryCollectionTbody.addEventListener("click", (e) => {
        if (e.target.dataset.action === "delete") {
            const bookKey = e.target.dataset.key;
            if (loans.some(loan => loan.bookKey === bookKey)) {
                Toastify({ text: "Cannot delete a book that is currently on loan.", duration: 3000, className: "toast-error" }).showToast();
                return;
            }
            if (confirm("Are you sure you want to permanently delete this book from the library?")) {
                localLibrary = localLibrary.filter(b => b.key !== bookKey);
                DB.setItem("library", localLibrary);
                Toastify({ text: "Book deleted.", duration: 3000, className: "toast-info" }).showToast();
                rerenderAll();
            }
        }
    });

    loanForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const bookKey = bookSelect.value;
        const userId = userSelect.value;
        const dueDate = dueDateInput.value;

        if (!bookKey || !userId || !dueDate) {
            Toastify({ text: "Please fill all fields to check out a book.", duration: 3000, className: "toast-error" }).showToast();
            return;
        }

        const loan = {
            id: `loan_${Date.now()}`,
            userId,
            bookKey,
            loanDate: new Date().toISOString().split('T')[0],
            dueDate,
        };

        loans.push(loan);
        DB.setItem("loans", loans);
        Toastify({ text: "Book checked out successfully.", duration: 3000, className: "toast-success" }).showToast();
        loanForm.reset();
        rerenderAll();
    });

    returnForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const loanId = loanedBookSelect.value;
        if (!loanId) {
            Toastify({ text: "Please select a book to check in.", duration: 3000, className: "toast-error" }).showToast();
            return;
        }

        loans = loans.filter(l => l.id !== loanId);
        DB.setItem("loans", loans);
        Toastify({ text: "Book checked in successfully.", duration: 3000, className: "toast-success" }).showToast();
        returnForm.reset();
        rerenderAll();
    });


    // --- INITIALIZATION ---
    rerenderAll();
});
