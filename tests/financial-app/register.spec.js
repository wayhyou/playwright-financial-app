import {test, expect, chromium} from '@playwright/test';
import { RegisterPage } from '../../pages/register';

test.describe('Register Page Tests', () => {

    let browser;
    let context;
    let page;

    let Register;

    test.beforeAll(async () => {
        browser = await chromium.launch({
            slowMo: 500,
            headless: false,
        });

        context = await browser.newContext({
            recordVideo: {
                dir: 'tests/financial-app/videos/register/',
                size: { width: 1280, height: 720 }
            }
        });

        await context.tracing.start({ snapshots: true, screenshots: true });
        page = await context.newPage();
        Register = new RegisterPage(page);
    })
    
    test.beforeEach(async () => {
        await Register.navigate();
        await page.click('text=Register');
    })

    test.afterAll(async () => {
        await context.tracing.stop({ path: 'tests/financial-app/traces/register.zip' });
        await context.close();
    })

    test('Should display register page', async () => {
        // URL and Title
        await expect(page).toHaveURL('/register');
        await expect(page).toHaveTitle('Financial App | Register');

        // Heading and form input
        await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
        await expect(page.locator('#fullName')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('button[type="submit"]', { name: 'Sign Up' })).toBeVisible();

        // Link "Already registered? Login"
        await expect(page.locator('text=Already registered?')).toBeVisible();
        const loginLink = page.locator('a[href="/login"]', { hasText: 'Login' });
        await expect(loginLink).toBeVisible();
        await expect(loginLink).toHaveAttribute('href', '/login');

        // Screenshot
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/register-page.png' });
    });

    test('TC-Reg-001-001 - Successfully registered with valid credentials', async () => {
        // Input registration details
        await Register.inputRegistrationDetails(
            process.env.NEW_FULLNAME,
            process.env.NEW_EMAIL,
            process.env.NEW_PASSWORD
        );

        // Submit registration form
        await Register.register();

        // Wait for navigation to home page
        await page.waitForURL('/home');

        // Verify successful registration by checking URL and title
        await expect(page).toHaveURL('/home');
        await expect(page).toHaveTitle('Financial App | Home');

        // Take screenshot of the home page after successful registration
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/register-success.png' });
    });

    test('TC-Reg-001-002 - Failed registration with empty (fullName, email & password) credentials', async () => {
        // Leave fullName, email and password empty
        await Register.inputRegistrationDetails();

        // Submit registeration form
        await Register.register();

        // Check validation message for fullName input
        const fullNameInput = page.locator('#fullName');
        const fullNameValidationMessage = await fullNameInput.evaluate((el) => el.validationMessage);
        expect(fullNameValidationMessage).toBe("Please fill out this field.");

        // Take screenshot of validation error
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/register-fail[empty-fullName-email-password].png' });
    });

    test('TC-Reg-001-003 - Failed registration with empty (fullName) credentials', async () => {
        // Leave fullName empty and fill in email and password
        await Register.inputRegistrationDetails(
            '',
            'newemail@mail.com',
            'password123'
        );

        // Submit registeration form
        await Register.register();

        // Check validation message for fullName input
        const fullNameInput = page.locator('#fullName');
        const fullNameValidationMessage = await fullNameInput.evaluate((el) => el.validationMessage);
        expect(fullNameValidationMessage).toBe("Please fill out this field.");

        // Take screenshot of validation error
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/register-fail[empty-fullName].png' });
    });

    test('TC-Reg-001-004 - Failed registration with empty (email) credentials', async () => {
        // Leave email empty and fill in fullName and password
        await Register.inputRegistrationDetails(
            'Test User',
            '',
            'password123'
        );

        // Submit registeration form
        await Register.register();

        // Check validation message for email input
        const emailInput = page.locator('#email');
        const emailValidationMessage = await emailInput.evaluate((el) => el.validationMessage);
        expect(emailValidationMessage).toBe("Please fill out this field.");

        // Take screenshot of validation error
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/register-fail[empty-email].png' });
    });

    test('TC-Reg-001-005 - Failed registration with empty (password) credentials', async () => {
        // Leave password empty and fill in fullName and email
        await Register.inputRegistrationDetails(
            'Test User',
            'newemail@mail.com',
            ''
        );

        // Submit registeration form
        await Register.register();        

        // Check validation message for password input
        const passwordInput = page.locator('#password');
        const passwordValidationMessage = await passwordInput.evaluate((el) => el.validationMessage);
        expect(passwordValidationMessage).toBe("Please fill out this field.");

        // Take screenshot of validation error
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/register-fail[empty-password].png' });
    });

    test('TC-Reg-001-006 - Failed registration with invalid (email already in use) credentials', async () => {
        // Input invalid registration details
        await Register.inputRegistrationDetails(
            'Test User',
            process.env.NEW_EMAIL, // Email already in use
            'password123'
        );

        // Submit registration form
        await Register.register();

        // Assert user stays on register page
        await expect(page).toHaveURL('/register');

        // Verify error message is displayed
        await expect(Register.errorMessageEmailAlreadyInUse).toBeVisible();

        // Take screenshot of the error message
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/register-fail[email-already-in-use].png' });
    });

    test('TC-Reg-001-007 - Failed registration with invalid (email format) credentials', async () => {
        // Input invalid registration details
        await Register.inputRegistrationDetails(
            'Test User',
            process.env.INVALID_EMAIL_FORMAT, // Invalid email format
            'password123'
        );

        // Submit registration form
        await Register.register();

        // Assert user stays on register page
        await expect(page).toHaveURL('/register');

        // Check built-in browser validation message
        const emailInput = page.locator('#email');
        const validationMessage = await emailInput.evaluate((el) => el.validationMessage);
        expect(validationMessage).toContain("include an '@'");

        // Take screenshot of the error message
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/register-fail[invalid-email-format].png' });
    });

    test('TC-Reg-001-008 - Failed registration with invalid (password too short) credentials', async () => {
        // Input invalid registration details
        await Register.inputRegistrationDetails(
            'Test User',
            'newemail@mail.com',
            'pass' // Password too short
        );

        // Submit registration form
        await Register.register();

        // Assert user stays on register page
        await expect(page).toHaveURL('/register');

        // Verify error message is displayed
        await expect(Register.errorMessagePassword).toBeVisible();

        // Take screenshot of the error message
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/register-fail[password-too-short].png' });
    });

    test('TC-Reg-002-001 - Navigate to Login page via "Login" link', async () => {
        // Click on the "Login" link
        const loginLink = page.locator('a[href="/login"]', { hasText: 'Login' });
        await loginLink.click();

        // Verify navigation to login page
        await expect(page).toHaveURL('/login');
        await expect(page).toHaveTitle('Financial App | Login');

        // Take screenshot of the login page
        await page.screenshot({ path: 'tests/financial-app/screenshots/register/navigate-to-login.png' });
    });

})