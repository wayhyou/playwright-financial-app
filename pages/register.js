export class RegisterPage {
    constructor(page) {

        if (!page) {
            throw new Error("The 'page' parameter must be provided to RegisterPage constructor.");
        }
        
        this.page = page;
        this.fullNameInput = page.locator('#fullName');
        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('button[type="submit"]');
        this.errorMessageEmailAlreadyInUse = page.locator('text=Firebase: Error (auth/email-already-in-use).');
        this.errorMessagePassword = page.locator('text=Firebase: Password should be at least 6 characters (auth/weak-password).');
    }

    async navigate() {
        await this.page.goto('/');
    }

    async inputRegistrationDetails(fullName = '', email = '', password = '') {
        await this.fullNameInput.fill(fullName);
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
    }

    async register() {
        await this.loginButton.click({ noWaitAfter: true });
    }
}