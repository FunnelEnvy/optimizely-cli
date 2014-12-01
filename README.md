#Optimizely Command Line Interface

A command line application to create Optimizely experiments and publish via the
API

Please forgive this document's incompleteness. We're still working on it :).

## Installation

```
npm install -g optimizely-cli
```
This will install the __optcli__ exectuable on your system.

## Usage

Again, this is still a work in progress, but you can view the available commands using the --help option

```
optcli --help
```
### Realtime Localhosting
The following command will set host variations

```sh
optcli host <variation_id>
```

Use [nodemon](https://www.npmjs.org/package/nodemon) to force the server to update as you edit files

```sh
nodemon --exec "optcli host <variation_id>" -e css,js,json

```

## Know Issues

The __optcli clone__ command currently requests a directory. Leave this blank.


## Release History

* 0.0.1 Initial release
* 0.0.2 Clone bug fix


## Copyright and license

Code copyright 2014 Celeriusgroup Inc. Code released under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
