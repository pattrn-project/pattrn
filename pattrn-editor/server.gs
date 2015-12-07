//Developed by Digital Consolidation Ltd as a paid project advertised on a Google Apps Script community. 
//We are not responsible for the use of this application and any use of the application doesn't necessarily reflect our views. 
//Edouard Brasier, www.digital-consolidation.co.uk
//ed@digital-consolidation.co.uk

var Platform_Index = 0; //for internal reference only
function Set_Script_Properties(){
var userProperties = PropertiesService.getScriptProperties();
userProperties.setProperty('Admin', '1QgQxuUCP4eOHiddenegDNI_SI');
}
function Load_keys_from_admin(){ //run only when change so keys don't appear in running script
var userProperties = PropertiesService.getScriptProperties();
var AdminKey = userProperties.getProperty('Admin');
var sh = SpreadsheetApp.openById(AdminKey).getSheetByName("Keys");
var MasterKey= sh.getRange(1,2).getValues().toString();
userProperties.setProperty('Master', MasterKey);  
var WIPKey= sh.getRange(2,2).getValues().toString();
userProperties.setProperty('WIP', WIPKey); 
var AuditKey= sh.getRange(3,2).getValues().toString();
userProperties.setProperty('Audit', AuditKey);
var PassKey= sh.getRange(4,2).getValues().toString();
userProperties.setProperty('Pass', PassKey);
}
////////////////////////////////////////////////////////////////////////////////////////
function doGet(request) {
  var eventid = JSON.stringify(request);
  eventid= request.parameter.par;
  var cache = CacheService.getPublicCache();
  cache.put("id", eventid);
  var paratest= isNaN(request.parameter.par);
  if ( request.parameter.par == "editor" || request.parameter.par == "new" || paratest==false ){
    return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }else{
    return HtmlService.createTemplateFromFile('index2')
    .evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .getContent();
}

function LoadsSettings(){
  var userProperties = PropertiesService.getScriptProperties();
  var PassKey = userProperties.getProperty('Admin');
  var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Admin"); 
  var Pvalues2 = sh.getDataRange().getValues();
  var cache = CacheService.getPublicCache();
  var id = cache.get('id'); 
  Pvalues2[1].push(id);
  var valuestoclient2 = JSON.stringify(Pvalues2[1]);
  return valuestoclient2;  
}

function PassConfirm(usernami,passwordi){
  var passwordiresu= "";
  var re = /^\w+$/;
  if (!re.test(passwordi)) {
    passwordiresu= "invalid password characters"; 
  }
  if (passwordiresu == ""){
    var userProperties = PropertiesService.getScriptProperties();
    var PassKey = userProperties.getProperty('Pass');
    var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Data"); 
    var Pvalues = sh.getDataRange().getValues();
    var checklogin= contains(Pvalues,usernami,0);
    if (checklogin == "false") {
      passwordiresu= "invalid login/password"; 
    }
    if (checklogin != "false") {
      if ( Pvalues[checklogin][1] == passwordi){
        passwordiresu= usernami;
      }else{
        passwordiresu= "invalid login/password"; 
      }}
  }
  return passwordiresu
}

function contains(a, obj,logorpass) {
  var resi= "false";
  for (var i = 0; i < a.length; i++) {
    if (a[i][logorpass] === obj) {
      resi = i;
      
      
    }
  }
  return resi
}


function AssignIDcontri(){
  var userProperties = PropertiesService.getScriptProperties();
  var PassKey = userProperties.getProperty('WIP');
  var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Contributions");  
  var maxirow=sh.getLastRow();
  var rangeiu = sh.getRange(2, 34, maxirow, 34);
  var EventIDvalues= rangeiu.getValues();
  return EventIDvalues
}



function Populate_Data(){
var userProperties = PropertiesService.getScriptProperties();
var MasterKey = userProperties.getProperty('Master');
var sh = SpreadsheetApp.openById(MasterKey).getSheetByName("Data");
var values = sh.getDataRange().getValues();
var valuestoclient = JSON.stringify(values);
return valuestoclient;
}


function Rename_Col(typeofcol,nameofcol){
  var lock = LockService.getPublicLock();
  lock.waitLock(10000);
  var result= "No Columns available";
  var userProperties = PropertiesService.getScriptProperties();
  var MasterKey = userProperties.getProperty('Master');
  var sh = SpreadsheetApp.openById(MasterKey).getSheetByName("Data");
  var lastColumn = sh.getLastColumn();
  var range = sh.getRange(1, 1, 1, lastColumn);
  var HeadersValues= range.getValues();
  
  for(var cc = lastColumn-1; cc > 0; cc--){
    var searched = HeadersValues[0][cc];
    if (searched.indexOf('RENAME') !== -1 ){
      if (searched.indexOf(typeofcol) !== -1 ){
        result= cc+1   ;
        
      }
    }
  }
  
  var re = /^\w+$/;
  if (!re.test(nameofcol)) {
    result= "invalid column name characters, only letter/number and _ are allowed"; 
  }
  
  if (result !== "No Columns available" && result !== "invalid column name characters, only letter/number and _ are allowed"){
    sh.getRange(1,result).setValue(nameofcol.toString().toLowerCase());
  }
  //rename column but keep datatype
  //var valo= sh.getRange(1,result).getValues().toString();
  //var newvalo= valo.replace("*RENAME*",nameofcol);
  //sh.getRange(1,result).setValues(newvalo);
  
  SpreadsheetApp.flush(); 
  lock.releaseLock();
  return result
}

function Deletion_Col(typeofcol){
//remember to ask for confirmation twice
var lock = LockService.getPublicLock();
lock.waitLock(10000);
var result= "not found";
var userProperties = PropertiesService.getScriptProperties();
var MasterKey = userProperties.getProperty('Master');
var sh = SpreadsheetApp.openById(MasterKey).getSheetByName("Data");
var lastColumn = sh.getLastColumn();
  var lastirow=sh.getLastRow();
var range = sh.getRange(1, 1, 1, lastColumn);
var HeadersValues= range.getValues();
for(var cc = lastColumn-1; cc > 0; cc--){
var searched = HeadersValues[0][cc];
if (searched == typeofcol ){
result= cc+1   ;
}
}
  if (result!="not found") {
       var range = sh.getRange(1, result, lastirow, 1);
 range.clearContent();
    if (result>8 && result <14){     
      sh.getRange(1,result ).setValue("number_: *RENAME*");
    }
     if (result>13 && result <19){     
      sh.getRange(1,result ).setValue("tag_: *RENAME*");
    }

     if (result>18 && result <24){     
      sh.getRange(1,result ).setValue("boolean_: *RENAME*");
    }

      }
  
 


SpreadsheetApp.flush(); 
lock.releaseLock(); 
return result
}




  function saveFile(data,name) {
  var contentType = data.substring(5,data.indexOf(';'));
  var file = Utilities.newBlob(Utilities.base64Decode(data.substr(data.indexOf('base64,')+7)), contentType, name);
  var test= DriveApp.getRootFolder().createFile(file);
  test.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); 
  var namer =  test.getId();
  return namer
}



