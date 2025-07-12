for alias_name in geta kv note store
do
  /bin/bash -c "ALIAS_NAME=${alias_name}; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"
done
