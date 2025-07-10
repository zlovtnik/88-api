# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.0.

## Features

- **Authentication System**: Complete login and registration functionality
- **Modern UI**: Beautiful, responsive design with gradient backgrounds
- **Form Validation**: Real-time validation with error messages
- **Token Management**: Automatic token storage and refresh
- **Route Protection**: Automatic redirection based on authentication status

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Backend Requirements

This frontend requires the backend API to be running on `http://localhost:3000`. Make sure the backend server is started before testing the authentication features.

### Backend Endpoints Used

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user profile
- `POST /auth/refresh` - Refresh access token

## Testing the Login Functionality

1. **Start the backend server** (from the parent directory):
   ```bash
   cd ../backend
   bun run dev
   ```

2. **Start the frontend server**:
   ```bash
   ng serve
   ```

3. **Test Registration**:
   - Navigate to `http://localhost:4200/register`
   - Fill in the registration form with:
     - Name: "Test User"
     - Email: "test@example.com"
     - Password: "password123"
   - Click "Create Account"
   - You should be redirected to the dashboard

4. **Test Login**:
   - Navigate to `http://localhost:4200/login`
   - Fill in the login form with:
     - Email: "test@example.com"
     - Password: "password123"
   - Click "Sign In"
   - You should be redirected to the dashboard

5. **Test Logout**:
   - On the dashboard, click the "Logout" button
   - You should be redirected back to the login page

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   └── login.component.scss
│   │   ├── register/
│   │   │   ├── register.component.ts
│   │   │   └── register.component.scss
│   │   └── dashboard/
│   │       └── dashboard.component.ts
│   ├── services/
│   │   └── auth.service.ts
│   ├── app.routes.ts
│   ├── app.config.ts
│   └── app.html
└── styles.scss
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