function recover_event_draft(ventos0,ventosname){
var userProperties = PropertiesService.getScriptProperties();
var PassKey = userProperties.getProperty('WIP');
var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Drafts"); 
var maxirow=sh.getLastRow();
var maxocol= sh.getLastColumn()
var rangeiu = sh.getRange(1, 1, maxirow, maxocol);
var EventIDvalues= rangeiu.getValues();  
var eventrow= "No data";

for(var cc = maxirow-1; cc > 0; cc--){
var searched = EventIDvalues[cc][0];
var namesearched= EventIDvalues[cc][31];
if (searched == ventos0 && namesearched==ventosname ){
eventrow= cc; 
//var lastColumn = sh.getLastColumn();
//var rangefound = sh.getRange(eventrow+1, 1, eventrow+1, lastColumn);
//var louli=  rangefound.getValues();  
//var reconinos= EventIDvalues.map(function(value,index) { return index[cc]; });
  var valuestoclient = JSON.stringify(EventIDvalues[cc]);
return valuestoclient
}
}
//var rowchoice;
if (eventrow == "No data"){  
  //Logger.log(louli[0][0]);
return eventrow 
}

}

function recover_event_draft(ventos0,ventosname){
var userProperties = PropertiesService.getScriptProperties();
var PassKey = userProperties.getProperty('WIP');
var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Drafts"); 
var maxirow=sh.getLastRow();
var maxocol= sh.getLastColumn()
var rangeiu = sh.getRange(1, 1, maxirow, maxocol);
var EventIDvalues= rangeiu.getValues();  
var eventrow= "No data";

for(var cc = maxirow-1; cc > 0; cc--){
var searched = EventIDvalues[cc][0];
var namesearched= EventIDvalues[cc][31];
if (searched == ventos0 && namesearched==ventosname ){
eventrow= cc; 
//var lastColumn = sh.getLastColumn();
//var rangefound = sh.getRange(eventrow+1, 1, eventrow+1, lastColumn);
//var louli=  rangefound.getValues();  
//var reconinos= EventIDvalues.map(function(value,index) { return index[cc]; });
  var valuestoclient = JSON.stringify(EventIDvalues[cc]);
return valuestoclient
}
}
//var rowchoice;
if (eventrow == "No data"){  
  //Logger.log(louli[0][0]);
return eventrow 
}

}

function Loadfromcontri(ventos0){
var userProperties = PropertiesService.getScriptProperties();
var PassKey = userProperties.getProperty('WIP');
var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Contributions"); 
var maxirow=sh.getLastRow();
var maxocol= sh.getLastColumn()
var rangeiu = sh.getRange(1, 1, maxirow, maxocol);
var EventIDvalues= rangeiu.getValues();  
var eventrow= "No data";

for(var cc = maxirow-1; cc > 0; cc--){
var searched = EventIDvalues[cc][33];
//var namesearched= EventIDvalues[cc][31];
if (searched == ventos0  ){
eventrow= cc; 

var valuestoclient = JSON.stringify(EventIDvalues[cc]);
return valuestoclient
}
}

if (eventrow == "No data"){  
return eventrow 
}
  
 
  
}


