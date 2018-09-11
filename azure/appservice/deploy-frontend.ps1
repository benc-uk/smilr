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
$tempDir = ".\azure\appservice\tmp\"
$zipName = ".\azure\appservice\tmp.zip"
$angularDir = ".\angular"


if((Test-Path "azure") -And (Test-Path "angular")) {
    echo "### Building Angular app for deployment to: ${appService}"
} else {
    echo "### YOU MUST RUN THIS FROM THE PROJECT ROOT, BYE!"
    exit
}

if(Test-Path $angularDir\dist) {
    echo "### I found a dist folder in the project root, so will carry on and use that!"    
} else {
    try {
        Start-Process -FilePath "node" -ArgumentList "c:\dev\smilr\angular\node_modules\@angular\cli\bin\ng build","--prod" -WorkingDirectory $angularDir
    } catch {
        echo "### Wasn't able to ``run ng`` build and no dist folder was found, I can't carry on, sorry bye!"  
        exit  
    }  
}

echo "### Bundling Node server with Angular app"
try {
    rmdir -fo -r $tempDir
} catch {}

mkdir $tempDir
cp -r $angularDir\dist\* -Destination $tempDir
cp node\frontend\package.json -Destination $tempDir
cp node\frontend\package-lock.json -Destination $tempDir
cp node\frontend\server.js -Destination $tempDir
cp node\frontend\.deployment -Destination $tempDir

echo "### Zipping everything ready for deployment"
try { 
    rm $zipName
} catch {}
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