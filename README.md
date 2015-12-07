# pattrn

Data-driven, participatory fact-mapping for:

* conflict monitoring
* human rights
* investigative journalism
* citizen science
* research and analysis


1. What is PATTRN?
2. How it works?
3. How to install?
4. Contributing



## 1. What is PATTRN
### PATTRN is a tool to map complex events – such as conflicts, protests, or crises – as they unfold.

Working as an **aggregator of data** in different media formats as well as an advanced **data visualisation** platform, PATTRN enables its community of users to share and collate first-hand reports of events on the ground and to **make sense** of diffused fragments of information.

Its principle is simple: everything that happens does so at a given place and time. The tool enables its users to build a **database of events** with space and time coordinates, and to add **tags**, **media**, and **content** to these events. Anyone can contribute data.

The database can then be explored through an online **visualisation platform**: while a map provides access to the **details** of each event, interactive charts and filters enable to reveal **patterns** across the data. Together, users of PATTRN can draw the **big picture** of an overall situation.



## 2. How it works?

At its current prototype stage of development, PATTRN comprises of:

1) A frontend visualisation platform combining several JavaScript libraries – which pulls and visualises data from Google Sheets.

2) A spreadsheet hosted on Google Sheets, in sync with the visualisation platform, and which can be edited either directly in Google Sheets, or through the data editing app.

3) A data editing web-app, built on Google Apps Script and specifically developed for PATTRN, which facilitates the process of entering and editing data.


## 3. How to install and run on Unix systems?

### 3.1  Google Sheet configuration

* Open Google Sheets and make a the Spreadsheet 'public'. More info [here][link_01]
* Copy/paste the URL link into config.json, in the field called 'public_spreadsheet'


### 3.2 PATTRN Web app
[...]
* Copy/paste the URL of the Google Apps script into config.json, in the field called 'editable_spreadsheet'.



### 3.3 PATTRN Platform (front-end visualisation)
* Clone the repo or download the code from GitHub;
* Optional: add a basemap by editing the field 'base_layer_01' in config.json.


* Using the terminal, navigate to the folder where index.html lives and run a Python server:
```python -m SimpleHTTPServer```
* Open your browser at http://localhost:8000/.



## 4. Contributing
PATTRN is a young project. Help us make it grow!

As for most open source projects, there are many ways you can contribute to PATTRN, such as:
* writing code and developing the software
* requesting features
* reporting bugs
* writing developer and end-user documentation

As we have just launched the project, please bear with us while we develop a extensive Documentation and Contribution Guidelines.

In the meantime, please write us to support@pattrn.co for contributions, questions, suggestions, ideas, advices, encouragements, or just to say hi.




[link_01]:https://support.google.com/drive/answer/2494822?hl=en