function Loadfromreal(ventos0){
var userProperties = PropertiesService.getScriptProperties();
var PassKey = userProperties.getProperty('Master');
var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Data"); 
var maxirow=sh.getLastRow();
var maxocol= sh.getLastColumn()
var rangeiu = sh.getRange(1, 1, maxirow, maxocol);
var EventIDvalues= rangeiu.getValues();  
var eventrow= "No data";

for(var cc = maxirow-1; cc > 0; cc--){
var searched = EventIDvalues[cc][0];
//var namesearched= EventIDvalues[cc][31];
if (searched == ventos0  ){
eventrow= cc; 

var valuestoclient = JSON.stringify(EventIDvalues[cc]);
return valuestoclient
}
}

if (eventrow == "No data"){  
return eventrow 
}
  
 
  
}


function Get_event_data(valuesearched){

var userProperties = PropertiesService.getScriptProperties();
var MasterKey = userProperties.getProperty('Master');
var sh = SpreadsheetApp.openById(MasterKey).getSheetByName("Data");
//find event row
var maxirow=sh.getLastRow();
var maxocol= sh.getLastColumn()
//var rangeiu = sh.getRange(1, 1, maxirow, 1);
var rangeiu = sh.getRange(1,1, maxirow, maxocol);
var EventIDvalues= rangeiu.getValues();  
var eventrow= "Event not found";
//var valuesearched= "45";
for(var cc = maxirow-1; cc >0; cc--){
var searched = EventIDvalues[cc][0];
if (searched == valuesearched ){
eventrow= cc; 
eventrow= JSON.stringify(EventIDvalues[cc]);
}
}  
Logger.log(eventrow);
return eventrow;
}


function movela(contri){
  
var userProperties = PropertiesService.getScriptProperties();
var MasterKey = userProperties.getProperty('WIP');
var sh = SpreadsheetApp.openById(MasterKey).getSheetByName("Contributions");
////find event row
var maxirow=sh.getLastRow();
var rangeiu = sh.getRange(1, 34, maxirow, 34);
var EventIDvalues= rangeiu.getValues();  
var eventrow= "Event not found";
//var contri= "7";
for(var cc = maxirow-1; cc > 0; cc--){
var searched = EventIDvalues[cc][0];
if (searched == contri ){
eventrow= cc; 
var datatocopy = sh.getRange(cc+1,1, cc+1, 34).getValues();
}
}  

if (eventrow!= "Event not found" ){
sh.deleteRow(eventrow+1);
var lock = LockService.getPublicLock();
lock.waitLock(10000);
 // Do some work on a shared resource.
var AuditKey = userProperties.getProperty('Audit');
var sh2 = SpreadsheetApp.openById(AuditKey).getSheetByName("Audit");
var maxirow2=sh2.getLastRow();
sh2.getRange(maxirow2+1, 1).setValue(datatocopy[0][0]);
SpreadsheetApp.flush(); 
lock.releaseLock();
  
//copy the row to audit
for (var i = 1; i <34; i++ ) {
sh2.getRange(maxirow2+1, i+1).setValue(datatocopy[0][i]);
 
 }
  
}
 
}

function delete_event_data(ventostype,ventosaction,ventosname,ventos0){
var eventrow="event not found";
var userProperties = PropertiesService.getScriptProperties();
var MasterKey = userProperties.getProperty('Master');
var sh = SpreadsheetApp.openById(MasterKey).getSheetByName("Data");
////find event row
var maxirow=sh.getLastRow();
var rangeiu = sh.getRange(1, 1, maxirow, 1);
var EventIDvalues= rangeiu.getValues();  
var eventrow= "Event not found";
//var valuesearched= "10kl05";
for(var cc = maxirow-1; cc > 0; cc--){
var searched = EventIDvalues[cc][0];
if (searched == ventos0 ){
eventrow= cc; 
var datatocopy = sh.getRange(cc+1,1, cc+1, 29).getValues();
}
}  
if (eventrow!= "Event not found" ){
sh.deleteRow(eventrow+1);
var lock = LockService.getPublicLock();
lock.waitLock(10000);
 // Do some work on a shared resource.
var AuditKey = userProperties.getProperty('Audit');
var sh2 = SpreadsheetApp.openById(AuditKey).getSheetByName("Audit");
var maxirow2=sh2.getLastRow();
sh2.getRange(maxirow2+1, 1).setValue(ventos0);
SpreadsheetApp.flush(); 
lock.releaseLock();
  
//copy the row to audit
for (var i = 1; i <29; i++ ) {
sh2.getRange(maxirow2+1, i+1).setValue(datatocopy[0][i]);
 
 }

//ventostype, ventosaction,ventosname
var ventosdate=  new Date();
 sh2.getRange(maxirow2+1, 30).setValue(ventostype); 
 sh2.getRange(maxirow2+1, 31).setValue(ventosaction); 
   sh2.getRange(maxirow2+1, 32).setValue(ventosname); 
   sh2.getRange(maxirow2+1, 33).setValue(ventosdate); 
  eventrow= "event has been deleted, refresh?";
}
return eventrow
}


