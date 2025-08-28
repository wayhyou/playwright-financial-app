import {test, expect, chromium} from '@playwright/test';
import { LoginPage } from '../../pages/login.js';

test.describe('Login Page Tests', () => {
  
  let browser;
  let context;
  let page;

  let Login;

  test.beforeAll(async () => {
    // Launch browser
    browser = await chromium.launch({
      slowMo: 500,
      headless: false,
    });

    // Create a new browser context with video recording
    context = await browser.newContext({
      recordVideo: {
        dir: 'tests/financial-app/videos/login/',
        size: { width: 1280, height: 720 }
      }
    });

    // Start tracing with screenshots and snapshots
    await context.tracing.start({ snapshots: true, screenshots: true });

    // Create a new page in the context
    page = await context.newPage();

    // Initialize the LoginPage object
    Login = new LoginPage(page);
  });

  test.beforeEach(async () => {
    // Navigate to the login page before each test
    await Login.navigate();
  });

  test.afterAll(async () => {
    // Stop tracing and save it to a file
    await context.tracing.stop({ path: 'tests/financial-app/traces/login.zip' });
    await context.close();
  });

  test('Should display login page', async () => {
    // URL and Title
    await expect(page).toHaveURL('/login');
    await expect(page).toHaveTitle('Financial App | Login');

    // Heading and form input
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]', { name: 'Login' })).toBeVisible();

    // Link "Don't have an account? Register"
    await expect(page.locator('text=Don\'t have an account?')).toBeVisible();
    const registerLink = page.locator('a[href="/register"]', { hasText: 'Register' });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');

    // Take screenshot of the login page
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-page.png' });
  });

  test('TC-Log-001-001 - Successfully login with valid credentials', async () => {
    // Fill in valid email and password
    await Login.inputCredentials(process.env.VALID_EMAIL, process.env.VALID_PASSWORD);

    // Submit login form
    await Login.login();

    // Wait for redirection to home page
    await page.waitForURL('/home');

    // Wait until home page data is loaded (based on test id)
    await page.waitForSelector('[data-testid="home-loaded"]', { state: 'attached' });

    // Verify URL and page title
    await expect(page).toHaveURL('/home');
    await expect(page).toHaveTitle('Financial App | Home');

    // Take screenshot of successful login state
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-success.png' });
  });

  test('TC-Log-001-002 - Failed login with empty (email & password) credentials', async () => {
    // Leave both email and password empty
    await Login.inputCredentials();

    // Submit login form
    await Login.login();

    // Check validation message for email input
    const emailInput = page.locator('#email');
    const emailValidationMessage = await emailInput.evaluate((el) => el.validationMessage);
    expect(emailValidationMessage).toBe("Please fill out this field.");

    // Take screenshot of validation error
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-fail[empty-email-password].png' });
  });

  test('TC-Log-001-003 - Failed login with invalid (email[not registered] & password) credentials', async () => {
    // Fill in invalid email and password
    await Login.inputCredentials(process.env.INVALID_EMAIL, process.env.INVALID_PASSWORD);

    // Submit login form
    await Login.login();

    // Assert error message is displayed
    await expect(Login.errorMessage).toBeVisible();

    // Take screenshot of failed login attempt
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-fail[invalid-email-password].png' });
  });

  test('TC-Log-001-004 - Failed login with invalid (password) credentials', async () => {
    // Fill in valid email and invalid password
    await Login.inputCredentials(process.env.VALID_EMAIL, process.env.INVALID_PASSWORD);

    // Submit login form
    await Login.login();

    // Assert error message is displayed
    await expect(Login.errorMessage).toBeVisible();

    // Take screenshot of failed login attempt
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-fail[invalid-password].png' });
  });

  test('TC-Log-001-005 - Failed login with invalid (email-format) credentials', async () => {
    // Fill in invalid email format and valid password
    await Login.inputCredentials(process.env.INVALID_EMAIL_FORMAT, process.env.VALID_PASSWORD);

    // Submit login form
    await Login.login();

    // Assert user stays on login page
    await expect(page).toHaveURL('/login');

    // Check built-in browser validation message
    const emailInput = page.locator('#email');
    const validationMessage = await emailInput.evaluate((el) => el.validationMessage);
    expect(validationMessage).toContain("include an '@'");
    
    // Take screenshot of validation error
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-fail[invalid-email-format].png' });
  });

  test('TC-Log-001-006 - Failed login with empty (email) credentials', async () => {
    // Leave email empty and fill in valid password
    await Login.inputCredentials('', process.env.VALID_PASSWORD);

    // Submit login form
    await Login.login();

    // Check validation message for email input
    const emailInput = page.locator('#email');
    const emailValidationMessage = await emailInput.evaluate((el) => el.validationMessage);
    expect(emailValidationMessage).toBe("Please fill out this field.");

    // Take screenshot of validation error
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-fail[empty-email].png' });
  });

  test('TC-Log-001-007 - Failed login with empty (password) credentials', async () => {
    // Fill in valid email and leave password empty
    await Login.inputCredentials(process.env.VALID_EMAIL, '');

    // Submit login form
    await Login.login();

    // Check validation message for password input
    const passwordInput = page.locator('#password');
    const passwordValidationMessage = await passwordInput.evaluate((el) => el.validationMessage);
    expect(passwordValidationMessage).toBe("Please fill out this field.");

    // Take screenshot of validation error
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-fail[empty-password].png' });
  });

  test('TC-Log-002-001 - Toggle show/hide password input', async () => {
    // Fill in password to enable the input field
    await Login.inputCredentials('', process.env.INVALID_PASSWORD);

    // Selectors for password input and toggle button
    const passwordInput = page.locator('#password');
    const toggleButton = page.locator('#toggle-password-visibility');

    // Initially, password input should be of type 'password'
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button to reveal password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text'); // Password should now be visible
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-password-visible.png' }); // Screenshot
    
    // Click again to hide password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password'); // Password should be hidden again
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/login-password-hidden.png' }); // Screenshot
  });

  test('TC-Log-003-001 - Navigate to Register page via "Register" link', async () => {
    // Click on the "Register" link
    const registerLink = page.locator('a[href="/register"]', { hasText: 'Register' });
    await registerLink.click();

    // Wait for navigation to register page
    await page.waitForURL('/register');

    // Verify URL and title of the register page
    await expect(page).toHaveURL('/register');
    await expect(page).toHaveTitle('Financial App | Register');

    // Take screenshot of the register page
    await page.screenshot({ path: 'tests/financial-app/screenshots/login/navigate-to-register.png' });
  });

});