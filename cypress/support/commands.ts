/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Logs in via API and persists tokens in localStorage for the app origin.
			 * Uses Cypress env var `SEED_TEST_USERS_PASSWORD` unless an explicit password is provided.
			 */
			login(email: string, password?: string): Chainable<void>;
		}
	}
}

type LoginResponseBody = {
	success?: boolean;
	data?: {
		accessToken?: string;
		refreshToken?: string;
		user?: unknown;
	};
	error?: string;
	message?: string;
};

const getSeedPassword = (explicitPassword?: string): string => {
	const resolved = explicitPassword ?? (Cypress.env('SEED_TEST_USERS_PASSWORD') as string | undefined);
	if (resolved) return resolved;

	// Local fallback for developer convenience.
	// CI should set `SEED_TEST_USERS_PASSWORD` explicitly.
	Cypress.log({
		name: 'login',
		message: 'SEED_TEST_USERS_PASSWORD not set; falling back to Test123!'
	});
	return 'Test123!';
};

/**
 * IMPORTANT: We must set localStorage on the app origin.
 * If we set it on about:blank, auth will not persist.
 */
Cypress.Commands.add('login', (email: string, password?: string) => {
	const resolvedPassword = getSeedPassword(password);

	const ipForUser = (() => {
		// Ensure login rate limiting does not collide across different demo users in E2E.
		// Produces a deterministic RFC1918-style address.
		let hash = 0;
		for (let i = 0; i < email.length; i++) {
			hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
		}
		const a = (hash >> 16) & 0xff;
		const b = (hash >> 8) & 0xff;
		const c = hash & 0xff;
		return `10.${a}.${b}.${c}`;
	})();

	cy.session(
		[email, resolvedPassword],
		() => {
			// Establish correct origin before touching localStorage
			cy.visit('/', { failOnStatusCode: false });

			cy.request<LoginResponseBody>({
				method: 'POST',
				url: '/api/auth/login',
				headers: {
					'x-forwarded-for': ipForUser,
				},
				body: { email, password: resolvedPassword },
				failOnStatusCode: false,
			}).then((response) => {
				if (response.status !== 200 || !response.body?.data?.accessToken || !response.body?.data?.user) {
					throw new Error(
						`Login failed via API (status ${response.status}): ${JSON.stringify(response.body)}`
					);
				}

				const { accessToken, refreshToken, user } = response.body.data;

				cy.window().then((win) => {
					win.localStorage.setItem('accessToken', accessToken as string);
					if (refreshToken) win.localStorage.setItem('refreshToken', refreshToken as string);
					win.localStorage.setItem('userData', JSON.stringify(user));
				});
			});
		},
		{
			cacheAcrossSpecs: true,
		}
	);
});