function draft_event_data(ventostype, ventosaction,ventosname,ventos0,ventos1,ventos2,ventos3,ventos4,ventos5,ventos6,ventos7,ventos8,ventos9,ventos10,ventos11,ventos12,ventos13,ventos14,ventos15,ventos16,ventos17,ventos18,ventos19,ventos20,ventos21,ventos22,ventos23,ventos24,ventos25,ventos26,ventos27,ventos28){
if (ventostype== "contribution"){
   ventosaction= "To be reviewed";
var userProperties = PropertiesService.getScriptProperties();
  
   var PassKey = userProperties.getProperty('WIP');
   var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Contributions"); 
  var lock = LockService.getPublicLock();
lock.waitLock(10000);
 // Do some work on a shared resource.
var newididi= sh.getRange(1, 35).getValue();
newididi= newididi*1+1;
sh.getRange(1, 35).setValue(newididi);
SpreadsheetApp.flush(); 
lock.releaseLock(); 
  
  
  
  
  
 }else{
   var userProperties = PropertiesService.getScriptProperties();
  
    var PassKey = userProperties.getProperty('WIP');
    var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Drafts"); 
    
    ventostype= "Draft";
    ventosaction= "Saved"; 
  }
  
  
  
  var ventosdate=  new Date();
 
  //search draft of editor for this event
  var maxirow=sh.getLastRow();
  var maxocol= sh.getLastColumn()
  var rangeiu = sh.getRange(1, 1, maxirow, maxocol);
  var EventIDvalues= rangeiu.getValues();  
  
  
  var eventrow= "draft not found";
  
 if (ventostype!= "contribution"){
    //var ventos0= "1002";
    //var ventosname= "Marc"
    for(var cc = maxirow-1; cc > 0; cc--){
      var searched = EventIDvalues[cc][0];
      var namesearched= EventIDvalues[cc][31];
      if (searched == ventos0 && namesearched==ventosname ){
        eventrow= cc; 
        //var datatocopy = sh.getRange(cc+1,1, cc+1, 29).getValues();
      }
    }
  }
  var rowchoice;
  if (eventrow == "draft not found"){
    var lock = LockService.getPublicLock();
    lock.waitLock(10000);  
    var maxosmaxo = sh.getLastRow();
    var newmaxosmaxo= maxosmaxo*1+1;
    sh.getRange(newmaxosmaxo, 1).setValue(ventos0);
    SpreadsheetApp.flush(); 
    lock.releaseLock();
    rowchoice= newmaxosmaxo;
    
  }else{
    rowchoice= eventrow+1
    //input at cc+1
  }
  
  var validationissue= "no";
  var therewasachange; 
  
  if (ventostype== "contribution"){
    
     sh .getRange(rowchoice, 34
        ).setValue(newididi);
  }
  if (ventos1 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 2).setValue(ventos1);
  }
  
  if (ventos2 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    var testilongo= isNaN(ventos2);
    if (testilongo == false){
      if (ventos2 >= -180 && ventos2 <= 180){
        sh .getRange(rowchoice, 3).setValue(ventos2);
      }
    }else{
      validationissue= "yes";
    }
  }
  
  
  if (ventos3 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    var testilato= isNaN(ventos3);
    if (testilato == false){
      
      if (ventos3 >= -90 && ventos3 <=90){
        sh .getRange(rowchoice, 4).setValue(ventos3);
      }
    }else{
      validationissue= "yes";
    }
  }
  
  if (ventos4 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 5).setValue(ventos4);
  }
  
  if (ventos5 != "q1w2e3r4t5y5"){
    //validate date iso
    re = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/
    if (re.test(ventos5)) { 
      sh .getRange(rowchoice, 6).setValue(ventos5);
      therewasachange= "yes";
    }else { 
      validationissue= "yes";
    }
  }
  
  if (ventos6 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 7).setValue(ventos6);
  }  
  
  if (ventos7 != "q1w2e3r4t5y5"){
    ventos7= ventos7.split(',');
    for (i = 0; i < ventos7.length; i++){
      ventos7[i] = ventos7[i].trim();
      ventos7[i] =  ventos7[i].charAt(0).toUpperCase()+ ventos7[i].substr(1);
    }
    ventos7 = ventos7.filter(function(v){return v!==''});
    ventos7= ventos7.toString();
    therewasachange= "yes";
    sh .getRange(rowchoice, 8).setValue(ventos7);
  } 
  
  if (ventos8 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    var testi8= isNaN(ventos8);
    if (testi8 == false){
      sh .getRange(rowchoice, 9).setValue(ventos8);
    }else{
      validationissue= "yes";
    }
  }
  
  if (ventos9 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    var testi9= isNaN(ventos9);
    if (testi9 == false){
      sh .getRange(rowchoice, 10).setValue(ventos9);
    }else{
      validationissue= "yes";
    }
  }
  
  if (ventos10 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    var testi10= isNaN(ventos10);
    if (testi10 == false){
      sh .getRange(rowchoice, 11).setValue(ventos10);
    }else{
      validationissue= "yes";
    }
  }
  
  
  if (ventos11 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    var testi11= isNaN(ventos11);
    if (testi11 == false){
      sh .getRange(rowchoice, 12).setValue(ventos11);
    }else{
      validationissue= "yes";
    }
  }
  
  if (ventos12 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    var testi12= isNaN(ventos12);
    if (testi12 == false){
      sh .getRange(rowchoice, 13).setValue(ventos12);
    }else{
      validationissue= "yes";
    }
  }
  
  
  if (ventos13 != "q1w2e3r4t5y5"){
    ventos13= ventos13.split(',');
    for (i = 0; i < ventos13.length; i++){
      ventos13[i] = ventos13[i].trim();
      ventos13[i] =  ventos13[i].charAt(0).toUpperCase()+ ventos13[i].substr(1);
    }
    ventos13 = ventos13.filter(function(v){return v!==''});
    ventos13= ventos13.toString();
    therewasachange= "yes";
    sh .getRange(rowchoice, 14).setValue(ventos13);
  } 
  
  if (ventos14 != "q1w2e3r4t5y5"){
    ventos14= ventos14.split(',');
    for (i = 0; i < ventos14.length; i++){
      ventos14[i] = ventos14[i].trim();
      ventos14[i] =  ventos14[i].charAt(0).toUpperCase()+ ventos14[i].substr(1);
    }
    ventos14 = ventos14.filter(function(v){return v!==''});
    ventos14= ventos14.toString();
    therewasachange= "yes";
    sh .getRange(rowchoice, 15).setValue(ventos14);
  } 
  
  if (ventos15 != "q1w2e3r4t5y5"){
    ventos15= ventos15.split(',');
    for (i = 0; i < ventos15.length; i++){
      ventos15[i] = ventos15[i].trim();
      ventos15[i] =  ventos15[i].charAt(0).toUpperCase()+ ventos15[i].substr(1);
    }
    ventos15 = ventos15.filter(function(v){return v!==''});
    ventos15= ventos15.toString();
    therewasachange= "yes";
    sh .getRange(rowchoice, 16).setValue(ventos15);
  } 
  
  if (ventos16 != "q1w2e3r4t5y5"){
    ventos16= ventos16.split(',');
    for (i = 0; i < ventos16.length; i++){
      ventos16[i] = ventos16[i].trim();
      ventos16[i] =  ventos16[i].charAt(0).toUpperCase()+ ventos16[i].substr(1);
    }
    ventos16 = ventos16.filter(function(v){return v!==''});
    ventos16= ventos16.toString();
    therewasachange= "yes";
    sh .getRange(rowchoice, 17).setValue(ventos16);
  } 
  
  if (ventos17 != "q1w2e3r4t5y5"){
    ventos17= ventos17.split(',');
    for (i = 0; i < ventos17.length; i++){
      ventos17[i] = ventos17[i].trim();
      ventos17[i] =  ventos17[i].charAt(0).toUpperCase()+ ventos17[i].substr(1);
    }
    ventos17 = ventos17.filter(function(v){return v!==''});
    ventos17= ventos17.toString();
    therewasachange= "yes";
    sh .getRange(rowchoice, 18).setValue(ventos17);
  }   
  
  if (ventos18 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 19).setValue(ventos18);
  }   
  
  if (ventos19 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 20).setValue(ventos19);
  }  
  
  if (ventos20 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 21).setValue(ventos20);
  }  
  
  if (ventos21 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 22).setValue(ventos21);
  }  
  
  if (ventos22 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 23).setValue(ventos22);
  }
  
  if (ventos22 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 23).setValue(ventos22);
  } 
  
  if (ventos22 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 23).setValue(ventos22);
  } 
  
  if (ventos22 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 23).setValue(ventos22);
  } 
  
  if (ventos23 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 24).setValue(ventos23);
  } 
  
  if (ventos24 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 25).setValue(ventos24);
  } 
  
  if (ventos25 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 26).setValue(ventos25);
  }   
  
  if (ventos26 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 27).setValue(ventos26);
  }
  
  if (ventos27 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 28).setValue(ventos27);
  }
  
  if (ventos28 != "q1w2e3r4t5y5"){
    therewasachange= "yes";
    sh .getRange(rowchoice, 29).setValue(ventos28);
  }
  
  
  sh.getRange(rowchoice, 30).setValue(ventostype); 
  sh.getRange(rowchoice, 31).setValue(ventosaction); 
  sh.getRange(rowchoice, 32).setValue(ventosname); 
  sh.getRange(rowchoice, 33).setValue(ventosdate);   
  
  
  if   (validationissue != "yes"){
     if (ventostype!= "contribution"){
    var eventrow= "Draft saved";
     }else{
    var eventrow= "Your contribution will be reviewed";  
    }
    
  }else { 
    var eventrow= "Error event data validation issue"; 
  }
  
  
  
  
  return eventrow
  
}

