# DEX8 SDK
>DEX8 SDK is Software Development Kit for DEX8 platform (dex8.com).


## Documentation
Documentation is available at [https://www.dex8.com/learn/documentation](https://www.dex8.com/learn/documentation) .


## Installation
If you want to use this library in other projects.
```bash
npm install dex8-sdk --save

const dex8lib = require('dex8-sdk').dex8lib;
```

## DEX8 Task Development
If you want to use this library for DEX8 tasks development.
```bash
$ git clone git@github.com:smikodanic/dex8-sdk.git <dex8-project-name>
$ rm -rf .git    (remove git dir)
$ npm run inst   (will install all npm packages without downloading Chromium browser)

-- run script --
$ cd tasks
$ node start <path-to-script>
```
For faster development copy&paste *tasks/00template* .



### Folders
- **/dex8lib** - DEX8 libraries (FunctionFlow, Randomize, logger, ...etc)
- **/tasks** - DEX8 task development (write and test new task scripts here)


### Licence
Copyright (c) 2018 Saša Mikodanić (Cloud jdoo) licensed under [MIT](https://github.com/smikodanic/dex8-sdk/blob/master/LICENSE) .
