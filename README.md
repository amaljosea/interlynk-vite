# Interlynk Demo App

# API Testing - Locally

1. So first you need to create a organization cause previous orgs are already have connections
2. Next you need copy the ORG ID and paste it inside the .env file
3. name REACT_APP_ORGID, just remove the existing id and paste the new ID
4. After that run the project 
5. Now you can test the new api integration for updating and creating connections


# Important point

The main API URL - 'http://localhost:3000/lynkapi' 

Incase if you have a different URL then you need to change the URL inside 

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

4. After the installation got to your project directory

```
cd lynk-dash-app
```

5. and then run these commands

```
npm install

npm run start

```

6. If you have any project running on localhost:3000 then it will ask for other port just press yes. then it will start on

```
port 3001
```