////////////////////////////////////////////
//////////////////////////////////////////
function new_load_event_data(ventostype, ventosaction,ventosname,ventos0,ventos1,ventos2,ventos3,ventos4,ventos5,ventos6,ventos7,ventos8,ventos9,ventos10,ventos11,ventos12,ventos13,ventos14,ventos15,ventos16,ventos17,ventos18,ventos19,ventos20,ventos21,ventos22,ventos23,ventos24,ventos25,ventos26,ventos27,ventos28){
//get event id
var userProperties = PropertiesService.getScriptProperties();
var PassKey = userProperties.getProperty('Admin');
var sh = SpreadsheetApp.openById(PassKey).getSheetByName("Admin"); 
var lock = LockService.getPublicLock();
lock.waitLock(10000);
 // Do some work on a shared resource.
var newid= sh.getRange(2, 11).getValue();
newid= newid*1+1;
sh.getRange(2, 11).setValue(newid);
SpreadsheetApp.flush(); 
lock.releaseLock(); 
var userProperties2 = PropertiesService.getScriptProperties();
var MasterKey = userProperties2.getProperty('Master');
var sh2 = SpreadsheetApp.openById(MasterKey).getSheetByName("Data");

var lock2 = LockService.getPublicLock();
lock2.waitLock(10000);
var maxirow=sh2.getLastRow();
sh2.getRange(maxirow+1, 1).setValue(newid);
 // Do some work on a shared resource.
SpreadsheetApp.flush(); 
lock2.releaseLock(); 
//validate variable and load
var validationissue= "no";
var therewasachange; 
  
if (ventos1 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 2).setValue(ventos1);
}

