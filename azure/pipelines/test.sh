
export _ACR_NAME=$(cat $HOME/.docker/config.json | jq -r '.auths | with_entries( select(.key|contains("azurecr.io")) ) | keys[0]')
secret=$(cat $HOME/.docker/config.json | jq -r '.auths | with_entries( select(.key|contains("azurecr.io")) ) [].auth' | python -m base64 -d)
export _ACR_USER=$(echo $secret | awk -F':' '{print $1}')
export _ACR_PASSWORD=$(echo $secret | awk -F':' '{print $2}')

echo $_ACR_NAME
echo $_ACR_USER
echo $_ACR_PASSWORD
