# PATTRN

</br>
### Data-driven, participatory fact mapping for:
### * conflict monitoring
### * investigative journalism
### * human rights
### * citizen science
### * research and analysis
</br>
### Free & open source. [pattrn.co](http://pattrn.co)
</br>
* * *    
</br>
## FULL DOCUMENTATION
Note: This documentation is also available for download in PDF format <a href="http://pattrn.co/wp-content/uploads/2016/01/PATTRN-Complete-Doc-final.pdf">here</a>.
</br>
### Table of Content    
</br>
### 1. About PATTRN

1.1 What is PATTRN?

1.2 How does PATTRN work?

1.3 Why PATTRN?

1.4 Credits & Authors
</br>
### 2. How to set up a PATTRN Platform 

2.1 Pre-requisites

2.2 Setting up the PATTRN Editor

2.3 Setting up the PATTRN Platform
</br>
### 3. How to format your data for use with PATTRN 

3.1 Principles of PATTRN data structure

3.2 Two ways of editing data

3.3 Customising your data structure

3.4 Photos, Videos, Web Links

3.5 Automatically populated fields

3.6 Required fields

3.7 Data Formatting Reference

3.8 Data limits
</br>
### 4. How to use the PATTRN Platform 

4.1 Introduction

4.2 Navigation Area

4.3 Event Details Area

4.4 Chart & Filter Area

4.5 Sharing a Platform

4.6 Submitting New Data and Edits
</br>
### 5. How to use the PATTRN Editor 

5.1 Editing Tab

5.2 Review of Contributions Tab

5.3 Collaboration among multiple Editors
</br>
### 6. Privacy, security, anonymity 

6.1 Note about privacy, security, and anonymity

6.2 Anonymous contributions
</br>
### 7. Contributing to the development of PATTRN 

7.1 Introduction

7.2 Writing code

7.3 Raising issues

7.4 Writing/Editing the Documentation

7.5 Sharing ideas and spreading the word

7.6 Financial support

7.7 Governance
</br>
### 8. Troubleshooting  

8.1 The PATTRN Platform won't load any data
</br>
### 9. Getting Help

9.1 Mailing List/Forum

9.2 Drop us an email or a Tweet

</br>
* * * 
</br>
</br>
</br>

#1. About PATTRN
</br>
###1.1 What is PATTRN?

**PATTRN** is a tool to map complex events – such as conflicts, protests, or crises – as they unfold.

Working as an  **aggregator of data**  in different media formats as well as an advanced  **data visualisation**  platform, PATTRN enables its community of users to share and collate first-hand reports of events on the ground and to **make sense** of diffused fragments of information.

Its principle is simple: everything that happens does so at a given place and time. The tool enables its users to build a  **dataset of events**  with space and time coordinates, and to add  **tags** ,  **media** , and  **content**  to these events. Anyone can contribute data, anonymously.

The database can then be explored through an online **visualisation platform** : while a map provides access to the  **details**  of each event, interactive charts and filters enable to reveal **patterns** across the data. Together, users of PATTRN can thereby create the **big picture**  of an ongoing situation.

Designed to be used in the fields of **conflict monitoring** , **human rights** , **investigative journalism** , **citizen science** , and **research** at large, PATTRN responds to new ways of reporting from the front in the digital age.

</br>

###1.2 How does PATTRN work?

</br>

####1.2.1 Components

The current prototype version of PATTRN comprises of:

1) A frontend visualisation platform (the **PATTRN Platform** ) combining several JavaScript libraries – which pulls and visualises data from ....

2) ...a **dataset**** of events** hosted on Google Sheets and in sync with the PATTRN platform. The dataset can be edited either directly in Google Sheets, or through...

3) ... a data editing WebApp (the **PATTRN Editor** ), built on Google Apps Script, which facilitates the process of entering and editing data.

</br>

####1.2.2 Editors/Observers

Individuals or organisations that start a PATTRN Platform are called **Editors**.

Editors can:

- Edit the settings of the PATTRN Platform

- Access the PATTRN Editor linked to the PATTRN Platform

- Review, verify, and publish external contributions of data on the PATTRN Platform

General online users of the PATTRN Platform are called **Observers**. In addition to exploring the data available on the PATTRN Platform, Observers can participate to the research by contributing new data. A dedicated interface, accessible from the PATTRN Platform, enables Observers to either **add a new event** or **edit an existing event** (see 4.6 Submitting New Data and Edits).

</br>

###1.3 Why PATTRN?

We are witnessing a revolution in the way people access information about events.

With the global spread of digital connectivity, conflicts, protests, or crises around the world are increasingly reported by the very people that experience them first-hand. However, it is more and more challenging **to make sense of the mass of data** created, to piece together seemingly disparate events, and to distinguish between facts and rumours.

The PATTRN project set out to respond to the challenges and opportunities of this new media landscape.

PATTRN is primarily developed as a tool to support research and information around armed conflicts, human rights violations, or social and environmental crises. In addition to working as a crisis-mapping tool, PATTRN integrates powerful analytics that allow for temporal and spatial trends, or **patterns** , to be revealed across large datasets.

</br>

###1.4 Credits & Authors