if (ventos2 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testilongo= isNaN(ventos2);
if (testilongo == false){
if (ventos2 >= -180 && ventos2 <= 180){
sh2 .getRange(maxirow+1, 3).setValue(ventos2);
}
}else{
validationissue= "yes";
}
}


if (ventos3 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testilato= isNaN(ventos3);
if (testilato == false){

if (ventos3 >= -90 && ventos3 <=90){
sh2 .getRange(maxirow+1, 4).setValue(ventos3);
}
}else{
validationissue= "yes";
}
}

if (ventos4 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 5).setValue(ventos4);
}
  
if (ventos5 != "q1w2e3r4t5y5"){
//validate date iso
re = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/
if (re.test(ventos5)) { 
sh2 .getRange(maxirow+1, 6).setValue(ventos5);
therewasachange= "yes";
}else { 
validationissue= "yes";
}
}
  
if (ventos6 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 7).setValue(ventos6);
}  
 
if (ventos7 != "q1w2e3r4t5y5"){
ventos7= ventos7.split(',');
for (i = 0; i < ventos7.length; i++){
ventos7[i] = ventos7[i].trim();
ventos7[i] =  ventos7[i].charAt(0).toUpperCase()+ ventos7[i].substr(1);
}
ventos7 = ventos7.filter(function(v){return v!==''});
ventos7= ventos7.toString();
therewasachange= "yes";
sh2 .getRange(maxirow+1, 8).setValue(ventos7);
} 
  
if (ventos8 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi8= isNaN(ventos8);
if (testi8 == false){
sh2 .getRange(maxirow+1, 9).setValue(ventos8);
}else{
validationissue= "yes";
}
}
  
if (ventos9 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi9= isNaN(ventos9);
if (testi9 == false){
sh2 .getRange(maxirow+1, 10).setValue(ventos9);
}else{
validationissue= "yes";
}
}
  
if (ventos10 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi10= isNaN(ventos10);
if (testi10 == false){
sh2 .getRange(maxirow+1, 11).setValue(ventos10);
}else{
validationissue= "yes";
}
}
  
  
if (ventos11 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi11= isNaN(ventos11);
if (testi11 == false){
sh2 .getRange(maxirow+1, 12).setValue(ventos11);
}else{
validationissue= "yes";
}
}
  
if (ventos12 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi12= isNaN(ventos12);
if (testi12 == false){
sh2 .getRange(maxirow+1, 13).setValue(ventos12);
}else{
validationissue= "yes";
}
}
  
  
if (ventos13 != "q1w2e3r4t5y5"){
ventos13= ventos13.split(',');
for (i = 0; i < ventos13.length; i++){
ventos13[i] = ventos13[i].trim();
ventos13[i] =  ventos13[i].charAt(0).toUpperCase()+ ventos13[i].substr(1);
}
ventos13 = ventos13.filter(function(v){return v!==''});
ventos13= ventos13.toString();
therewasachange= "yes";
sh2 .getRange(maxirow+1, 14).setValue(ventos13);
} 
  
if (ventos14 != "q1w2e3r4t5y5"){
ventos14= ventos14.split(',');
for (i = 0; i < ventos14.length; i++){
ventos14[i] = ventos14[i].trim();
ventos14[i] =  ventos14[i].charAt(0).toUpperCase()+ ventos14[i].substr(1);
}
ventos14 = ventos14.filter(function(v){return v!==''});
ventos14= ventos14.toString();
therewasachange= "yes";
sh2 .getRange(maxirow+1, 15).setValue(ventos14);
} 
  
  if (ventos15 != "q1w2e3r4t5y5"){
ventos15= ventos15.split(',');
for (i = 0; i < ventos15.length; i++){
ventos15[i] = ventos15[i].trim();
ventos15[i] =  ventos15[i].charAt(0).toUpperCase()+ ventos15[i].substr(1);
}
ventos15 = ventos15.filter(function(v){return v!==''});
ventos15= ventos15.toString();
therewasachange= "yes";
sh2 .getRange(maxirow+1, 16).setValue(ventos15);
} 

if (ventos16 != "q1w2e3r4t5y5"){
ventos16= ventos16.split(',');
for (i = 0; i < ventos16.length; i++){
ventos16[i] = ventos16[i].trim();
ventos16[i] =  ventos16[i].charAt(0).toUpperCase()+ ventos16[i].substr(1);
}
ventos16 = ventos16.filter(function(v){return v!==''});
ventos16= ventos16.toString();
therewasachange= "yes";
sh2 .getRange(maxirow+1, 17).setValue(ventos16);
} 
  
