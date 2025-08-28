import re
from playwright.sync_api import Playwright, sync_playwright, expect

def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    BASE_URL = "http://localhost:8000"

    # Pre-populate data for a predictable test environment
    students = [{"id":"S001","firstName":"John","lastName":"Doe","password":"password","status":"enrolled", "role": "student"}]
    teachers = [{"id":"T001","firstName":"Jane","lastName":"Smith","password":"password","status":"approved", "role": "teacher"}]
    page.goto(f"{BASE_URL}/index.html") # Go to a page to set local storage
    page.evaluate(f"localStorage.setItem('students', JSON.stringify({students}))")
    page.evaluate(f"localStorage.setItem('teachers', JSON.stringify({teachers}))")
    page.evaluate("localStorage.setItem('library', '[]')")
    page.evaluate("localStorage.setItem('loans', '[]')")
    page.evaluate("localStorage.setItem('events', '[]')")
    page.evaluate("localStorage.setItem('messages', '{{}}')")


    # --- Test 1: Admin creates an Event ---
    page.goto(f"{BASE_URL}/index.html")
    page.get_by_role("button", name="Admin").click()
    page.get_by_placeholder("Username").fill("admin")
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_role("button", name="Login").click()
    expect(page).to_have_url(re.compile(r".*admin.html"))
    page.get_by_role("link", name="Events").click()
    expect(page).to_have_url(re.compile(r".*events.html"))

    # Fill out and submit the event form
    page.get_by_label("Event Title").fill("Midterm Exams")
    page.get_by_label("Event Date").fill("2025-10-15")
    page.get_by_label("Description").fill("Midterm exams for all courses.")
    page.get_by_role("button", name="Save Event").click()

    # Verify the event appears in the list
    expect(page.get_by_role("heading", name="Midterm Exams")).to_be_visible()
    page.get_by_role("link", name="Logout").click()


    # --- Test 2: Student sends a Message to a Teacher ---
    page.goto(f"{BASE_URL}/index.html")
    page.get_by_role("button", name="Student").click()
    page.get_by_placeholder("Username").fill("S001")
    page.get_by_placeholder("Password").fill("password")
    page.get_by_role("button", name="Login").click()
    expect(page).to_have_url(re.compile(r".*student.html"))
    page.get_by_role("link", name="Messaging").click()
    expect(page).to_have_url(re.compile(r".*messaging.html"))

    # Start a new message
    # Use evaluate to call the global showView function directly for debugging
    page.evaluate("window.showView(document.getElementById('new-message-view'))")

    # Wait for the new message view to be visible
    expect(page.locator("#new-message-view")).to_be_visible()
    page.get_by_label("Select a user to message:").select_option(label="Jane Smith (T001)")
    page.get_by_role("button", name="Start Conversation").click()

    # Send a message
    page.get_by_placeholder("Type a message...").fill("Hello, Ms. Smith. I have a question about the homework.")
    page.get_by_role("button", name="Send").click()
    expect(page.get_by_text("Hello, Ms. Smith.")).to_be_visible()
    page.get_by_role("link", name="Logout").click()


    # --- Test 3: Admin manages Library and Student verifies ---
    page.goto(f"{BASE_URL}/index.html")
    page.get_by_role("button", name="Admin").click()
    page.get_by_placeholder("Username").fill("admin")
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_role("button", name="Login").click()
    page.get_by_role("link", name="Library Admin").click()

    # Add a book
    page.get_by_placeholder("Search Open Library for a book...").fill("The Great Gatsby")
    page.get_by_role("button", name="Search").click()
    expect(page.get_by_text("The Great Gatsby by F. Scott Fitzgerald")).to_be_visible(timeout=10000)
    page.locator('.list-group-item:has-text("The Great Gatsby")').get_by_role('button', name='Add').click()
    expect(page.locator('#library-collection-tbody').get_by_text("The Great Gatsby")).to_be_visible()

    # Check out the book to the student
    page.get_by_label("Book:").select_option(label="The Great Gatsby")
    page.get_by_label("User (Student/Teacher ID):").select_option(label="John Doe (student)")
    page.get_by_label("Due Date:").fill("2025-12-01")
    page.get_by_role("button", name="Check Out").click()
    expect(page.locator('#library-collection-tbody').get_by_text("On Loan")).to_be_visible()
    page.get_by_role("link", name="Logout").click()

    # --- Student Verification Step ---
    page.goto(f"{BASE_URL}/index.html")
    page.get_by_role("button", name="Student").click()
    page.get_by_placeholder("Username").fill("S001")
    page.get_by_placeholder("Password").fill("password")
    page.get_by_role("button", name="Login").click()
    page.get_by_role("link", name="Library").click()

    # Verify the loaned book is visible
    expect(page.locator('#my-loans-tbody').get_by_text("The Great Gatsby")).to_be_visible()
    expect(page.locator('#my-loans-tbody').get_by_text("12/1/2025")).to_be_visible()

    # Also verify the event is visible to the student
    page.get_by_role("link", name="Events").click()
    expect(page.get_by_text("Midterm Exams")).to_be_visible()

    # Screenshot of the student's event page
    page.screenshot(path="jules-scratch/verification.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
