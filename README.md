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
   * [Fab Lab APIs](#fablab-apis)
     + [Versioning](#versioning)
     + [Supported formats](#supported-formats)
     + [Error management](#error-management)
     + [On-line documentation](#on-line-documentation)
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
This software has been tested on a Raspberry Pi III Model B (amrv7 32-bit architecture) with a 8-GByte SD card. We strongly recommend using this Raspberry Pi model to avoid possible compilation errors of the GPIO module. You need at least 150 MBytes of free disk space to install the software.
You also need to connect to your Raspberry Pi a current sensor to monitor the connected machine. You can find sensor specifications <a href="#hardware-architecture">here</a>.
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