if (ventos17 != "q1w2e3r4t5y5"){
ventos17= ventos17.split(',');
for (i = 0; i < ventos17.length; i++){
ventos17[i] = ventos17[i].trim();
ventos17[i] =  ventos17[i].charAt(0).toUpperCase()+ ventos17[i].substr(1);
}
ventos17 = ventos17.filter(function(v){return v!==''});
ventos17= ventos17.toString();
therewasachange= "yes";
sh2 .getRange(maxirow+1, 18).setValue(ventos17);
}   

if (ventos18 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 19).setValue(ventos18);
}   
 
if (ventos19 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 20).setValue(ventos19);
}  

if (ventos20 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 21).setValue(ventos20);
}  
  
if (ventos21 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 22).setValue(ventos21);
}  
  
if (ventos22 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 23).setValue(ventos22);
}
  
if (ventos22 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 23).setValue(ventos22);
} 

if (ventos22 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 23).setValue(ventos22);
} 

if (ventos22 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 23).setValue(ventos22);
} 

if (ventos23 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 24).setValue(ventos23);
} 

if (ventos24 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 25).setValue(ventos24);
} 

if (ventos25 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 26).setValue(ventos25);
}   
  
 if (ventos26 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 27).setValue(ventos26);
}
  
  if (ventos27 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 28).setValue(ventos27);
}
  
if (ventos28 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh2 .getRange(maxirow+1, 29).setValue(ventos28);
}
  
if   (validationissue != "yes"){
var eventrow= "New event saved ID "+newid;
}else { 
var eventrow= "Error event data validation issue"; 
}


return eventrow
}
function load_event_data(ventostype, ventosaction,ventosname,ventos0,ventos1,ventos2,ventos3,ventos4,ventos5,ventos6,ventos7,ventos8,ventos9,ventos10,ventos11,ventos12,ventos13,ventos14,ventos15,ventos16,ventos17,ventos18,ventos19,ventos20,ventos21,ventos22,ventos23,ventos24,ventos25,ventos26,ventos27,ventos28){
var userProperties = PropertiesService.getScriptProperties();
var MasterKey = userProperties.getProperty('Master');
var sh = SpreadsheetApp.openById(MasterKey).getSheetByName("Data");
////find event row
var maxirow=sh.getLastRow();
var rangeiu = sh.getRange(1, 1, maxirow, 1);
var EventIDvalues= rangeiu.getValues();  
var eventrow= "Event not found";
//var valuesearched= "10kl05";
for(var cc = maxirow-1; cc > 0; cc--){
var searched = EventIDvalues[cc][0];
if (searched == ventos0 ){
eventrow= cc; 
var datatocopy = sh.getRange(cc+1,1, cc+1, 29).getValues();
}
}  
if (eventrow!= "Event not found" ){
var lock = LockService.getPublicLock();
lock.waitLock(10000);
 // Do some work on a shared resource.
var AuditKey = userProperties.getProperty('Audit');
var sh2 = SpreadsheetApp.openById(AuditKey).getSheetByName("Audit");
var maxirow2=sh2.getLastRow();
sh2.getRange(maxirow2+1, 1).setValue(ventos0);
SpreadsheetApp.flush(); 
lock.releaseLock();
  
//copy the row to audit

  

for (var i = 1; i <29; i++ ) {
sh2.getRange(maxirow2+1, i+1).setValue(datatocopy[0][i]);
 
 }

//ventostype, ventosaction,ventosname
var ventosdate=  new Date();
 sh2.getRange(maxirow2+1, 30).setValue(ventostype); 
 sh2.getRange(maxirow2+1, 31).setValue(ventosaction); 
   sh2.getRange(maxirow2+1, 32).setValue(ventosname); 
   sh2.getRange(maxirow2+1, 33).setValue(ventosdate); 
var therewasachange= "no";
var validationissue= "no";
//Logger.log(ventos28);
if (ventos1 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 2).setValue(ventos1);
}

if (ventos2 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testilongo= isNaN(ventos2);
if (testilongo == false){
if (ventos2 >= -180 && ventos2 <= 180){
sh .getRange(eventrow+1, 3).setValue(ventos2);
}
}else{
validationissue= "yes";
}
}


if (ventos3 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testilato= isNaN(ventos3);
if (testilato == false){

if (ventos3 >= -90 && ventos3 <=90){
sh .getRange(eventrow+1, 4).setValue(ventos3);
}
}else{
validationissue= "yes";
}
}

if (ventos4 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 5).setValue(ventos4);
}
  
if (ventos5 != "q1w2e3r4t5y5"){
//validate date iso
re = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/
if (re.test(ventos5)) { 
sh .getRange(eventrow+1, 6).setValue(ventos5);
therewasachange= "yes";
}else { 
validationissue= "yes";
}
}
  
if (ventos6 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 7).setValue(ventos6);
}  
 
