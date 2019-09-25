# Specification

* [Export Path](#export-path)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/configureServer.js](source/configureServer.js)
  - `configureServer`
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
>     --https --S -S [ARGUMENT=0+]
>         set to enable
>       --file-TLS-key [ARGUMENT=1]
>       --file-TLS-cert [ARGUMENT=1]
>       --file-TLS-CA [ARGUMENT=1]
>           trusted CA cert
>       --file-TLS-SNI-config [ARGUMENT=1]
>           TLS SNI JSON like: { [hostname]: { key, cert, ca } }
>       --file-TLS-dhparam [ARGUMENT=1]
>           Diffie-Hellman Key Exchange, generate with: "openssl dhparam -dsaparam -outform PEM -out output/path/dh4096.pem 4096"
>     --root-path [ARGUMENT=1]
>         directory to use as server root
>     --log-path [ARGUMENT=1]
>       --log-file-prefix [ARGUMENT=1]
>     --pid-file [ARGUMENT=1]
>       --pid-ignore-exist [ARGUMENT=0+]
>           set to enable
>     --auth-skip [ARGUMENT=0+]
>         set to enable
>     --auth-file [ARGUMENT=1]
>     --auth-file-group-path [ARGUMENT=1]
>       --auth-file-group-default-tag [ARGUMENT=1]
>       --auth-file-group-key-suffix [ARGUMENT=1]
>   --generate-markdown --G -G [OPTIONAL] [ARGUMENT=1]
>       expect root-path, load Markdown and generate server Weblog & index
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export DR_RUN_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export DR_RUN_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_RUN_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export DR_RUN_HOST="[OPTIONAL] [ARGUMENT=1]"
>     export DR_RUN_HTTPS="[ARGUMENT=0+]"
>     export DR_RUN_FILE_TLS_KEY="[ARGUMENT=1]"
>     export DR_RUN_FILE_TLS_CERT="[ARGUMENT=1]"
>     export DR_RUN_FILE_TLS_CA="[ARGUMENT=1]"
>     export DR_RUN_FILE_TLS_SNI_CONFIG="[ARGUMENT=1]"
>     export DR_RUN_FILE_TLS_DHPARAM="[ARGUMENT=1]"
>     export DR_RUN_ROOT_PATH="[ARGUMENT=1]"
>     export DR_RUN_LOG_PATH="[ARGUMENT=1]"
>     export DR_RUN_LOG_FILE_PREFIX="[ARGUMENT=1]"
>     export DR_RUN_PID_FILE="[ARGUMENT=1]"
>     export DR_RUN_PID_IGNORE_EXIST="[ARGUMENT=0+]"
>     export DR_RUN_AUTH_SKIP="[ARGUMENT=0+]"
>     export DR_RUN_AUTH_FILE="[ARGUMENT=1]"
>     export DR_RUN_AUTH_FILE_GROUP_PATH="[ARGUMENT=1]"
>     export DR_RUN_AUTH_FILE_GROUP_DEFAULT_TAG="[ARGUMENT=1]"
>     export DR_RUN_AUTH_FILE_GROUP_KEY_SUFFIX="[ARGUMENT=1]"
>     export DR_RUN_GENERATE_MARKDOWN="[OPTIONAL] [ARGUMENT=1]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "host": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "https": [ "[ARGUMENT=0+]" ],
>     "fileTLSKey": [ "[ARGUMENT=1]" ],
>     "fileTLSCert": [ "[ARGUMENT=1]" ],
>     "fileTLSCA": [ "[ARGUMENT=1]" ],
>     "fileTLSSNIConfig": [ "[ARGUMENT=1]" ],
>     "fileTLSDhparam": [ "[ARGUMENT=1]" ],
>     "rootPath": [ "[ARGUMENT=1]" ],
>     "logPath": [ "[ARGUMENT=1]" ],
>     "logFilePrefix": [ "[ARGUMENT=1]" ],
>     "pidFile": [ "[ARGUMENT=1]" ],
>     "pidIgnoreExist": [ "[ARGUMENT=0+]" ],
>     "authSkip": [ "[ARGUMENT=0+]" ],
>     "authFile": [ "[ARGUMENT=1]" ],
>     "authFileGroupPath": [ "[ARGUMENT=1]" ],
>     "authFileGroupDefaultTag": [ "[ARGUMENT=1]" ],
>     "authFileGroupKeySuffix": [ "[ARGUMENT=1]" ],
>     "generateMarkdown": [ "[OPTIONAL] [ARGUMENT=1]" ],
>   }
> ```
