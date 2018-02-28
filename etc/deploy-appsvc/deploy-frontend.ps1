#
# This script is designed to deploy the frontend in prod mode to an existing Azure App Service instance 
# This requires Node.js and the Angular CLI installed on Windows, not inside WSL
#

# CHANGE THESE!
param (
    [string]$appService = "smilr-live",
    [string]$deployUser = "bcdeployer"
)

# Don't change these
$tempDir = ".\tmp_frontend\"
$zipName = "tmp_frontend.zip"

echo "### Building Angular app for deployment to: ${appService}"
try {
    iex "ng build --prod"
} catch {
    echo "### Error running Angular build, likely you don't have Angular CLI installed"
}
if(Test-Path "..\..\dist") {
    echo "### I found a dist folder in the project root, so will carry on and use that!"    
} else {
    echo "### Wasn't able to ``run ng`` build and no dist folder was found, I can't carry on, sorry bye!"  
    exit  
}

echo "### Bundling Node server with Angular app"
rmdir -fo -r $tempDir
mkdir $tempDir
cp -r ..\..\dist\* -Destination $tempDir
cp ..\..\service-frontend\package.json -Destination $tempDir
cp ..\..\service-frontend\package-lock.json -Destination $tempDir
cp ..\..\service-frontend\server.js -Destination $tempDir
cp ..\..\service-frontend\.deployment -Destination $tempDir

echo "### Zipping everything ready for deployment"
rmdir $zipName
Compress-Archive "$tempDir*" -DestinationPath $zipName

# All this crap is to work around lack of HTTP basic auth in Invoke-WebRequest 
# I should have written this in bash!
$SecurePassword = Read-Host -AsSecureString  "### App Service deployment password"
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)            
$pass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)  
$pair = "$($deployUser):$($pass)"
$encodedCreds = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
$basicAuthValue = "Basic $encodedCreds"
$Headers = @{
    Authorization = $basicAuthValue
}

echo "### Deploying to App Service using zipdeploy"
$res = Invoke-WebRequest -Uri "https://$appService.scm.azurewebsites.net/api/zipdeploy" -Method POST -InFile $zipName -Credential $cred -ContentType 'application/zip' -Headers $Headers
echo "### Zipdeploy returned code: $($res.StatusCode)"