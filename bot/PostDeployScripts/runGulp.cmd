@echo off
setlocal

if exist ..\wwwroot\package.json (
  pushd ..\wwwroot
  echo npm install --production
  call npm install --production
  popd
)

for /d %%d in (..\wwwroot\*) do (  
  echo check %%d
  pushd %%d
  if exist package.json (
    echo npm install --production
    call npm install --production
  ) else (
    echo no package.json found    
  )
  popd 
)

echo record deployment timestamp
date /t >> ..\deployment.log
time /t >> ..\deployment.log
echo ---------------------- >> ..\deployment.log
echo Deployment done

