document.addEventListener("DOMContentLoaded", () => {
    // Auth Check
    if (localStorage.getItem('userRole') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

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
    const pendingSuggestionsContainer = document.getElementById("pending-suggestions");

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
    let users = [...students, ...teachers, {id: 'admin', firstName: 'Admin', lastName: ''}]; // Include admin for lookups
    let loans = DB.getItem("loans");
    let suggestions = DB.getItem("librarySuggestions");

    // --- RENDER FUNCTIONS ---
    const renderLibraryCollection = () => {
        libraryCollectionTbody.innerHTML = "";
        if (localLibrary.length === 0) {
            libraryCollectionTbody.innerHTML = "<tr><td colspan='5'>The library is empty. Use the search above to add books.</td></tr>";
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
                <td data-label="Actions"><button class="action-btn deny-btn" data-action="delete" data-key="${book.key}">Delete</button></td>
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
                <td data-label="Actions"><button class="action-btn approve-btn" data-action="checkin" data-loan-id="${loan.id}">Check In</button></td>
            `;
            loanedBooksTbody.appendChild(tr);
        });
    };

    const renderApiResults = (books) => {
        apiSearchResults.innerHTML = "";
        if (!books || books.length === 0) {
            apiSearchResults.innerHTML = "<p>No books found for your query.</p>";
            return;
        }
        const list = document.createElement("ul");
        list.className = "list-group";
        books.slice(0, 5).forEach(book => { // Show top 5 results
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `<span>${book.title} by ${book.author_name ? book.author_name.join(', ') : 'N/A'}</span> <button class="btn btn-sm btn-primary" data-book-key="${book.key}">Add</button>`;
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
        users.filter(u => u.id !== 'admin').forEach(user => {
            userSelect.innerHTML += `<option value="${user.id}">${user.firstName} ${user.lastName} (${user.role})</option>`;
        });
    };

    const renderSuggestions = () => {
        pendingSuggestionsContainer.innerHTML = "";
        const pending = suggestions.filter(s => s.status === 'pending');
        if (pending.length === 0) {
            pendingSuggestionsContainer.innerHTML = "<p>No pending suggestions.</p>";
            return;
        }
        const list = document.createElement("ul");
        list.className = "list-group";
        pending.forEach(book => {
            const suggester = users.find(u => u.id === book.suggestedBy);
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `
                <span>
                    <strong>${book.title}</strong><br>
                    <small>Suggested by: ${suggester ? suggester.firstName : 'Unknown'}</small>
                </span>
                <div>
                    <button class="btn btn-sm btn-success approve-suggestion-btn" data-key="${book.key}">Approve</button>
                    <button class="btn btn-sm btn-danger deny-suggestion-btn" data-key="${book.key}">Deny</button>
                </div>
            `;
            list.appendChild(li);
        });
        pendingSuggestionsContainer.appendChild(list);
    };

    const rerenderAll = () => {
        renderLibraryCollection();
        renderLoanedBooks();
        populateLoanDropdowns();
        renderSuggestions();
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

    pendingSuggestionsContainer.addEventListener("click", (e) => {
        const key = e.target.dataset.key;
        if (!key) return;

        if (e.target.classList.contains("approve-suggestion-btn")) {
            const suggestion = suggestions.find(s => s.key === key);
            if (suggestion) {
                addBookToLibrary(suggestion); // Re-use the existing add function
                suggestions = suggestions.filter(s => s.key !== key); // Remove from suggestions
                DB.setItem("librarySuggestions", suggestions);
                rerenderAll();
            }
        } else if (e.target.classList.contains("deny-suggestion-btn")) {
             if (confirm("Are you sure you want to deny this suggestion?")) {
                suggestions = suggestions.filter(s => s.key !== key);
                DB.setItem("librarySuggestions", suggestions);
                rerenderAll();
            }
        }
    });

    // --- INITIALIZATION ---
    rerenderAll();
});
