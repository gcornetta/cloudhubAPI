[![Build Status](https://travis-ci.com/gcornetta/cloudhubAPI.svg?branch=master)](https://travis-ci.com/gcornetta/cloudhubAPI)
[![Known Vulnerabilities](https://snyk.io/test/github/gcornetta/cloudhubAPI/badge.svg)](https://snyk.io/test/github/gcornetta/cloudhubAPI)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![NEWTON BANNER](/docs/images/banner.png)

# Fab Lab Modules: Cloud Hub
<p align="justify">
This software is part of a larger suite of microservices designed to remotely manage digital fabrication equipment in a loosely coupled and distributed environment. More specifically, the software in this repo implements the <b>Cloud Hub</b>; namely the central node of the NEWTON Fab Labs spoke-hub architecture. The Cloud Hub is in charge to keep and update a registry of all the connected Fab Labs and to route the incoming fabrication requests from the connected clients to that Fab Lab that is geographically closer to the Fab Lab that is geographically closer to the issuer of the request. 
</p>

# About
<p align="justify">
  This software has been developed by <em>Gianluca Cornetta</em> and <em>Javier Mateos</em> within <b>NEWTON</b> project. <b>NEWTON</b> is a large scale Integrated Action, started in March 2016 and scheduled to end in summer 2019, funded by the European Commission under the Horizon 2020 Researh and Innovation Programme with grant agreement n. 688503.
</p>

# Table of contents

1. [Preliminary steps](#preliminary-steps)
   * [Hardware prerequisites](#hardware-prerequisites)
   * [Software prerequisites](#software-prerequisites)
   * [Installation](#installation)
2. [Software architecture](#software-architecture)
3. [Documentation and developer support](#documentation-and-developer-support)
   * [The Fab Lab object](#fablab-object)
   * [Versioning](#versioning)
   * [Supported formats](#supported-formats)
   * [Pagination and partial response](#pagination)
   * [Search](#search)
   * [Error management](#error-management)
   * [API responses](#api-responses)
4. [Websites](#websites)
5. [Contribution guidelines](#contribution-guidelines)
6. [License](#license)

<a name="preliminary-steps"></a>
# Preliminary steps
<p align="justify">
Before installing the software you have to make sure that you comply with the hardware and software requirements specified in the next two sections.
</p>

<a name="hardware-prerequisites"></a>
## Hardware prerequisites
<p align="justify">
We recommend installing this software on an AWS <b>m4.large</b> EC2 instance or equivalent with at least 80GB Hard disk.
</p>

<a name="software-prerequisites"></a>
## Software prerequisites
<p align="justify">
The Machine wrapper software requires that you previously install on your system the following software packages:
</p>

1. Node.js >= v8.x
2. npm >= v6.x
3. Mongo DB v3.x

<p align="justify">
We have not tested the software with Mongo DB latest version; however it should work without any problem if you update <b>mongoose</b> to the last version in the `package.json` file with the project dependencies.
</p>

<a name="installation"></a>
## Installation
To install the Machine Wrapper module go through the following steps:

1. download or clone this repo,
2. run `npm install` in the installation folder,
3. run `npm run start` to start the server.

<p align="justify">
We have not tested the software with Mongo DB latest version; however it should work without any problem if you update <b>mongoose</b> to the last version in the `package.json` file with the project dependencies
</p>

<a name="installation"></a>
## Installation
To install the Machine Wrapper module go through the following steps:

1. download or clone this repo,
2. run `npm install` in the installation folder,
3. run `npm run start` to start the server.

<p align="justify">
  The server will listen to <b>port 3000</b>.
</p>

<a name="software-architecture"></a>
# Software architecture
<p align="justify">
The Cloud Hub business software implements the application logic end exposes the main services through a set of REST APIs. Fig. 1 depicts the architecture of the Cloud Hub software. The application business logic is implemented on top of middleware functions that implement:
1.	The API server logic.
2.	The database wrapping logic.
3.	The microservice interface (to manage communications with the Service Registry and the Service Monitor modules).
The persitence layer is built on top of MongoDB NoSQL data base.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/cloud-hub-software.png" alt="CLOUD HUB SOFTWARE"/>
    <figcaption>Fig. 1 - Cloud Hub Software Architecture.</figcaption>
  </p>
</figure>


<a name="documentation-and-developer-support"></a>
# Documentation and developer support
<p align="justify">
The Cloud Hub APIs expose the underlying Fab Lab network as software service over the internet and represent the interface between the Fab Lab cloud and third-party applications and platforms allowing the possibility to seamlessly implement complex multi-cloud architecture that communicates and synchronize through APIs.  
</p>

<p align="justify">
The Cloud Hub APIs provide software methods that can be exploited to remotely control the whole Fab Lab network using custom interfaces. 
In our specific case, we expose a single object that represents a snapshot of the Fab Lab status and of the available fabrication resources.  Table 1 displays the resource URI and the implemented HTTP verbs for some of the APIs. 
</p>

<table>
  <caption>Table 1: Fab Lab APIs</caption>
  <tr>
    <th>Resource</th>
    <th>GET</th>
    <th>POST</th>
    <th>PUT</th>
    <th>DELETE</th>
  </tr>
  <tr>
    <td>/fablab/1234</td>
    <td>Shows the Fab Lab with the specified id if it exists</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
  </tr>
  <tr>
    <td>/fablabs</td>
    <td>Show all the Fab Labs</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
  </tr>
  <tr>
    <td>/fablabs/jobs?machine=laser%20cutter&process=cut&lat=xx&long=yy</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Submit a job to the Fab Lab closest to the specified coordinates</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
  </tr>
  <tr>
    <td>/fablabs/1234?job=1235</td>
    <td>Shows the status of the specified job if it exists; otherwise displays an error (Not found)</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Delete a job if it exists; otherwise displays an error (Not found</td>
  </tr>
</table>

<p>
The POST method supports <b>multipart/form-data</b> to upload the design file to the Cloud Hub server.
</p>

<a name="fablab-object"></a>
# The Fab Lab object
A Fab lab is modelled by a JSON object that includes the following information: 

1.	The Fab Lab contact information, geographic position and service URL. 
2.	The machines information (including type, vendor, status and queued jobs). 
3.	The materials information (including type and quantity). 

The Fab Lab JSON object is the following:

```
"fablab": {
    "id": "The Fab Lab unique identifier",
    "name": "The Fab Lab name",
    "web": "The Fab Lab web page url",
 "api": "The API endpoint of the Fab Lab gateway",
    "capacity": "% of the total Fab Lab fabrication capacity", 
    "address": {
      "street": "The Fab Lab address",
      "postCode": "The postcode",
      "state": "The state or province", 
      "country": "The country",
      "countryCode": "State or country code"
    }, 
    "coordinates": {
      "latitude": "The Fab Lab latitude", 
      "longitude": "The Fab Lab longitude"
    }, 
    "contact": {
      "name": "Name of the contact person", 
      "charge": "Charge of the contact person", 
      "email": "Email of the contact person"
    }, 
    "openingDays": [
      {
       "day": "Day of the week", 
       "from": "Opening hour", 
       "to": "Closing hour"
      }
    ], 
    "equipment": [
      {
       "id": "The machine connection identifier",
       "type": "Machine type",
       "vendor": "Machine vendor",
       "name": "Machine name",
       "status": "Machine status",
       "jobsQueued": "The number of queued jobs"
      }
    ], 
    "materials": [
      {
       "type": "Material type",
       "quantity": "% of available stock"
      }
    ] 
  },
  "jobs": {
    "running": "Number of total running jobs", 
    "queued": "Number of total queued jobs", 
    "details": [
     {
      "machineId": "The machine connection id",
      "type": "Machine type", 
      "vendor": "Vendor", 
      "jobs": [
        {
         "id": "Job id",
         "status": "Job status",
         "process": "Type of fabrication process", 
         "queue": "Local or global queue",
         "queuePosition": "Position in queue"
        }
      ]
     }
    ]
  }
}
```
<p align="justify">
The object is self-explanatory. Observe that the machine status may assume the following values: <b>undefined</b>, <b>off</b>, <b>idle</b>, <b>busy</b>. Conversely, the job status may assume the following values: <b>running</b>, <b>completed</b>, <b>pending</b>, <b>approved</b>, <b>cancelled</b> (either by the user or the Fab Lab administrator). The supported materials are: <b>vinyl</b>, <b>wood</b>, <b>mylar</b>, <b>copper</b>, <b>cardboard</b>. The supported machine types are: <b>vinyl cutter</b>, <b>laser cutter</b>, <b>3D printer</b>, <b>milling machine</b>. The supported fabrication processes are: <b>cut</b>, <b>halftone</b>, <b>wax</b>. The process field is set to null for jobs sent to 3D printers. Finally, the supported vendors are: <b>epilog</b>, <b>prusa</b>, <b>gcc</b>, <b>roland</b>.
</p>

<a name="versioning"></a>
## Versioning

API versioning is not mandatory for Cloud Hub APIs.

<a name="supported-formats"></a>
## Supported formats

APIs only support JSON format; however, they are designed to implement content negotiation and to support more formats in the future. Content negotiation is implemented using a query parameter in the resource URI rather than using the accept field in the incoming HTML request, namely:

```
/fablabs/1234/?format=json
```

`?format=json` is the default value, so if no format is specified in the query parameter of the resource URI, server response will be in JSON.

<a name="pagination"></a>
## Pagination and partial response

_Partial response_ allows to give the developers just the information they need from the API. For example:
```
/fablabs/1234?fields=id,name,api
```
displays just the **id**, the **name** and the **api** fields of the Fab Lab JSON object. 

_Pagination_ allows to return just part of the database content using the limit and the offset parameters. For example:

```
/fablabs?limit=20&offset=30
```
<p align="justify">
gets 20 database records from 30 to 50. The server response should also include metadata to specify the total number of records available. If no limit and offset parameters are specified the default query values are <code>limit=10&offset=0</code>.
</p>  

<a name="search"></a>
## Search

<p align="justify">
Both simple and scoped searches are supported using the verb <b>q</b>. Global searches across resources are not supported since our implementation has a single resource (i.e. the Fab Lab object). A simple search can be performed as follows:
</p>

```
/fablabs?q=laser%20cutter+epilog
```
<p align="justify">
The previous query returns all the fab labs that have an epilog laser cutter. To perform a scoped search, one can use the following query:
</p>

```
/fablabs/12345/jobs?q=laser%20cutter+queue
```
<p align="justify">
The previous query returns all the queued jobs on all the laser cutters of the fab lab whose <b>id</b> is <b>12345</b>.
The search results can be explicitly formatted using a parameter in the query string. If this parameter is omitted, the server will return a response in the default format (i.e. JSON). Observe that this feature is implemented only for future improvements since the only format supported by the API server is JSON. To specify the output format, use the following URI:
</p>

```
/fablabs?format=json&q=laser%20cutter+epilog
```
<p align="justify">
Finally, observe that the ‘+’ character in the resource URI is automatically converted into a blank space (code <code>%20</code>) when the URI is parsed by the server middleware. In order to override this behaviour and to allow the expected operation of the business logic on the server side, the ‘+’ character is encoded (code <code>%2B</code>); thus, for example, the previous resource URI is encoded as:
</p>

```
/fablabs?format=json&q=laser%20cutter%2Bepilog
```

<a name="error-management"></a>
## Error management

The API error codes will match HTTP codes. The following cases are managed:

1.	Everything worked (_success_): **200–OK**.
2.	The application did something wrong (_client error_): **400–Bad Request**. 
3.	The API did something wrong (_server error_): **500–Internal Server Error**.

<p align="justify">
In the case of <b>client error</b>, the server will return in the response a JSON object with error details and hints to correct it. The message has the following format:
</p>

```
{“message”: “verbose error explanation”, “errorCode”: 12345, “infoLink”: “link to the developer suppor page”}
```
The object must redirect to a web page with hints to developers on how to solve the issue.

<p align="justify">
The error management system must also handle the case in which the client intercepts HTTP error versions (this is the case of some versions of Adobe Flash). In order to allow the developer to intercept error codes, the resource URI must have an optional flag (by default set to <code>false</code>) to suppress response error codes. When this flag is true the HTTP response will be always <code>200 –OK</code> and the response will contain a JSON object with the error details. To enable error code suppression, you can use a query in the resource URI as follows:
</p>

```
/fablabs/1234?suppress_response_codes=true&job=1235
```

<p align="justify">
We use Twitter API style; thus, the URI is deliberately verbose to highlight the effect on the response codes. The server response contains a JSON object with the error details, for example:
</p>

```
{“error”: “Unable to delete. The job you specified does not exist.”}
```

<a name="api-responses"></a>
## API responses

### Tell me about a partcular Fab Lab

```
GET /fablabs/1234
```

_Response_:

```
200 OK

{
“fablab”: {
  “id”: 1234
  .... 
},
 “jobs”: {
  ....
 }
}

```

### Tell me about all the Fab Labs

```
GET /fablabs
```

_Response_:

```
200 OK

{
“fablabs”: [
 {
  “fablab”: {
    “id”: 1234
    .... 
  },
  “jobs”: 
  {
   ....
  }
 },
 {
  “fablab”: {
    “id”: 1235
    .... 
  },
  “jobs”: {
   ....
  }
 }
],
“_metadata”: [
  {“totalCount”: 500, “limit”: 10, “offset”: 0}
]}

```
Observe that the response also includes a **\_metadata** object with the following fields:

1. `totalCount`: the total number of records in the database
2. `limit`: the number of records displayed in the response
3. `offset`: the offset with respect the first element of the database (an offset of 0 means that the records are displayed starting from the first element of the database)

### Submit a job

```
POST /fablabs/jobs?machine=laser%20cutter&process=cut&material =wood&lat=xx&long=yy
```

_Response_:

```
200 OK

{
 “fablab”: {
   “id”: 1234
   “name”: “Fab Lab Name”
   “address” : {....},
   “coordinates”: {....},
   “contact”: {....},
   “openingDays”: {....}
  },
  “job”: {
    “id”: 1235,
    “status”: “pending”,
    “process”: “cut”,
    “queue”: “global”,
    “queuePosition”: 1,
    “machine”: {
      “machineId”: 12345,
      “type”: “laser cutter”,
      “vendor”: “Epilog”
    }
  }
}

```
<p align="justify">
Recall, that with this method a design file in <b>PNG</b> (i.e. a graphic format) or <b>GCODE</b> (i.e. a text format) format is uploaded on the server. In the case of PNG format, our API specifications correspond to the HTTP request depicted below.  
</p>

```
POST /fablabs/
Host: api.cloudhub.uspcloud.eu/uploads
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryqzByvokjOTfF9UwD
Content-Length: 204

------WebKitFormBoundaryqzByvokjOTfF9UwD
Content-Disposition: form-data; name="design"; filename="design.png"
Content-Type: image/png

File contents go here.

------WebKitFormBoundaryqzByvokjOTfF9UwD--
```

### Tell me about a job

```
GET /fablabs/1234?job=1235
```

_Response_:

```
200 OK

{
 “job”: {
   “id”: 1235,
   “status”: “pending”,
   “machine”: {....}
}
```

### Cancel a job

```
DELETE /fablabs/1234?job=1235
```

_Response_:

```
200 OK
```
