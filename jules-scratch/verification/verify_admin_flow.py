import os
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This script verifies the admin flow: logging in, adding a course,
    and seeing the course in the list.
    """
    # Get the absolute path for file URLs
    base_path = os.path.abspath('.')

    # --- Route Interception ---
    # Intercept the request for the sidebar and fulfill it from the local file system.
    # This works around the pathing issues of the file:// protocol.
    def handle_route(route):
        if route.request.url.endswith("/sidebars/admin-sidebar.html"):
            print(f"Intercepting request for: {route.request.url}")
            route.fulfill(path="sidebars/admin-sidebar.html")
        else:
            route.continue_()

    page.route("**/sidebars/*.html", handle_route)
    # --------------------------

    # 1. Log in as admin
    page.goto(f"file://{base_path}/index.html")
    page.get_by_label("Username").fill("admin")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the dashboard and expect the title
    expect(page).to_have_title("Admin Dashboard - School Management System")
    expect(page.get_by_role("heading", name="Admin Dashboard")).to_be_visible()

    # 2. Navigate to the Courses page
    # First, wait for the sidebar to be loaded by looking for its heading
    expect(page.get_by_role("heading", name="Admin Panel")).to_be_visible()
    page.get_by_role("link", name="Courses").click()
    expect(page).to_have_title("Manage Courses - School Management System")

    # 3. Add a new course
    page.get_by_role("link", name="Add New Course").click()
    expect(page).to_have_title("Add Course - School Management System")

    # Fill out the form
    course_name = "History of Magic"
    course_desc = "A study of magical history from ancient times to the present day."
    page.get_by_label("Course Name").fill(course_name)
    page.get_by_label("Description").fill(course_desc)
    page.get_by_role("button", name="Save Course").click()

    # 4. Verify the new course appears in the table
    expect(page).to_have_title("Manage Courses - School Management System")

    # Check for the new course in the table
    row = page.get_by_role("row", name=f"{course_name} {course_desc}")
    expect(row).to_be_visible()
    expect(row.get_by_text(course_name)).to_be_visible()
    expect(row.get_by_text(course_desc)).to_be_visible()

    # 5. Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

# Boilerplate to run the verification
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()
