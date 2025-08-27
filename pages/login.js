export class LoginPage {
    constructor(page) {

        if (!page) {
            throw new Error("The 'page' parameter must be provided to LoginPage constructor.");
        }
        
        this.page = page;
        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('text=Firebase: Error (auth/invalid-credential).');
    }

    async navigate() {
        await this.page.goto('/');
    }

    async inputCredentials(email = '', password = '') {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
    }

    async login() {
        await this.loginButton.click({ noWaitAfter: true });
    }
}