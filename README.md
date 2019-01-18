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
     + [Error management](#error-management)
     + [APIs responses](#api-responses)
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
    <td>Submit a job to the Fab Lab closest to the specified coordinates</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
  </tr>
  <tr>
    <td>/v1/fablabs/1234?job=1235</td>
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

