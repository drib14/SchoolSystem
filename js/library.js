document.addEventListener("DOMContentLoaded", () => {
    const catalogTbody = document.getElementById("library-catalog-tbody");
    const loansTbody = document.getElementById("my-loans-tbody");
    const searchInput = document.getElementById("search-query");
    const searchBtn = document.getElementById("search-btn");
    const apiSearchForm = document.getElementById("book-api-search-form");
    const apiSearchQuery = document.getElementById("api-search-query");
    const apiSearchResults = document.getElementById("api-search-results");

    const currentUserRole = localStorage.getItem("userRole");
    const currentUserId = localStorage.getItem("userId");

    const DB = {
        getItem: (key, defaultValue = []) => {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        },
        setItem: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };

    let allBooks = DB.getItem("library");
    let allLoans = DB.getItem("loans");

    const renderCatalog = (filter = "") => {
        catalogTbody.innerHTML = "";
        const filteredBooks = allBooks.filter(book =>
            book.title.toLowerCase().includes(filter.toLowerCase()) ||
            (book.author_name && book.author_name.join(', ').toLowerCase().includes(filter.toLowerCase()))
        );

        if (filteredBooks.length === 0) {
            catalogTbody.innerHTML = "<tr><td colspan='5'>No books found.</td></tr>";
            return;
        }

        filteredBooks.forEach(book => {
            const tr = document.createElement("tr");
            const isOnLoan = allLoans.some(loan => loan.bookKey === book.key);
            let actionButton = '';
            if (!isOnLoan) {
                actionButton = `<button class="btn btn-sm btn-primary borrow-btn" data-key="${book.key}">Borrow</button>`;
            }

            tr.innerHTML = `
                <td data-label="Title">${book.title}</td>
                <td data-label="Author(s)">${book.author_name ? book.author_name.join(', ') : 'N/A'}</td>
                <td data-label="Publish Year">${book.first_publish_year || 'N/A'}</td>
                <td data-label="Status"><span class="badge ${isOnLoan ? 'text-bg-secondary' : 'text-bg-success'}">${isOnLoan ? 'On Loan' : 'Available'}</span></td>
                <td data-label="Actions">${actionButton}</td>
            `;
            catalogTbody.appendChild(tr);
        });
    };

    const renderMyLoans = () => {
        loansTbody.innerHTML = "";
        const userLoans = allLoans.filter(loan => loan.userId === currentUserId);

        if (userLoans.length === 0) {
            loansTbody.innerHTML = "<tr><td colspan='4'>You have no books on loan.</td></tr>";
            return;
        }

        userLoans.forEach(loan => {
            const book = allBooks.find(b => b.key === loan.bookKey);
            if (!book) return;

            const tr = document.createElement("tr");
            const dueDate = new Date(loan.dueDate);
            const isOverdue = new Date() > dueDate;

            tr.innerHTML = `
                <td data-label="Book Title">${book.title}</td>
                <td data-label="Date Borrowed">${new Date(loan.loanDate).toLocaleDateString()}</td>
                <td data-label="Due Date" class="${isOverdue ? 'text-danger fw-bold' : ''}">${dueDate.toLocaleDateString()}</td>
                <td data-label="Status">${isOverdue ? 'Overdue' : 'On Loan'}</td>
            `;
            loansTbody.appendChild(tr);
        });
    };

    searchBtn.addEventListener("click", () => {
        renderCatalog(searchInput.value);
    });

    searchInput.addEventListener("keyup", (e) => {
        if (e.key === 'Enter') {
            renderCatalog(searchInput.value);
        }
    });

    catalogTbody.addEventListener("click", (e) => {
        if (e.target.classList.contains("borrow-btn")) {
            const bookKey = e.target.dataset.key;
            if (confirm("Are you sure you want to borrow this book for 14 days?")) {
                const today = new Date();
                const dueDate = new Date();
                dueDate.setDate(today.getDate() + 14);

                const newLoan = {
                    id: `loan_${Date.now()}`,
                    userId: currentUserId,
                    bookKey: bookKey,
                    loanDate: today.toISOString().split('T')[0],
                    dueDate: dueDate.toISOString().split('T')[0],
                };

                allLoans.push(newLoan);
                DB.setItem("loans", allLoans);
                Toastify({ text: "Book borrowed successfully!", duration: 3000, className: "toast-success" }).showToast();

                renderCatalog(searchInput.value);
                renderMyLoans();
            }
        }
    });

    // --- API Search & Suggestion Logic ---
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

    const renderApiResults = (books) => {
        apiSearchResults.innerHTML = "";
        if (!books || books.length === 0) {
            apiSearchResults.innerHTML = "<p>No books found for your query.</p>";
            return;
        }
        const list = document.createElement("ul");
        list.className = "list-group";
        books.slice(0, 5).forEach(book => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            let buttonHtml = '';
            if (currentUserRole === 'teacher') {
                buttonHtml = `<button class="btn btn-sm btn-info suggest-btn" data-book-key="${book.key}">Suggest</button>`;
            }
            li.innerHTML = `<span>${book.title} by ${book.author_name ? book.author_name.join(', ') : 'N/A'}</span> ${buttonHtml}`;

            if (currentUserRole === 'teacher') {
                const suggestBtn = li.querySelector('.suggest-btn');
                if (suggestBtn) {
                    suggestBtn.addEventListener("click", () => addBookSuggestion(book));
                }
            }
            list.appendChild(li);
        });
        apiSearchResults.appendChild(list);
    };

    const addBookSuggestion = (book) => {
        let suggestions = DB.getItem("librarySuggestions");
        if (suggestions.some(s => s.key === book.key) || allBooks.some(b => b.key === book.key)) {
            Toastify({ text: "This book is already in the library or has been suggested.", duration: 3000, className: "toast-warning" }).showToast();
            return;
        }
        const suggestion = { ...book, status: 'pending', suggestedBy: currentUserId };
        suggestions.push(suggestion);
        DB.setItem("librarySuggestions", suggestions);
        Toastify({ text: `Your suggestion for "${book.title}" has been submitted for review.`, duration: 3000, className: "toast-success" }).showToast();
    };


    // Initial Render
    renderCatalog();
    renderMyLoans();
});
