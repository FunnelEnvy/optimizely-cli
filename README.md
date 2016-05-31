#Optimizely Command Line Interface

[![Codeship Status for FunnelEnvy/optimizely-cli](https://codeship.com/projects/3b6cfc10-040d-0133-0e10-62fced7320b0/status?branch=master)](https://codeship.com/projects/89330)    
[![Code Climate](https://codeclimate.com/github/FunnelEnvy/optimizely-cli/badges/gpa.svg)](https://codeclimate.com/github/FunnelEnvy/optimizely-cli) [![Test Coverage](https://codeclimate.com/github/FunnelEnvy/optimizely-cli/badges/coverage.svg)](https://codeclimate.com/github/FunnelEnvy/optimizely-cli/coverage)

Optimizely-CLI (optcli) is a command line tool that lets developers build experiments faster by using the sofware tools you already love and publish to Optimizely when ready. We build a lot of tests at [FunnelEnvy](http://www.funnelenvy.com) and found that (being stubborn engineers) we were more comfortable using our source editors and Git to develop locally - and this had a *significant* positive impact on our test velocity.

Optimizely-cli includes a command line executable that also integrates with either the[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) (Google Chrome) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) extensions for local development / preview and the Optimizely API for publishing tests.

Brief intro below - for more usage details check out our [Optimizely-CLI page](http://www.funnelenvy.com/optimizely-cli/).

## Installation

```
npm install -g optimizely-cli
```
This will install the __optcli__ executable on your system.

### Dependencies


You'll need to have [node.js](http://nodejs.org/) installed locally to run `optcli` and either the Tampermonkey or Greasemonkey extensions to view variations locally.

## Quickstart

```
optcli
```

View available commands

```
optcli init [options] [project_id]
```
Initializes a new Optimizely project locally (use `-r` for remote).

```
optcli experiment <folder> <description> <url>
```
Create a local experiment

```
optcli variation <experiment> <folder> <description>
```
Create a local variation

```
optcli host [options] <path> [port]
```
Host a variation locally. Point your browser at http(s)://localhost:8080 (default port) for usage info.

```
optcli push-experiment <path>
```
Push a local experiment to Optimizely.

```
optcli push-variation <path>
```
Push a local variation to Optimizely

## Known Issues
* Tests - We have some. We're adding more.


## Release History
* 0.15.0 Iteration option on push-experiment
* 0.14.3 Added push-experiment, push-variation tests
* 0.14.2 Show help when no arguments passed
* 0.14.1 Bugfixes
* 0.14.0 Move node client into [separate module](https://github.com/FunnelEnvy/optimizely-node)
* 0.12.0 Bugfixes, more compliant with semver
* 0.0.11 Separated create from push operations
* 0.0.10 Refactored and cleanup
* 0.0.7 Push
* 0.0.2 Clone bug fix
* 0.0.1 Initial release

## Contributing

Please see [CONTRIBUTING.md](contributing.md).

## Copyright and license

Code copyright 2015 Celerius Group Inc. Released under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
