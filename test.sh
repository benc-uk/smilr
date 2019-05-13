i=0
while [ $i -le 100 ]; do
  ip=$(dig +short rrr.56539f01234e4e00981e.westeurope.aksapp.io)
  echo "dig returned IP = $ip"
  if [ -n "$ip" ]; then
    break
  fi
  sleep 3
  i=$(( $i + 1 ))
done
echo "Found DNS record pointing to $ip"
