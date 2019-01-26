# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/configureResponder.js](source/configureResponder.js)
  - `configureResponder`
+ 📄 [source/option.js](source/option.js)
  - `MODE_NAME_LIST`, `formatUsage`, `parseOption`
+ 📄 [source/markdown/Marked.js](source/markdown/Marked.js)
  - `Marked`, `highlightStyleString`
+ 📄 [source/markdown/generateMarkdownHTML.js](source/markdown/generateMarkdownHTML.js)
  - `generateMarkdownHTML`

#### Bin Option Format
📄 [source/option.js](source/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from ENV: set to "env"
>       from JS/JSON file: set to "path/to/config.js|json"
>   --help --h -h [OPTIONAL] [ARGUMENT=0+]
>       show full help
>   --version --v -v [OPTIONAL] [ARGUMENT=0+]
>       show version
>   --host --H -H [OPTIONAL] [ARGUMENT=1]
>       set "hostname:port"
>     --https --S -S [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --file-SSL-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-SSL-cert [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-SSL-chain [OPTIONAL-CHECK] [ARGUMENT=1]
>       --file-SSL-dhparam [OPTIONAL-CHECK] [ARGUMENT=1]
>     --log-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --log-file-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>     --pid-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       --pid-ignore-exist [OPTIONAL-CHECK] [ARGUMENT=0+]
>           set to enable
>     --auth-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-gen [OPTIONAL-CHECK] [ARGUMENT=0+]
>           set to enable
>         --auth-gen-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-gen-size [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-gen-token-size [OPTIONAL-CHECK] [ARGUMENT=1]
>         --auth-gen-time-gap [OPTIONAL-CHECK] [ARGUMENT=1]
>     --auth-group-path [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-group-default-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-group-key-suffix [OPTIONAL-CHECK] [ARGUMENT=1]
>       --auth-group-verify-request-tag [OPTIONAL-CHECK] [ARGUMENT=1]
>     --root-path [OPTIONAL-CHECK] [ARGUMENT=1]
>         directory to use as server root
>     --sni-ssl-config [OPTIONAL-CHECK] [ARGUMENT=1]
>         SNI SSL JSON { [hostname]: { key, cert, chain } }
>   --generate-markdown --G -G [OPTIONAL] [ARGUMENT=1]
>       expect root-path, load Markdown and generate server Weblog & index
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_RUN_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_RUN_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_RUN_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_RUN_HOST="[OPTIONAL] [ARGUMENT=1]"
>     export DR_RUN_HTTPS="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_RUN_FILE_SSL_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_FILE_SSL_CERT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_FILE_SSL_CHAIN="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_FILE_SSL_DHPARAM="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_LOG_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_LOG_FILE_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_PID_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_PID_IGNORE_EXIST="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_RUN_AUTH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_AUTH_GEN="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export DR_RUN_AUTH_GEN_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_AUTH_GEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_AUTH_GEN_TOKEN_SIZE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_AUTH_GEN_TIME_GAP="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_AUTH_GROUP_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_AUTH_GROUP_DEFAULT_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_AUTH_GROUP_KEY_SUFFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_AUTH_GROUP_VERIFY_REQUEST_TAG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_ROOT_PATH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_SNI_SSL_CONFIG="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export DR_RUN_GENERATE_MARKDOWN="[OPTIONAL] [ARGUMENT=1]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "host": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "https": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "fileSSLKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileSSLCert": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileSSLChain": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "fileSSLDhparam": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "logPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "logFilePrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pidFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pidIgnoreExist": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "authFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGen": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "authGenTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTokenSize": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGenTimeGap": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGroupPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGroupDefaultTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGroupKeySuffix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "authGroupVerifyRequestTag": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "rootPath": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "sniSslConfig": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "generateMarkdown": [ "[OPTIONAL] [ARGUMENT=1]" ],
>   }
> ```
