# $Env:Orleans__ConnectionString = "DefaultEndpointsProtocol=https;AccountName=XXX;AccountKey=YYY;EndpointSuffix=core.windows.net"
# $Env:Orleans__ClusterId = "smilrcluster"
# $Env:Orleans__ServiceId = "smilr"
# $Env:Orleans__LogLevel = "3"

docker run --rm -it -e Orleans__ConnectionString="DefaultEndpointsProtocol=https;AccountName=XXX;AccountKey=YYY;EndpointSuffix=core.windows.net" smilr-orleans/silo