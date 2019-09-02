# $Env:Orleans__ConnectionString = "DefaultEndpointsProtocol=https;AccountName=davidgriorleans;AccountKey=k5LriO+2QI8bvZWiM4lmB0dYYNdEu82VWQ60bc9CYy8yoGfPDOi3w143A+AAWm8stxAhrSzP8P0gmtCyVjKQtw==;EndpointSuffix=core.windows.net"
# $Env:Orleans__ClusterId = "smilrcluster"
# $Env:Orleans__ServiceId = "smilr"
# $Env:Orleans__LogLevel = "3"

docker run --rm -it -e Orleans__ConnectionString="DefaultEndpointsProtocol=https;AccountName=davidgriorleans;AccountKey=k5LriO+2QI8bvZWiM4lmB0dYYNdEu82VWQ60bc9CYy8yoGfPDOi3w143A+AAWm8stxAhrSzP8P0gmtCyVjKQtw==;EndpointSuffix=core.windows.net" smilr-orleans/silo