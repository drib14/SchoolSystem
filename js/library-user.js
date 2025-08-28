document.addEventListener("DOMContentLoaded", () => {
    const libraryCatalog = document.getElementById("libraryCatalog");
    const myLoans = document.getElementById("myLoans");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const DB = {
        getItem: (key) => JSON.parse(localStorage.getItem(key) || "[]"),
    };

    let allBooks = DB.getItem("library");
    let allLoans = DB.getItem("loans");

    const renderCatalog = () => {
        libraryCatalog.innerHTML = "";
        if (allBooks.length === 0) {
            libraryCatalog.innerHTML = "<tr><td colspan='4'>The library is currently empty.</td></tr>";
            return;
        }

        allBooks.forEach(book => {
            const tr = document.createElement("tr");
            const isOnLoan = allLoans.some(loan => loan.bookKey === book.key);
            tr.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author_name ? book.author_name.join(', ') : 'N/A'}</td>
                <td>${book.first_publish_year || 'N/A'}</td>
                <td><span class="badge bg-${isOnLoan ? 'secondary' : 'success'}">${isOnLoan ? 'On Loan' : 'Available'}</span></td>
            `;
            libraryCatalog.appendChild(tr);
        });
    };

    const renderMyLoans = () => {
        myLoans.innerHTML = "";
        const userLoans = allLoans.filter(loan => loan.userId === currentUser.id);

        if (userLoans.length === 0) {
            myLoans.innerHTML = "<tr><td colspan='4'>You have no books on loan.</td></tr>";
            return;
        }

        userLoans.forEach(loan => {
            const book = allBooks.find(b => b.key === loan.bookKey);
            if (!book) return;

            const tr = document.createElement("tr");
            const dueDate = new Date(loan.dueDate);
            const isOverdue = new Date() > dueDate;

            tr.innerHTML = `
                <td>${book.title}</td>
                <td>${new Date(loan.loanDate).toLocaleDateString()}</td>
                <td class="${isOverdue ? 'text-danger fw-bold' : ''}">${dueDate.toLocaleDateString()}</td>
                <td>${isOverdue ? 'Overdue' : 'On Loan'}</td>
            `;
            myLoans.appendChild(tr);
        });
    };

    if (!currentUser) {
        if (libraryCatalog) libraryCatalog.innerHTML = "<tr><td colspan='4'>Error: Not logged in.</td></tr>";
        if (myLoans) myLoans.innerHTML = "<tr><td colspan'4'>Error: Not logged in.</td></tr>";
        return;
    }

    // Initial Render
    if (libraryCatalog) renderCatalog();
    if (myLoans) renderMyLoans();
});
