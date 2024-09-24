const fs = require('fs')
const path = require('path')

// Path to the .env file
const envPath = path.join(__dirname, '.env')

// Check if the .env file exists
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found!')
  console.error(
    'Please create a .env file in the project root and copy content from either customStaging or customLocal'
  )
  process.exit(1) // Exit with error
} else {
  console.log('.env file found. Starting the application...')
}
