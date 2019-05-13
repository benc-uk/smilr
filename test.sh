i=0
while [ $i -le 100 ]; do
  ip=$(dig +short zzz.56539f01234e4e00981e.westeurope.aksapp.io)
  if [ -n "$ip" ]; then
    break
  fi
  sleep 3
  i=$(( $i + 1 ))
done
echo "Found DNS record pointing to $ip"
