if [ \"$(node -v | cut -c 1)\" != \"v\" ]; then
  echo node.js is required
  exit 1
fi

JSFILENAME=install.js
INSTALLJS=$TMPDIR$JSFILENAME

echo $INSTALLJS

#curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias-code/HEAD/install.js > $INSTALLJS
curl -fsSL http://localhost:8080/install.js > $INSTALLJS

echo cat $INSTALLJS
node $INSTALLJS
