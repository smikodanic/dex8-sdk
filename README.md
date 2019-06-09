# DEX8 SDK
>DEX8 SDK is Software Development Kit for DEX8 platform (dex8.com).


## Documentation
Documentation is available at [https://www.dex8.com/learn/documentation](https://www.dex8.com/learn/documentation) .


## Installation
```bash
$ git clone git@github.com:smikodanic/dex8-sdk.git <dex8-project-name>
$ rm -rf .git    (remove git dir)
$ npm run inst   (will install all npm packages without downloading Chromium browser)
```

## Develop and run task
For faster development copy&paste *tasks/00template* and use it to create new DEX8 robot's task.
```bash
$ cd tasks
$ node start <path-to-folder>
```


## dex8-lib
*dex8-lib* is library required for faster DEX8 task development.
```json
package.json in development
---------------------------
"dependencies": {
  "dex8-lib": "file:../dex8-lib",
}

IMPORTANT!!! Every time when *dex8-lib* is changed run **$npm install dex8-lib**.



package.json in production
---------------------------
"dependencies": {
  "dex8-lib": "^1.0.0",
}


### Folders
- **/tasks** - DEX8 task development (write and test new task scripts here)


### Licence
Copyright (c) 2018 Saša Mikodanić (Cloud jdoo) licensed under [MIT](https://github.com/smikodanic/dex8-sdk/blob/master/LICENSE) .
