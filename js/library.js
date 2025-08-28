document.addEventListener("DOMContentLoaded", () => {
    const catalogTbody = document.getElementById("library-catalog-tbody");
    const loansTbody = document.getElementById("my-loans-tbody");
    const searchInput = document.getElementById("search-query");
    const searchBtn = document.getElementById("search-btn");
    const sidebarPanelName = document.getElementById("sidebar-panel-name");

    const currentUserRole = localStorage.getItem("userRole");
    const currentUserId = localStorage.getItem("userId");

    // Basic check to update sidebar title
    if (sidebarPanelName && currentUserRole) {
        sidebarPanelName.textContent = `${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)} Panel`;
    }

    // Mock data for now, will be replaced by localStorage calls
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
            catalogTbody.innerHTML = "<tr><td colspan='4'>No books found.</td></tr>";
            return;
        }

        filteredBooks.forEach(book => {
            const tr = document.createElement("tr");
            const isOnLoan = allLoans.some(loan => loan.bookKey === book.key);
            tr.innerHTML = `
                <td data-label="Title">${book.title}</td>
                <td data-label="Author(s)">${book.author_name ? book.author_name.join(', ') : 'N/A'}</td>
                <td data-label="Publish Year">${book.first_publish_year || 'N/A'}</td>
                <td data-label="Status"><span class="badge ${isOnLoan ? 'bg-secondary' : 'bg-success'}">${isOnLoan ? 'On Loan' : 'Available'}</span></td>
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

    // Initial Render
    renderCatalog();
    renderMyLoans();

    // Rudimentary auth handling for logout
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = 'index.html';
        });
    }
});
