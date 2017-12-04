#
# This script is designed to deploy the frontend to an  
# existing Azure App Service instance 
#

# CHANGE THESE!
$appService = "smilr-demo"
$appSvcUser = "bcdeployer"

# Don't change these
$tempDir = ".\tmp_frontend\"
$zipName = "tmp_frontend.zip"

echo "### Building Angular app for deployment"
iex "ng build --prod"

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
$SecurePassword = Read-Host -AsSecureString  "### App Service deployment password"
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)            
$pass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)  
$pair = "$($appSvcUser):$($pass)"
$encodedCreds = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
$basicAuthValue = "Basic $encodedCreds"
$Headers = @{
    Authorization = $basicAuthValue
}

echo "### Deploying to App Service using zipdeploy"
$res = Invoke-WebRequest -Uri "https://$appService.scm.azurewebsites.net/api/zipdeploy" -Method POST -InFile $zipName -Credential $cred -ContentType 'application/zip' -Headers $Headers
echo "### Zipdeploy returned code: $($res.StatusCode)"