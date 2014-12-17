#Optimizely Command Line Interface

Optimizely-CLI (optcli) is a command line tool that lets developers build experiments faster by using the sofware tools you already love and publish to Optimizely when ready. We build a lot of tests at [FunnelEnvy](http://www.funnelenvy.com) and found that (being stubborn engineers) we were more comfortable using our source editors and Git to develop locally - and this had a *significant* positive impact on our test velocity. Optimizely-cli is a command line executable that also integrates with the [Tampermonkey Chrome extension](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) for local preview and the Optimizely API for retrieving our publishing tests.

Brief intro below - for more usage details our [Optimizely-CLI page](http://www.funnelenvy.com/optimizely-cli).

## Installation

```
npm install -g optimizely-cli
```
This will install the __optcli__ exectuable on your system.

### Dependencies

You'll need to have node.js & npm installed locally to run `optcli` and the Google Chrome Browser with the TamperMonkey extension to preview local variations.

## Quickstart

```
optcli --help
```
View available commands

```
optcli init [project description]
```
Initializes a new Optimizely project locally (use `-r` for remote).

```
optcli experiment [options] <description> <url> [variation_descriptions]
```
Creates a new experiment (use `-r` for remote).

```
optcli variation [options] <experiment> <descriptions
```
Creates a new variation in an experiment (use `-r` for remote).

### Realtime Local Hosting
The following command will host variations locally. Requires TamperMonkey to view variation.

```sh
optcli host <variation_id>
```

## Known Issues

The __optcli clone__ command currently requests a directory. Leave this blank.


## Release History

* 0.0.1 Initial release
* 0.0.2 Clone bug fix


## Copyright and license

Code copyright 2014 Celerius Group Inc. Code released under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
