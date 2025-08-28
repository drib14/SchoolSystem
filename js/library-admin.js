document.addEventListener("DOMContentLoaded", () => {
    // Forms & Inputs
    const apiSearchForm = document.getElementById("book-api-search-form");
    const apiSearchQuery = document.getElementById("api-search-query");
    const loanForm = document.getElementById("loan-form");
    const bookSelect = document.getElementById("book-select");
    const userSelect = document.getElementById("user-select");
    const dueDateInput = document.getElementById("due-date");

    // Display Areas
    const apiSearchResults = document.getElementById("api-search-results");
    const libraryCollectionTbody = document.getElementById("library-collection-tbody");
    const loanedBooksTbody = document.getElementById("loaned-books-tbody");

    // Local Storage DB
    const DB = {
        getItem: (key, defaultValue = []) => {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        },
        setItem: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
        }
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
            libraryCollectionTbody.innerHTML = "<tr><td colspan='5'>The library is empty.</td></tr>";
            return;
        }
        localLibrary.forEach(book => {
            const tr = document.createElement("tr");
            const isOnLoan = loans.some(loan => loan.bookKey === book.key);
            tr.innerHTML = `
                <td data-label="Title">${book.title}</td>
                <td data-label="Author">${book.author_name ? book.author_name.join(', ') : 'N/A'}</td>
                <td data-label="Published">${book.first_publish_year || 'N/A'}</td>
                <td data-label="Status"><span class="badge ${isOnLoan ? 'bg-secondary' : 'bg-success'}">${isOnLoan ? 'On Loan' : 'Available'}</span></td>
                <td data-label="Actions"><button class="btn btn-sm btn-danger" data-action="delete" data-key="${book.key}">Delete</button></td>
            `;
            libraryCollectionTbody.appendChild(tr);
        });
    };

    const renderLoanedBooks = () => {
        loanedBooksTbody.innerHTML = "";
        if (loans.length === 0) {
            loanedBooksTbody.innerHTML = "<tr><td colspan='5'>No books are currently on loan.</td></tr>";
            return;
        }
        loans.forEach(loan => {
            const book = localLibrary.find(b => b.key === loan.bookKey);
            const user = users.find(u => u.id === loan.userId);
            if (!book || !user) return; // Data integrity check

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td data-label="Book">${book.title}</td>
                <td data-label="User">${user.firstName} ${user.lastName} (${user.id})</td>
                <td data-label="Loan Date">${new Date(loan.loanDate).toLocaleDateString()}</td>
                <td data-label="Due Date">${new Date(loan.dueDate).toLocaleDateString()}</td>
                <td data-label="Actions"><button class="btn btn-sm btn-success" data-action="checkin" data-loan-id="${loan.id}">Check In</button></td>
            `;
            loanedBooksTbody.appendChild(tr);
        });
    };

    const renderApiResults = (books) => {
        apiSearchResults.innerHTML = "";
        if (!books || books.length === 0) {
            apiSearchResults.innerHTML = "<p>No books found.</p>";
            return;
        }
        const list = document.createElement("ul");
        list.className = "list-group";
        books.slice(0, 5).forEach(book => { // Show top 5 results
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `<span>${book.title} by ${book.author_name ? book.author_name.join(', ') : 'N/A'}</span> <button class="btn btn-sm btn-success" data-book-key="${book.key}">Add</button>`;
            li.querySelector("button").addEventListener("click", () => addBookToLibrary(book));
            list.appendChild(li);
        });
        apiSearchResults.appendChild(list);
    };

    const populateLoanDropdowns = () => {
        bookSelect.innerHTML = '<option value="">Select a book...</option>';
        localLibrary.filter(book => !loans.some(l => l.bookKey === book.key)).forEach(book => {
            bookSelect.innerHTML += `<option value="${book.key}">${book.title}</option>`;
        });

        userSelect.innerHTML = '<option value="">Select a user...</option>';
        users.forEach(user => {
            userSelect.innerHTML += `<option value="${user.id}">${user.firstName} ${user.lastName} (${user.role})</option>`;
        });
    };

    const rerenderAll = () => {
        renderLibraryCollection();
        renderLoanedBooks();
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
            if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            renderApiResults(data.docs);
        } catch (error) {
            console.error("Error fetching from Open Library:", error);
            apiSearchResults.innerHTML = '<p>Error during search. See console.</p>';
        }
    });

    const addBookToLibrary = (book) => {
        if (localLibrary.some(b => b.key === book.key)) {
            Toastify({ text: "This book is already in the library.", duration: 3000, className: "toast-warning" }).showToast();
            return;
        }
        localLibrary.push(book);
        DB.setItem("library", localLibrary);
        Toastify({ text: `"${book.title}" added to the library.`, duration: 3000, className: "toast-success" }).showToast();
        rerenderAll();
    };

    libraryCollectionTbody.addEventListener("click", (e) => {
        if (e.target.dataset.action === "delete") {
            const bookKey = e.target.dataset.key;
            if (loans.some(loan => loan.bookKey === bookKey)) {
                Toastify({ text: "Cannot delete a book that is currently on loan.", duration: 3000, className: "toast-error" }).showToast();
                return;
            }
            if (confirm("Are you sure you want to permanently delete this book?")) {
                localLibrary = localLibrary.filter(b => b.key !== bookKey);
                DB.setItem("library", localLibrary);
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
        loanForm.reset();
        rerenderAll();
    });

    loanedBooksTbody.addEventListener("click", (e) => {
        if (e.target.dataset.action === "checkin") {
            const loanId = e.target.dataset.loanId;
            loans = loans.filter(l => l.id !== loanId);
            DB.setItem("loans", loans);
            rerenderAll();
        }
    });

    // --- INITIALIZATION ---
    rerenderAll();
});
