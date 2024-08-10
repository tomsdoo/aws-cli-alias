if [ \"$(node -v | cut -c 1)\" != \"v\" ]; then
  echo node.js is required
  exit 1
fi

UTILJSFILENAME=util.js
JSFILENAME=install.js
UTILJS=$TMPDIR$UTILJSFILENAME
INSTALLJS=$TMPDIR$JSFILENAME
REMOTE_UTILJS=https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/feature/kv/util.js

REMOTE_INSTALLJS="https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/feature/kv/install_${ALIAS_NAME}.js"

curl -fsSL $REMOTE_UTILJS > $UTILJS
curl -fsSL $REMOTE_INSTALLJS > $INSTALLJS

node $INSTALLJS
