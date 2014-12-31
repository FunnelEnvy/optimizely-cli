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

Again, this is still a work in progress, but you can view the available commands using the help command

```
optcli help
```

View available commands

```
optcli example
```

View example commands


```
optcli init [project description]
```
Initializes a new Optimizely project locally (use `-r` for remote).




### Realtime Localhosting
The following command will set host variations

```
optcli experiment [options] <description> <url>
```
Creates a new experiment (use `-r` for remote).

```
optcli variation [options] <experiment> <description>
```
Creates a new variation in an experiment (use `-r` for remote).

## Know Issues

Pushing a variation for the first time i.e.

```
optcli push "experiment" "variation"
```

Results in an error upon fist push. Subsequent tries are successful.


## Release History

* 0.0.1 Initial release
* 0.0.2 Clone bug fix
* 0.0.7 Push


## Copyright and license

Code copyright 2014 Celerius Group Inc. Code released under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
