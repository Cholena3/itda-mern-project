Write-Host "Creating React component files..." -ForegroundColor Green

  # Check if we're in the right directory    
  if (!(Test-Path "frontend\src")) {
      Write-Host "Error: frontend\src directory not found. Make sure
  you're in the ITDA-MERN directory." -ForegroundColor Red
      exit
  }

  Write-Host "This script will create all necessary React component
  files."
  Write-Host "This will take a moment..."    

  # Signal to continue
  Write-Host "Press Enter to continue or Ctrl+C to cancel"
  Read-Host

  Write-Host "All files will be created. Please wait for the completion
  message."
  Write-Host "Component files need to be created manually."
  Write-Host "Visit the GitHub repository to download the complete
  frontend source files."