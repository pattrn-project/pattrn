# Pattrn

[Pattrn](http://pattrn.co) is a web platform for data-driven,
participatory fact mapping.
Its focus is on rapid deployment in the following contexts:

* conflict monitoring
* investigative journalism
* human rights
* citizen science
* research and analysis

## Quick start

### For researchers and data scientists

*This section is being written*.

### For developers

* Clone this repository or download a Pattrn v2.0 release as `zip` or `tar.gz` file

* Install all the required NPM packages:

`npm install`

* Download a sample Pattrn data package - for example, the ACLED Africa realtime 2016 dataset:

`npm install https://gitlab.com/pattrn-data/pattrn-data-acled-africa-realtime-2016.git#pattrn-data`

* Create a `pattrn-data-config.json` file to instruct the Pattrn build script
  to use the Pattrn data package just downloaded; the content of this file
  should be as in the following example (replace
  `pattrn-data-acled-africa-realtime-2016` with the name of your Pattrn data
  package, if using a different one):

`{ "source_data_package": "pattrn-data-acled-africa-realtime-2016" }`

* Build the Pattrn application, which includes the data package configured:

`npm run gulp build`

* Start a local web server to test the Pattrn app:

`npm start`

This command will display some messages while the web server is started,
such as:

```
> pattrn@2.0.0-beta1 start /root/pattrn
> http-server dist/

Starting up http-server, serving dist/
Available on:
  http:127.0.0.1:8080
  http:10.2.200.149:8080
Hit CTRL-C to stop the server
```

You can now open the Pattrn app in a web browser; if no other service is using port
8080 on the computer, the address to use will be `http://localhost:8080`.
If the messages above include a number other than 8080 (e.g. 8081), change
the address accordingly (e.g. `http://localhost:8081`).

## Authors and contributors

The PATTRN project was initiated thanks to a Proof-of-Concept Grant from the
[European Research Council](https://erc.europa.eu/), awarded to
Prof. Eyal Weizman, in the framework of
[Forensic Architecture](http://forensic-architecture.org) (2014-2015).

### Pattrn v2.0

* Technical lead and data science: [andrea rota](https://github.com/hotzeplotz)
* Project management: [Nick Axel](https://github.com/alucidwake)

### Pattrn v1.0

* Project Architect: [FSBRG](https://twitter.com/fsbrg) (Francesco Sebregondi)
* Frontend development: [TEKJA Data](http://tekja.com/)
* Pattrn editor development: [Digital Consolidation](http://www.digital-consolidation.co.uk/)

All new contributors to the PATTRN project will be duly credited.

## License

Pattrn is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Pattrn is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Pattrn.  If not, see <http://www.gnu.org/licenses/>.
