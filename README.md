# Interlynk Dashboard

# API Testing - Locally

1. Create an organization
2. Next you need copy the ORG ID and paste it inside the .env file
3. name REACT_APP_ORGID, just remove the existing id and paste the new ID
4. After that run the project
5. Now you can test the new api integration for updating and creating connections

# Important point

The main API URL - 'http://localhost:3000/lynkapi'

In case if you have a different URL, then you need to change the URL inside

## /src/index.js --> ApolloClient object

# Install Node JS & NPM

1. If using Zsh, install NVM like so:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | zsh
```

2. If using Zsh, open the ~/.zshrc file and update the plugins:

```
plugins=(git nvm)
```

3. Install the recommended LTS version of Node. It will automatically install NPM and Node.

```
nvm install --lts

node -v
npm -v

```

4. After the installation, go to your project directory

```
cd lynk-dash-app
```

Create a `.env` file by copying either `.env.customLocal` or `.env.customStaging`, depending on your preferred backend.

5. and then run these commands

```
npm install

npm run start

```

5.5 If `npm run start` gives you error:

```
....
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
....
```

set

```
export NODE_OPTIONS=--openssl-legacy-provider
```

and retry

6. If you have any project running on localhost:3000 then it will ask for other port just press yes. then it will start on

```
port 3001
```

# Installing VSCode extensions

- Install all the workspace recommended extensions, see `.vscode/extensions.json`

# Playwright Testing - Locally and in CI

Playwright is used for end-to-end (E2E) testing of the Interlynk Dashboard to ensure that key workflows function as expected.

## Prerequisites

1. **Playwright Browsers:** Install Playwright browsers locally.

```cmd
  npm ci  # To install dependencies
  npx playwright install --with-deps  # To install browsers and dependencies
```

2. **Environment Variables:** Ensure you have the correct environment variables configured in your .env

```cmd
PLAYWRIGHT_TEST_URL=https://staging.interlynk.io
PLAYWRIGHT_USER_EMAIL=youremail@example.com
PLAYWRIGHT_USER_PASSWORD=YourSecurePassword
```

## Running Tests Locally

1. **Run Individual Test:**
   Navigate to the root folder adn Execute the following command to run an individual test script:

   ```cmd
   npx playwright test <test_script_name>
   ```

2. **Parallel Execution:**
   For parallel execution of tests, use the following command:

   ```cmd
   npx playwright test
   ```

3. **To run tests in headed mode (with the browser visible):**

   ```cmd
   npx playwright test --headed
   ```

## CI/CD Integration with GitHub Actions

Playwright is configured to run in a CI/CD environment using GitHub Actions.
To run the Playwright tests in GitHub Actions, you can trigger the workflow by going to the "Actions" tab in your repository.
If any tests fail, the Playwright report will be uploaded as an artifact for review.

## Additional Notes

- **Test Results:**
  After execution of tests results will be available in `playwright-report` folder and if we want show the report by using following command
  ```cmd
  npx playwright show-report
  ```