PATTRN is an open source project hosted at  [Goldsmiths, University of London](http://www.gold.ac.uk/).

It originates in the work of  [Forensic Architecture](http://www.forensic-architecture.org/), a research consultancy undertaking spatial and media analysis for the investigation of human rights violations.

The PATTRN pwas initiated thanks to a Proof-of-Concept Grant from the [European Research Council](https://erc.europa.eu/), awarded to Prof. Eyal Weizman, in the framework of Forensic Architecture (2015-2015).

Project Architect: [FSBRG](https://twitter.com/fsbrg) (Francesco Sebregondi)

Major Contributing Authors
[TEKJA Data](http://tekja.com/) (PATTRN Platform)

[Digital Consolidation](http://www.digital-consolidation.co.uk/)  (PATTRN Editor)

_Note: All new contributors to the PATTRN project will be duly credited._

</br>
</br>
</br>

#2. How to set up a PATTRN Platform

</br>

###2.1 Pre-requisites

All you will need to set up your own PATTRN Platform is:

- one Google Account with Google Drive
- basic knowledge of Google Sheets
- some web hosting space
- basic knowledge of how to put a website online

Below is a **step-by-step guide** to set up a PATTRN Platform. All in all, the process should not take longer than 20 min.

</br>

###2.2 Setting up the PATTRN Editor

</br>

####2.2.1 Copying the PATTRN Editor files to your Google Drive

Log in to the Google account you will use with PATTRN. Make sure you have activated [Google Drive](http://google.com/drive) for this account.

Access the **PATTRN Editor files** by clicking on [this link](https://drive.google.com/folderview?id=0BwR9PFzDne86dU1qRWpxY3pacUU&usp=sharing).

Click on the file named PATTRN\_Admin, then click on the "Pop-Out" icon in the top right corner of the viewer to open the file in Google Sheets. Once it is open, go to "File" > "Make a copy". Rename the copy "PATTRN\_Admin" (remove "Copy of") and click OK. A copy of this document, of which you are now the owner, is added to your Google Drive.

Do the same operation for the four other spreadsheet files in the PATTRN folder (PATTRN\_Admin\_Password, PATTRN\_Audit, PATTRN\_Master, PATTRN\_WIP), so as to copy them all to your drive.

Finally, in the PATTRN folder, click on the PATTRN\_Editor\_Script file, then click on the "Pop-Out" icon in the top right corner of the viewer to open the file in Google Apps Script. Similarly, go to "File" > "Make a copy" (Note that it may take a few seconds to load the copy of the script). Rename the copied script as "PATTRN\_Editor" (remove "Copy of").

Now, all the PATTRN Editor files have been copied into in the root folder of your Google Drive.

</br>

####2.2.2 Inputting the IDKeys

Go to your Google Drive

Open the PATTRN\_Master spreadsheet.

Copy the IDKey of the Spreadsheet. The IDKey is to be found in the URL of the spreadsheet displayed in your browser. For example:

https://docs.google.com/spreadsheets/d/**1tn6K498HPon80F57QDBGHUz6K3tA-AN2zWT\_g0ruaqY**/edit#gid=1782249319

In the example above the IDKey is the part in bold, in between two "/" in the URL.

Open the PATTRN\_Admin Spreadsheet in your Google Drive

Go to the "Keys" sheet (tab at the bottom). Paste the IDKey of the PATTTN\_Master spreadsheet in the corresponding cell.

Repeat this operation for the PATTRN\_WIP, PATTRN\_Admin\_Password, and PATTRN\_Audit spreadsheets, so as to input their IDKeys in the "Keys" sheet of the PATTRN\_Admin spreadsheet.

Next, go to your Google Drive, create a new folder, and name it  "PATTRN\_Photos". Double click the folder to open it.

In the address bar of your browser, copy the IDKey of this folder. The IDKey is the last part of the URL displayed. For example:

https://drive.google.com/drive/folders/**0BwR9PFzDne86TTIwZFFSUmpocW8**

In this example above, the IDKey of the folder is the part in bold.

Paste the IDKey of the PATTRN\_Photos folder in the corresponding cell, in the "Keys" tab of the PATTRN\_Admin spreadsheet.

Finally, get the IDkey of the PATTRN\_Admin spreadsheet, copy it, and keep it in your clipboard.

</br>

####2.2.3 Synchronising the script with the spreadsheets

In your Google Drive, double-click the PATTRN\_Editor\_Script. Google Drive will suggest to open it with a third-party app. Select Google Apps Script. The script will open on Google Apps Script.

In code.gs (tab active by default in the left column), on line 9, Replace "InputKey" by pasting the IDKey of PATTRN\_Admin. Remember to keep the single quotation marks around your IDKey. You should obtain a line looking like:

userProperties.setProperty('Admin','**1v673QgP3li69umab5x0\_e7krurJB0pYZLeyrreYiUnw**');

With the part in bold corresponding to the actual IDKey of your PATTRN\_Admin spreadsheet.

In Google Apps Script, go to "Run" > "Set\_Script \_Properties"

The application will run the function "Set\_Script\_Properties"

You will get a message warning that an Authorization is required. Click "Continue", then click "Allow".

Next, Go to "Run" > "Load\_keys\_from\_admin"

The application will run the function "Load\_keys\_from\_admin"

Once you have run both functions run, go back to line 9 in Code.gs, and **delete the IDKey** of your PATTRN\_Admin spreadsheet by reverting back to "InputKey". At the end of the process, line 9 should look again like:

userProperties.setProperty('Admin', 'InputKey');

_**Warning: This is an important security measure**. It is to prevent anyone from getting the ID key of your PATTRN\_Admin spreadsheet while the script is deployed on the web – from which one could then access the files, usernames, and passwords you are using with PATTRN. Remember to delete your IDKey and replace it by "InputKey"!_

Go to "File" > "Save".

You have now synchronised the PATTRN Editor script with all your PATTRN spreadsheets.

</br>

####2.2.4 Publishing the script and the Master spreadsheet

In Google Apps Script, with the PATTRN\_Editor\_Script still open, go to "Publish" > "Deploy as web app..."

In the parameters, select:

- Execute the app as: **Me**

- Who has access to the app: **Anyone, even anonymous**

Click "Deploy"

A message appears to confirm that the project is deployed as a web app, and the URL of the web app is displayed. Copy this URL.

In your Google Drive, open the PATTRN\_Admin spreadsheet.

Paste the URL of the script in cell A2.

Finally, open the PATTRN\_Master spreadsheet.

Go to "File" > "Publish to the web"

In the menu that appears, keep the default settings to publish the "Entire Document" as a "Web Page".

Click "Publish"

The PATTRN\_Master spreadsheet is now published to the web.

</br>

####2.2.5 PATTRN Editor Settings

Open the PATTRN\_Admin spreadsheet in your Google Drive.

You can adjust the settings of the Editor here. Those include:

- the country ISO code to be used for automatic geo-location of street addresses

- the GPS precision: the number of decimals used in the latitude and longitude coordinates

- the starting latitude and longitude of the pin that will be displayed on the PATTRN Editor's map (when entering locational information by dropping a pin on the map)

- the minimum and maximum values allowed for latitude and longitude

- the default zoom of the map

- the name of the Platform that will be displayed in the Editor

- The Last\_ID: this corresponds to the number that the PATTRN Editor will use to generate incremental numbers and populate the unique\_event\_IDs field of all new events. By default, it is set as 1001, so that all new events will have a four-digits ID like 1001, 1002, 1003... You can chose another format for your Event ID by inputting a different number in the Last\_ID field.

_**Warning:** Be sure to set up the Last\_ID field **once and for all** when you start your PATTRN Platform. This field will be automatically updated as you use the PATTRN Editor, with the last Event ID created replacing the value in the Last\_ID field. Changing the value in the Last\_ID field will mess the incremental process of creation of unique Event IDs, and could result in the creation of events with the same Event ID, or inconsistent Event IDs._

</br>

####2.2.6 Creation of usernames and passwords for Editors

Open the PATTRN\_Admin\_Password spreadsheet in your Google Drive.

Here you can create usernames and passwords for the Editors that will have access to the PATTRN Editor of your Platform.

You can use any combination of **letters and numbers** for both usernames and passwords.

No **symbols**, **punctuation signs**, or **special characters** are allowed for passwords.

Usernames and passwords are case sensitive.

There is no minimum length of usernames and passwords. Nonetheless, for security reasons, it is recommended that you use strong and unique passwords for all Editors (8+ characters).

_Note: For security reasons, make sure to keep the PATTRN\_Admin\_Password spreadsheet **private** in your Google Drive (not shared nor published on the web)._

**You have now finished setting up the PATTRN Editor.**

</br>
</br>

###2.3 Setting up the PATTRN Platform

####2.3.1 Downloading the PATTRN Platform files

Open the [PATTRN GitHub repository](https://github.com/pattrn-project/pattrn) in your browser.

In the top right corner of the page, click on "Download ZIP". The "pattrn-master.zip" file will be downloaded to your default download folder.

Un-archive the "pattrn-master.zip" file, and open the "pattrn-master" folder.

</br>

####2.3.2 Configuring the PATTRN Platform**

Go to your Google Drive, and open the PATTRN\_Master spreadsheet.

Go to "File" > "Publish to the web..."

Copy the URL of the published PATTRN\_Master spreadsheet

In the "pattrn-master" folder, go to the "js" folder, open the "config.json" file.

_**Warning:** JSON files need straight quotation marks to work; they wont work with curly ones. Make sure the text editing application does NOT automatically replace straight quotation marks with curly ones. This is the case with Apple's TextEdit as used by defaut. In this case, before editing the config.json file with TextEdit, it is recommended to Go to TextEdit > Preferences, and untick "smart quotes", smart dashes" and "Text replacement". Whatever your OS and your text editing application, double-check that all quotation marks in the JSON file are straight ones!_

In the "config.json" file, paste the URL of the published PATTRN\_Master spreadsheet (still in your cilpboard) in the "public\_spreadsheet" field.

You should obtain a line looking like:

"public\_spreadsheet":" **https://docs.google.com/spreadsheets/d/1ajKCXgSyTvUC3rYGaFVYp54588lYC8kPMBd4h9YTWhg/pubhtml**",

with the part in bold corresponding to the actual URL of your PATTRN\_Master spreadsheet.

Next, return to your Google Drive, and open the PATTRN\_Admin spreadsheet.

Copy the URL displayed in cell A6 (script\_url\_for\_platform\_config)

In the "config.json" file, paste it in the "script\_url" field.

You should obtain a line looking like:

"script\_url":" **https://script.google.com/macros/s/AKfycbygvVCS3pzWL9WaGbTQ486AyKY0eS8o0h-EQgIDeI6Hzb58i6hA/exec?par=**" **,**

with the part in bold corresponding to the actual URL of your PATTRN\_Editor\_Script, as displayed in cell A6 of your PATTRN\_Admin spreadsheet.

Save your "config.json" file.

</br>

####2.3.4 Configuring the baselayers of the map

By editing the "config.json" file, you can also add a series of baselayers to the map in your PATTRN Platform. Below a few examples.

**Open Street Map:**

"name"="Open Street Map"

"URL"="http://{s}.tile.osm.org/{z}/{x}/{y}.png"

**Stamen:**

"name"="Stamen"

"URL"="http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png"

**Satellite** (example of MapBox):

"name"="Satellite"

"URL"="https://{s}.tiles.mapbox.com/v4/**{mapid}**/{z}/{x}/{y}.png?access_token=**<your access token>**"

with **{mapid}** replaced by the Map ID you will have selected from the [MapBox Maps API page](https://www.mapbox.com/developers/api/maps/) (for example: mapbox.satellite) and **<your access token>** replaced by your actual "Default Access Token" that you will find in "Studio" > "Account" > "API access tokens"
You should end up with a URL looking like:
"URL"="https://{s}.tiles.mapbox.com/v4/**mapbox.satellite**/{z}/{x}/{y}.png?access_token=**pk.eyJ1IjoiZnJhbmFzZWJyZSIsImEiOiJjaWoycG05emswMDBid2JsenducjJz M3hiIn0.v9cylsLP5rOr87jh66UNTw**"
with the parts in bold replaced by your personal ones.

Save and close the "config.json" file

</br>

####2.3.5 [Optional] Add sharing buttons to your PATTRN Platform

In order to display sharing buttons from the "SHARE" link to be found in the Header of the PATTRN Platform, you will need to use an [AddThis](http://addthis.com) account (free).

Sign up for an AddThis account or log in to your existing one.

Go to "Tools" and select "Sharing Buttons". Configure the Sharing Buttons as you see fit, then click Activate. Copy the code displayed in the "Basic Code" section.

In the "pattrn-master" folder, open the "index.html" file with an HTML editor application (you can download free HTML Editors easily online if you don't have one installed on your computer).

On line 531 of the "index.html" file, paste the Add This code you copied. The complete script should look like this:

<!-- Optional - Addthis code to be added here (it will populate the 'Share' button) -->

**<script type="text/javascript"**
**src="http://s7.addthis.com/js/300/addthis\_widget.js#pubid=ra-55af788b2148ea27"<http://s7.addthis.com/js/300/addthis\_widget.js#pubid=ra-55af788b2148ea27>**
**async="async"></script>**

</body>

With the part in bold to be replaced with the actual code you will get from your AddThis dashboard.

Save and close the "index.html" file.

</br>

####2.3.6 Upload the PATTRN Platform files to your web server

Connect to your web server using your FTP application.

Enter the user name and password and server information provided by your web host. If you are uncertain about this information, contact your web host.

Upload the following folders and files from your "pattrn-master" local folder to your web server:

- the "css" folder

- the "images" folder

- the "js" folder

- the "index.html" file

Once uploaded, your PATTRN Platform will be accessible at the URL of your website.

**Your PATTRN Platform is now all set up and ready to visualise your data.**

_Note: By default, if the Master spreadsheet has not been edited, the PATTRN Platform should load with one dummy event located in London. If it doesn't load properly, please see the Section 9. Troubleshooting_

</br>

####2.3.7 PATTRN Platform Settings

Open the PATTRN\_Master spreadsheet in your Google Drive, and go to the **Settings** sheet (second tab at the bottom left).

By editing the content of the cells in this tab, you can:

- enter a **Title** for your PATTRN Platform

- enter a **Subtitle** for your PATTRN Platform

- choose a **Contrast Colour** that will customise the appearance of your PATTRN Platform. Note: a link to an online html colour picker will be displayed as a comment to this cell.

- Edit the **About** section of your PATTRN Platform, which will inform the users about the project and scope of the Platform.

_Note: In the About section, you can use html language for advanced formatting._

</br>

####2.3.8 [Optional] Run your PATTRN Platform locally on your computer**

If you want to test your PATTRN Platform before publishing it online, you can do so by running it locally on your computer.

Using the Terminal, navigate to the folder where "index.html" lives

Run a Python server by entering the following command line:

python -m SimpleHTTPServer

If prompted, click "Allow" the Python application to accept incoming network connections.

Open your browser at http://localhost:8000/.

Your PATTRN Platform will load in your browser.

_Note: you will still require an Internet connection, as the data will still be loaded from the PATTRN\_Master spreadsheet online._

</br>
</br>
</br>

#3. How to format your data for use with PATTRN

</br>

###3.1 Principles of PATTRN Data structure

PATTRN works with datasets of **events**.

An event is defined as row of data that contains a **date/time** information, as well as a set of **geographical coordinates**. The details about each event are expressed as a series of **attributes** in the row of data.

The PATTRN\_Master spreadsheet is where the data visualised in the PATTRN Platform is stored. It is pre-formatted with the data template in use with PATTRN.

</br>

###3.2 Two ways of editing data

It is recommended to use the **PATTRN Editor** to enter and edit data on the PATTRN\_Master spreadsheet, as it is designed to output data in the correct format and thereby to avoid display issues or glitches in the PATTRN Platform.

However, you can also **enter and edit data directly on the Master spreadsheet** , using Google Sheets. For example, if you want to visualise an existing dataset of events, you can copy and paste the available data in the PATTRN\_Master spreadsheet. Make sure to format it correctly, by always referring to the "Data Formatting Reference" sheet in the PATTRN\_Master spreadsheet.

</br>

###3.3 Customising your data structure

For any event in the dataset in use with PATTRN, the following are the **fixed fields** – the headers of which must not be modified in the PATTRN\_Master spreadsheet:

- unique\_event\_ID

- location\_name

- latitude

- longitude

- geo-accuracy

- date\_time

- event\_summary

- source\_name

In addition, the data structure of the dataset to be used with PATTRN can be customised by adding up to **5 fields of numeric data**, up to **5 fields of data tags** , and up to **5 fields of boolean data (Yes/No)**.

You can create these custom columns of data either inside the PATTRN Editor, or by manually renaming the header of one of the column comprised between "I" and "W" in the PATTRN\_Master spreadsheet.

</br>

###3.4 Photos, Videos, Web Links

Using the PATTRN Editor, you can attach **Photos** , **Videos** , and **Web Links** to each event.

All the **Photos** uploaded to your PATTRN Platform will be stored in the PATTRN\_Photos folder you have created in your Google Drive.

**Videos** related to an event can be embedded in the PATTRN Platform. The PATTRN Editor integrates an interface to embed videos from YouTube. Note that the current version of PATTRN does not support the upload of actual video files: videos must first be uploaded to YouTube in order to be embedded in a PATTRN Platform.

The PATTRN Editor also integrates an interface to attach **Web Links** to an event. Those links can point to web pages, or to PDF files online (such as a full version of a report by an NGO, for example).

When an Editor uses the PATTRN Editor to attach a Photo, Video, or Link to an event, the PATTRN Editor populates the corresponding fields in the Master spreadsheet with a JSON object (contained within the { } characters), which contains all the information needed for the PATTRN Platform to display the content correctly, together with its related information.

</br>

###3.5 Automatically populated fields

When using the PATTRN Editor, certain fields in the PATTRN\_Master spreadsheet will be automatically populated. Those fields are:

- unique\_event\_ID: assigns a unique Event ID to all new Events.

- geoaccuracy: provides an indication of the accuracy of the geolocation result, on the basis of the textual locational information inputted in the Location field.

- media\_available: populated with a series of tags corresponding to the types of media that have been attached to each event.

</br>

###3.6 Required fields

In order for the PATTRN Platform to successfully load and display data from the PATTRN\_Master spreadsheet, all rows that are not completely empty need to have correctly formatted data in at least three key fields. Those fields are:

- latitude

- longitude

- date\_time

**Warning** : if a **single row** in a large dataset lacks data, or contains data that is wrongly formatted, in one of these three fields, **the PATTRN Platform won't load any data**. For this reason, it is recommended to use the PATTRN Editor. When it is necessary to edit directly into the PATTRN\_Master spreadsheet, Editors need to be very careful with the formatting of data in these three key fields in particular. Data validation custom formulas have been integrated in the PATTRN\_Master spreadsheet, in order to facilitate the identification of any wrongly formatted row. (See 9. Troubleshooting).

</br>

###3.7 Data Formatting Reference

The PATTRN\_Master spreadsheet contains a sheet named " **Data Formatting Reference**" (third tab at the bottom of the spreadsheet).

This sheet features a row corresponding to a dummy event, every field of which holds data that is correctly formatted for use with PATTRN.

Do always consult this sheet when entering data directly into the PATTRN\_Master spreadsheet.

</br>

###3.8 Data limits

####3.8.1 Indicative maximum number of events in a Dataset

The PATTRN Platform and PATTRN Editor have been tested to work with a dataset of 2,000 events, with every event containing data in the 15 different custom data fields as well as photos, videos and links.

Above this volume of data in the dataset, it is possible that the PATTRN Platform and/or the PATTRN Editor will be less responsive, or even crash.

Nevertheless, the PATTRN Platform and the PATTRN Editor have also passed the performance test with larger datasets in terms of number of events (15,000 +), but with lesser amounts of data per event.

_Note: In order to deliver a dynamic interactive experience, the PATTRN Platform needs to load all the data contained in the PATTRN\_Master spreadsheet, at once, when the Platform is accessed online. For this reason, if you're using PATTRN with a large dataset, **it may take up to 30 seconds for the PATTRN Platform to load** all the data in the first instance. Please be patient._

</br>

####3.8.2 Concerning tags

For each column of tag data entered in the dataset, a Bar Chart will be automatically generated by the PATTRN Platform.

For these Bar Charts to display correctly, it is recommended to use:

**- no more than 12 different tags** per column of tag data.

**- tags no longer than 24 characters each**

_Note: this applies to the "source\_name" column as well._

</br>
</br>
</br>

#4. How to use the PATTRN Platform

</br>

###4.1 Introduction

The PATTRN Platform is an **interactive data dashboard** enabling its users to explore, visualise, and query the dataset of events hosted in the PATTRN\_Master spreadsheet (See 2. How to set up a PATTRN Platform).

Its interface allows users to move across scales of analysis: it gives access to the **granular details** of each singular event, and helps revealing **patterns** across diffuse data.

Below are a few instructions as to how to use and make the most of the PATTRN Platform.

_Note: The recommended browser to use the PATTRN Platform is [Chrome](https://www.google.com/chrome/)._

</br>

###4.2 Navigation area

The main area, in the form of a map, is the navigation area. You can zoom in and out by using the + / - buttons, and change the base layer to display a choice of digital basemaps (see 2.3.5 Configuring the baselayers of your map)

On the map, the black circles containing figures are **clusters of events.** The figure corresponds to the number of events registered in that location. Clicking on these black circles zooms into the cluster and decomposes it into smaller clusters or **individual events** (black dots with no figure inside).

Each individual event can be clicked in order to access all the **details** about it.

When several events have the exact same coordinates, a **spiral** of black circles will appear around the center point, allowing users to select each event separately.

</br>

###4.3 Events Details

On the right side of the Platform you will find a column titled **Event Details**.

When an event is clicked (black dot turning into the selected contrast colour)(see2.3.7 PATTRN Platform Settings), all the available data about this event is accessible in this column, which is organised by tabs.

The first tab is the **Summary** tab: it displays the available textual report for the selected event.

At the bottom, a summary table lists the key data about the event.

The other tabs – **Photos** , **Videos** , **Links** – provide access to all other available media and content pertaining to this event.

</br>

###4.4 Charts & Filters Area

####4.4.1 General information about the interactive charts

In the lower part of the Platform, you will find a series of advanced charting and filtering tools.

In the top left corner of this area, you will find the **Chart Menu** , where you can select the chart to be displayed. Users can plot data **over time** , visualise it **by type,** by **Yes/No** questions, or display **counts over area**.

All the charts are **interactive** : they enable users not only to **visualise** data, but also to **filter** it according to certain criteria. By **combining filters** , users can quickly navigate a large dataset, **reveal patterns across the data** , and make sense of complex situations.

The **map** itself works as a **filtering device**. Only the events contained in the frame of the map are visualised and accounted for in the Chart & Filter area. This means that, if users want to focus on the events that took place in a particular area, they can zoom and center the map around that area: only the data pertaining to events in that area will be charted in the Chart & Filter area.

On the right side of the **Chart Menu** , users can read the **number of events** contained in the specific frame of the map.

</br>

####4.4.2 Charting and filtering over time**

Selecting a chart **over time** displays a Time Chart, whose timespan corresponds to that between the oldest and the most recent event in the Platform's dataset.

Different Time Charts are available. By default, all Platforms will feature a chart of the number of events over time.

In addition, for each column of numeric data entered in the dataset, a time chart will be **automatically generated** by the PATTRN Platform, which will plot that specific variable over time.

By **clicking and dragging** a window across a Time Chart, users can select a specific period of time as a filter. When users click and drag a window of time in a Time Chart, all the events that did not take place during that specific window of time will be filtered out of the map. This feature enables users to focus on any specific period of time.

</br>

####4.4.3 Charting and filtering by type

Selecting a chart **by type** displays a Bar Chart: each bar corresponds to a given tag, and its height corresponds to the number of events that have been assigned this tag.

For each column of tag data entered in the dataset, a Bar Chart will be **automatically generated** by the PATTRN Platform, which will chart the distribution of tags in that column across all events visible in the active map frame.

By **clicking on a bar** in a Bar Chart, users can select a specific tag as a filter. When a bar is clicked, all the events that have not been assigned the corresponding tag will be filtered out of the map. This feature enables users to focus on specific characteristics of the events in the dataset.

</br>

####4.4.4 Charting and filtering by Yes/No questions

Similar to filtering by type, selecting a chart **by Yes/No questions** displays a Yes/No Bar Chart: each bar corresponds to one of the three possible answers (Yes, No, Unknown) to the selected question, and its height corresponds to the number of events that match this answer.

For each column of Yes/No data entered in the dataset, a Yes/No Bar Chart will be **automatically generated** by the PATTRN Platform, which will chart the distribution of values in that column across all events visible in the active map frame.

By **clicking on a bar** in a Yes/No Bar Chart, users can select a specific answer as a filter. When a bar is clicked, all the events that don't match that answer will be filtered out of the map. This feature enables users to quickly isolate events in the dataset that fall into a given category.

</br>

####4.4.5 Charting and filtering by counts over area

Selecting the **counts over area** chart displays a series of figures: each figure is the aggregate sum of the numeric values in a given column of the dataset for all the events that are located in the active map frame. For example, if the Platform's dataset contains a numeric data column for "casualties", the **counts over area** chart will display a figure corresponding to the total number of casualties resulting from the events that are visible on the map.

The PATTRN Platform regroups the aggregate sums of all available numeric data columns in the dataset into a single **counts over area** chart. If the dataset contains only two column of numeric data, the counts over area chart will display only two figures. If the dataset contains five columns of numeric data (maximum in current prototype version), the counts over area chart will display five figures.

Under each of these figures, a small **dragging area** enables users to filter events by range of numeric values attached to each individual event. For example, if the Platform's dataset contains a numeric data column for "casualties", users can quickly isolate the most deadly events in the dataset by dragging a window between "10" and the maximum value: only the events that caused 10 or more casualties will be displayed.

</br>

####4.4.6 Checking/Resetting filters

When a filter is on, the **Funnel icon** located top right of the Chart & Filter area turns black. Users can thereby quickly check whether they are looking at the whole dataset, or at a filtered fraction of it.

To reset all filters and reload the page, click on the **Reload icon** located top right of the Chart & Filter area.

</br>

####4.4.7 Search field

The search field enables users to undertake **dynamic keyword searches** across the entire dataset. As soon as a few characters are typed in the search field, all events that do not contain this specific string of characters anywhere in their row of data are filtered out of the map.

</br>

###4.5 Sharing a Platform

_Note: Only available if the Sharing Buttons have been set up. See 2.3.5 [Optional] Add sharing buttons to your PATTRN Platform._

Whether you are an Editor or an Observer, you can easily share a link to the Platform on social media channels, by using the integrated sharing tools.

On the header of the PATTRN Platform, click on **SHARE**. A range of familiar icons appear that will facilitate the process of sharing a link to the Platform on your Twitter, Facebook, or Google Plus account, etc...

</br>

###4.6 Submitting New Data and Edits

The PATTRN Platform enables Observers not only to explore the data available on the Platform, but also to **contribute new data for review by Editors** of the Platform.

To do so, Observers can click on the Edit/Add Event link top right of the Event Details column. They can then chose between **Add a new Event** or, if an event was pre-selected, **Edit this Event.**

Clicking on **Add a new Event** opens up an interface similar to that of the PATTRN Editor, through which Observers can enter data about the event they intend to report.

Once the data is entered – which can include photos, embedded videos, or links –Observers can submit the new event.

**Edit this Event** opens up a similar interface, by which the Observer can edit the data already available about an event – both adding data and correcting the information currently displayed on the Platform – and submit the edits.

In both cases, by default, **the submission process is anonymous** , but Observers can choose to leave their contact, should they accept to be contacted by Editors who would wish to contact the source of the data contributed.

**Warning:** _for details about this feature, see_ _6. Privacy, security, anonymity__._

</br>
</br>
</br>

#5. How to use the PATTRN Editor

</br>

###5.1 Accessing the PATTRN Editor

In order to access the PATTRN Editor, open the PATTRN\_Admin spreadsheet in your Google Drive.

If you have followed the process detailed in 2.2 Setting up the PATTRN Editor,you should have already copied the URL of the PATTRN Editor Script in the cell A2 of the PATTRN\_Admin spreadsheet.

To access the PATTRN Editor as an Editor, open the link to be found in cell A4, under **script\_url\_as\_editor.**

You can bookmark this URL for quicker access.

Once the URL is open in your browser, a login page will be displayed. Enter your Editor **username** and **password**. You can find – or create – your username and password in the PATTRN\_Admin\_Password spreadsheet (see 2.2.6 Creation of usernames and passwords for Editors)

_Note: The recommended browser to use the PATTRN Editor is [Chrome](https://www.google.com/chrome/)._

</br>

###5.2 Editing Tab

####5.2.1 Main Table view

Once you are logged in as an Editor, the first tab that will be displayed by default is the Editing Tab.

At the centre of your screen is a table. This table mirrors the table in the PATTRN\_Master spreadsheet.

**Any edits to the data entered via the PATTRN Editor will be reflected on the PATTRN\_Master spreadsheet, and conversely**.

The top part of the page will display:

- the title of your PATTRN Platform, as inputted in the spreadsheet PATTRN\_Admin

- the number of events currently in the PATTRN\_Master dataset

- a Live Event Search field, to access specific events via keywords. Note: you will need to press Enter after inputting the keywords for the search function to be launched.

- a "Refresh" button, which calls for a refresh of the entire table.

</br>

####5.2.2 Create / Delete columns

In order to customise your data structure, you can **create new columns** in your dataset. Specifically, you can create:

- up to 5 new columns of **numeric data**

- up to 5 new columns of **data tags**

- up to 5 new columns of **Boolean data** (Yes/No)

To create a new column of data, click on the "Create" button in the top right corner of the Main Table view. Select the type of data the column will contain, and name the column. Note: you can only use lowercase and "\_" (underscore) as a divider, no space, no symbols, no uppercase allowed.

To delete a column of data, click on the "Delete" button in the top right corner of the Main Table view. Select the name of the column you want to delete, click Delete. Note: there is no going back once it is deleted, hence the two warning messages that require your OK.

</br>

####5.2.3 Display of Events: by clusters, or all events

In the top left corner of the Main Table View, you will find a series of blue buttons, such as "1-500" or "All".

In order to improve the responsiveness and performances of the PATTRN Editor, by default the Main Table View will only load the first 500 events of a dataset. Depending on the volume of your dataset, a series of blue buttons will be displayed, that enable you to breakdown you entire dataset into cluster of 500 events, such as "1-500", "501-1000", "1001-1500", etc...

Click on "All" to load all your events at once in the Main Table View. Note that if you have a dataset of 2000+ events, and with each event containing large volumes of data, the PATTRN Editor may be slow to respond and could even crash, as it will have reached the limit of its processing capacity.

</br>

####5.2.4 Add or Edit an event

To add an event to the dataset, click on the " **Add New Event**" button at the bottom left corner of the Main Table View.

To edit an existing event, **double click the row** of the event in the Main Table.

Both functions open the **Event Editing interface**.

Using the Event Editing interface will enable you to enter data about the events you are logging in the dataset of the PATTRN Platform in a **user-friendly** way, that will **automatically populate the PATTRN\_Master spreadsheet with data that is correctly formatted for the PATTRN Platform.**

The Event Editing interface is designed to be self-intuitive. If you have questions about its functioning and how to enter data, please see 10. Getting Help

</br>

###5.3 Review of Contributions Tab

####5.3.1 New contributions

_NOTE: This function is still at **testing** phase of development. Please do send us feedback about any issues you run into, or improvements you would suggest._

When Observers of your PATTRN Platform **contribute new data** through the dedicated link in the PATTRN Platform (see 4.5 Submitting new Data), Editors can review the contributions through the Review of Contribution Tab in the PATTRN Editor.

As Editors log in, if there are new contributions, the PATTRN Editor will launch on the Review of Contributions Tab by default.

Select the contribution you would like to review and click "Review"

</br>

####5.3.2 Review of new event contribution

If the contribution was submitted by an Observer as a new event, clicking on "review" will directly open the Editing Interface, with the data submitted by the Observer pre-loaded in the interface. Editors should carefully review this data. They can edit any field so as to correct any data after research and verification about the contributed event. Once reviewed and verified, the Editor can click on the "Save" button at the top of the page to include the contributed event in the main dataset of the PATTRN Platform.

</br>

####5.3.3 Review of edited event contribution

If the contribution was submitted by an Observer as an edited event, clicking on "Review" will open an interface that displays the edits suggested by the Observer to the data originally attached to an event in the dataset.

Editors can accept or reject each edit, by clicking on the corresponding button in a cursor with two positions. By default the Reject button is displayed. Click in the grey area at his right to move the cursor right and let the Accept button appear.

In order to help with the process of verification of the Edits proposed, Editors can also load the data originally attached to the edited event in a new window, by clicking on the blue link next to the Event ID. Note: this is for consultation purposes only.

Once the Editors have selected which Edits they accept and which one they reject, they can load the full data of the now edited event by clicking on the "Load" button in the top left. This step is for a final review of all the data attached to this specific event, merging contribute data and original data, before saving this edited event into the main dataset by clicking "Save". Editors can also make new edits at this step.

</br>

####5.3.4 PATTRN\_Audit spreadsheet

All contributions are logged in the **PATTRN\_Audit** spreadsheet, located in your Google Drive.

In the event of a wrong manipulation during the review process (valuable edits discarded, review of contribution not saved, etc...), go to the PATTRN\_Audit spreadsheet to consult a **log of all changes** to the PATTRN\_Master spreadsheet, included suggested changes via contributions.

Contributions can be accessed in their original form in the PATTRN\_Audit spreadsheet, and if needed, copied and pasted into the PATTRN\_Master spreasheet (after review and confirmation).

The PATTRN\_Audit spreadsheet is also where the **contact details** of contributing Observers can be accessed (if the contribution was not anonymous).

</br>

###5.4 Collaboration among multiple Editors

####5.4.1 Simultaneous work among multiple Editors

The PATTRN Editor can be accessed by multiple Editors at the same time, so as to enable collaborative work on the dame dataset by multiple Editors.

Note: The PATTRN Editor has been tested in conditions of up to five Editors working together simultaneously, without any noticeable issue or loss in performance.

</br>

####5.4.2 Comments

The COMMENTS field at the bottom of the Event Editing Interface is useful to leave notes that won't display on the PATTRN Platform.

_Warning: **Do not input any sensitive or personal data in the COMMENTS field!** As it is contained in the PATTRN\_Master spreadsheet, which is published online, Editors must assume that all data entered in COMMENTS is virtually public – although not displayed in the PATTRN Platform._

</br>

####5.4.3 Drafts

The Event Editing interfaces also enables to save an Event as a Draft, for situations in which all data about an event has not yet been entered. An Editor can then recover the draft, even when the draft was created by another Editor, and resume the data entry process on that draft.

To do so, from the main table view, click on "Add a new Event", then click "Recover draft". If you are another Editor has previously saved an Event as "draft", you will be able to select the draft and load the data already inputted in the draft.

Once you've finished editing the Event, click "Save" to add the event to the main dataset.

</br>
</br>
</br>



#6. Privacy, security, anonymity

</br>

###6.1 Use PATTRN only with public data

PATTRN is a public Platform. In the current version of PATTRN, all data featured in a PATTRN Platform or in a PATTRN\_Master spreadsheet is by definition publicly available online to anyone.

For this reason, **only data safe to be published online must be included in a PATTRN Platform.**

This applies to:

- data entered by Editors directly into the PATTRN\_Master spreadsheet
- data entered by Editors into the PATTRN\_Master spreadsheet via the PATTRN Editor
- data submitted by Observers of a PATTRN Platform to the Editors of the Platform, via the data contribution tool integrated in the PATTRN Platform.

By "data safe to be published online" we mean:

- data that will not put the security of anyone at risk (Editor, Observer, or Third Party referred to directly or indirectly in the content of the data)
- data that does not disclose the identity of anyone (Editor, Observer, or Third Party referred to directly or indirectly in the content of the data) without the explicit consent of the individual(s) concerned.
- data that does not violate any of the Data Protection laws and policies in place in any of the countries where the data is processed (collected, submitted, reviewed, stored, or published)

**The responsibility of the correct and safe use of PATTRN is with its users.**

</br>

###6.2 Anonymous contributions

The PATTRN Platform enables users to contribute data to a given Platform, by means of "anonymous contributions" (see 4.6 Submitting New Data and Edits)

By "anonymous contributions", we mean that the technology used in PATTRN won't track nor store any data about the identity, IP, or location of the individual submitting data to the Editors of a PATTRN Platform. Consequently, the Editors of the PATTRN Platform will not have access, through PATTRN, to any data about the identity, IP, or location of the individual(s) submitting data if such individuals do not leave any contact information in the optional field included in the data submission form.

Nonetheless, it is important to note that:

. The anonymity of such contributions is only as secure as the technology used in PATTRN – in this specific case, Google technology underpinning the transfer of digital information from and to Google Apps. While the choice of this technology for the development of PATTRN was in part motivated by the well-documented stability and security of Google Apps, every technological system has its vulnerabilities. The PATTRN Project **cannot guarantee** that all information about the online identity, IP, or location of an individual submitting data anonymously through PATTRN, is 100% secure against any form of digital attack or surveillance operation.

. Regardless of the specific technology used for the transfer of data through PATTRN: government agencies, Internet Service Providers, or the organisation administrating the network from which an anonymous data submission is performed, are likely to be able to access details about the identity, IP, and location of the individual(s) submitting data.

For this reason: **anonymous contributions of data should not contain any information that, should the identity of the individual submitting this data be disclosed, could put the security of this individual at risk.**

This point is clearly and explicitly included in the **information and consent form** that any individual is required to approve in order to submit data anonymously via PATTRN.

In addition, **it is the responsibility of Editors** reviewing contributions of data to make sure that all data received via anonymous contributions **is safe to be published** before actually publishing it on a PATTRN Platform.

</br>

###6.3 Charter of Use

All users of PATTRN, or of any derivative software containing all or parts of PATTRN's code, must agree to a Charter of Use of the tool.

This is clearly indicated in the "License" file of PATTRN, which contains the actual charter of use.

The text of PATTRN's Charter of Use is reproduced here:

        CHARTER OF USE

        The code of PATTRN is hereby released under a permissive open-source license. In line with the open-source principle, the      PATTRN Project supports and encourages efforts by individuals and communities to extend, adapt, transform, repurpose, or "hack" the code of PATTRN hereby released for the development of new projects.

        Nonetheless, all users of the code of PATTRN hereby released are required to comply with the "do no harm" principle. In particular, the use of all or part of the code of PATTRN is forbidden for:

        - Activities that may compromise the security of vulnerable individuals or communities, anywhere in the world;

        - Activities that aim at tracking, surveying, or targeting specific individuals or communities for the purpose of harming them directly or indirectly;

        - Activities that may disclose sensitive or personal information about individuals or communities without having obtained their explicit and informed consent in advance.

        By running or using any software application that includes all or part of the code of PATTRN hereby released, you commit to the respect of the present Charter of Use.

</br>
</br>
</br>

#7. Contributing to the development of PATTRN

</br>

_Note: This section of the documentation is a work in progress. It will get more detailed as we gain experience with community-led development in the framework of PATTRN._

###7.1 Introduction

As an open source project, PATTRN welcomes and encourages contributions to its development by the community of its users.

The code of PATTRN is hosted on GitHub, which also provides the framework for collaborative development of the project.

There are many ways people can contribute to the development of PATTRN. Below is a list of the most common ones.

</br>

###7.2 Writing code

Developers wishing to contribute code to the development of PATTRN can do so by following the standard GitHub procedures of open source development, such as [forking the PATTRN repository](https://help.github.com/articles/fork-a-repo/), [creating a pull request](https://help.github.com/articles/using-pull-requests/), etc.

For more information, visit [Github's help page](https://help.github.com/).

</br>

###7.3 Raising issues

Raising issues is an essential part of the development.

Anyone can raise an issue. Whether you are a developer or a simple user of PATTRN, whether it is about a bug of the application or related to the User Interface, raising an issue is always welcome and can really help improving PATTRN.

The best way to raise an issue is to do so directly on GitHub. To do so, please refer to the [simple guide here](https://help.github.com/articles/creating-an-issue/)

Alternatively, feel free to drop an email to [support@pattrn.co](mailto:support@pattrn.co) with a description of the issue you wish to raise.

</br>

###7.4 Writing/Editing the Documentation

Help us improve the present documentation of PATTRN by editing it here.

</br>

###7.5 Sharing ideas and spreading the word

Ideas and suggestions to improve PATTRN, technical or not in nature, are very welcome. Please share them by sending an email to [support@pattrn.co](mailto:support@pattrn.co).

Help us grow an active community of users/developers by spreading the word about PATTRN in your social and professional networks.

</br>

###7.6 Financial support

Fully non-profit, the PATTRN Project depends on funding and financial support in order to maintain and develop PATTRN.

We welcome donations and funding from organisations interested in using PATTRN for their work, or from foundations dedicated to support initiatives in related fields such as open-source, open data, human rights, information transparency, or citizen journalism.

Please get in touch by sending an email to [support@pattrn.co](mailto:support@pattrn.co).

</br>

###7.7 Governance structure

PATTRN is maintained and governed by the PATTRN Project.

The PATTRN Project is a unit hosted at Goldsmiths, University of London, in the Department of Visual Cultures.

As of December 2015, it is co-directed by Eyal Weizman, Director of Forensic Architecture, and Francesco Sebregondi, Project Architect of PATTRN.

Decisions regarding the development trajectory and roadmap of the PATTRN project are taken in consultation with the PATTRN Advisory Board, composed of developers and expert practitioners in the fields of use of PATTRN.

As PATTRN grows and starts involving an active community of users and developers, mechanisms for this community to take an active part in the decision-making process will be put in place. For comments or suggestions, please send us an email at [support@pattrn.co](mailto:support@pattrn.co).

</br>
</br>
</br>

#8. Troubleshooting

</br>

###8.1 The PATTRN Platform won't load any data

If, after setting it up by following the step-by-step guide (section 2 of the doc) and having entered a dataset into the PATTRN\_Master spreadsheet, your PATTRN Platform doesn't load any data, please check that:

**- Every row in the PATTRN\_Master spreadsheet that contains data in any of its cells, also contains valid data in the cells corresponding to the "latitude", "longitude", and "date\_time" columns**

In particular, check that all rows supposed to be empty are indeed completely empty of all data.

Try reloading the PATTRN Platform URL. If it still doesn't load data, please check that:

**- All the data in the "latitude", "longitude", and "date\_time" columns is formatted correctly**

To help with the process, the PATTRN\_Master spreadsheet integrates data validation formulas for each column. Any cell wrongly formatted in the "latitude", "longitude", or "date\_time" columns will be marked with an orange triangle in the top right corner or the cell. Make sure you correct the formatting of the data.

Try reloading the PATTRN Platform URL. If it still doesn't load data, please check that:

**- The public URL of the PATTRN\_Master spreadsheet matches the one inputted in the config.json file of the PATTRN Platform**

You can check the URL of the PATTRN\_Master spreadsheet by opening it from your Google Drive and clicking on "File" > "Publish to the web...". The URL displayed needs to match the one inputted in the "config.json" file, in the "public\_spreadsheet" field.

Save the file, re-upload it to your server, and try reloading the PATTRN Platform URL. If it still doesn't load data, please check that:

**- There are no formatting errors in the config.json file of the PATTRN Platform**

In particular, check that all the quotation marks in the config.json file are straight quotation marks. Basic text editors may automatically replace straight quotation marks with curly ones.

Save the file, re-upload it to your server, and try reloading the PATTRN Platform URL. If it still doesn't load data, please see the following section 9. Getting Help.

</br>
</br>
</br>

#9. Getting Help

</br>

###9.1 Mailing List/Forum

PATTRN has a Google Group to facilitate discussions and support among its community of users, [accessible here](https://groups.google.com/forum/#!forum/pattrn)

The group is public, and anyone can join. Just open the URL above while logged in to your Google Account, and click on "Join the Group".

Once you've joined, you'll be able to create new topics and post responses from the PATTRN Google Group online page, or directly from your Gmail address, by sending an email to [pattrn@googlegroups.com](mailto:pattrn@googlegroups.com)

</br>       

###10.2 Drop us an email or a Tweet

While sharing your question or issue on the PATTRN Google Group is the recommended way to get help, you can also contact us with ideas, suggestions, or questions by:

sending us an email at [support@pattrn.co](mailto:support@pattrn.co)

tweeting us [@pattrn\_](http://twitter.com/pattrn_)

We'll do our best to get back to you promptly.

***