if (ventos7 != "q1w2e3r4t5y5"){
ventos7= ventos7.split(',');
for (i = 0; i < ventos7.length; i++){
ventos7[i] = ventos7[i].trim();
ventos7[i] =  ventos7[i].charAt(0).toUpperCase()+ ventos7[i].substr(1);
}
ventos7 = ventos7.filter(function(v){return v!==''});
ventos7= ventos7.toString();
therewasachange= "yes";
sh .getRange(eventrow+1, 8).setValue(ventos7);
} 
  
if (ventos8 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi8= isNaN(ventos8);
if (testi8 == false){
sh .getRange(eventrow+1, 9).setValue(ventos8);
}else{
validationissue= "yes";
}
}
  
if (ventos9 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi9= isNaN(ventos9);
if (testi9 == false){
sh .getRange(eventrow+1, 10).setValue(ventos9);
}else{
validationissue= "yes";
}
}
  
if (ventos10 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi10= isNaN(ventos10);
if (testi10 == false){
sh .getRange(eventrow+1, 11).setValue(ventos10);
}else{
validationissue= "yes";
}
}
  
  
if (ventos11 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi11= isNaN(ventos11);
if (testi11 == false){
sh .getRange(eventrow+1, 12).setValue(ventos11);
}else{
validationissue= "yes";
}
}
  
if (ventos12 != "q1w2e3r4t5y5"){
therewasachange= "yes";
var testi12= isNaN(ventos12);
if (testi12 == false){
sh .getRange(eventrow+1, 13).setValue(ventos12);
}else{
validationissue= "yes";
}
}
  
  
if (ventos13 != "q1w2e3r4t5y5"){
ventos13= ventos13.split(',');
for (i = 0; i < ventos13.length; i++){
ventos13[i] = ventos13[i].trim();
ventos13[i] =  ventos13[i].charAt(0).toUpperCase()+ ventos13[i].substr(1);
}
ventos13 = ventos13.filter(function(v){return v!==''});
ventos13= ventos13.toString();
therewasachange= "yes";
sh .getRange(eventrow+1, 14).setValue(ventos13);
} 
  
if (ventos14 != "q1w2e3r4t5y5"){
ventos14= ventos14.split(',');
for (i = 0; i < ventos14.length; i++){
ventos14[i] = ventos14[i].trim();
ventos14[i] =  ventos14[i].charAt(0).toUpperCase()+ ventos14[i].substr(1);
}
ventos14 = ventos14.filter(function(v){return v!==''});
ventos14= ventos14.toString();
therewasachange= "yes";
sh .getRange(eventrow+1, 15).setValue(ventos14);
} 
  
  if (ventos15 != "q1w2e3r4t5y5"){
ventos15= ventos15.split(',');
for (i = 0; i < ventos15.length; i++){
ventos15[i] = ventos15[i].trim();
ventos15[i] =  ventos15[i].charAt(0).toUpperCase()+ ventos15[i].substr(1);
}
ventos15 = ventos15.filter(function(v){return v!==''});
ventos15= ventos15.toString();
therewasachange= "yes";
sh .getRange(eventrow+1, 16).setValue(ventos15);
} 

if (ventos16 != "q1w2e3r4t5y5"){
ventos16= ventos16.split(',');
for (i = 0; i < ventos16.length; i++){
ventos16[i] = ventos16[i].trim();
ventos16[i] =  ventos16[i].charAt(0).toUpperCase()+ ventos16[i].substr(1);
}
ventos16 = ventos16.filter(function(v){return v!==''});
ventos16= ventos16.toString();
therewasachange= "yes";
sh .getRange(eventrow+1, 17).setValue(ventos16);
} 
  
if (ventos17 != "q1w2e3r4t5y5"){
ventos17= ventos17.split(',');
for (i = 0; i < ventos17.length; i++){
ventos17[i] = ventos17[i].trim();
ventos17[i] =  ventos17[i].charAt(0).toUpperCase()+ ventos17[i].substr(1);
}
ventos17 = ventos17.filter(function(v){return v!==''});
ventos17= ventos17.toString();
therewasachange= "yes";
sh .getRange(eventrow+1, 18).setValue(ventos17);
}   

if (ventos18 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 19).setValue(ventos18);
}   
 
if (ventos19 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 20).setValue(ventos19);
}  

if (ventos20 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 21).setValue(ventos20);
}  
  
if (ventos21 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 22).setValue(ventos21);
}  
  
if (ventos22 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 23).setValue(ventos22);
}
  
if (ventos22 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 23).setValue(ventos22);
} 

if (ventos22 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 23).setValue(ventos22);
} 

if (ventos22 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 23).setValue(ventos22);
} 

if (ventos23 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 24).setValue(ventos23);
} 

if (ventos24 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 25).setValue(ventos24);
} 

if (ventos25 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 26).setValue(ventos25);
}   
  
 if (ventos26 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 27).setValue(ventos26);
}
  
  if (ventos27 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 28).setValue(ventos27);
}
  
if (ventos28 != "q1w2e3r4t5y5"){
therewasachange= "yes";
sh .getRange(eventrow+1, 29).setValue(ventos28);
}
  
if   (validationissue != "yes"){
var eventrow= "Event Modified,refresh?";
}else { 
var eventrow= "Error event data validation issue"; 
}
}
return eventrow;
}


