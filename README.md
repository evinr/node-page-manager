# node-page-manager
This is a way to dynamically control a set of pages with embedded configurations files. 

## Usage
This app relies on a folder/file structure that is similar to what is found in the Apps folder.

Apps: Contains all of the applications/pages that need to be managed

Apps/*: These are the individual app files.

Config File: Contains the human readable name, the explanation, and the link to the actual file ( apps/application_1/index.html ).

Apps
   Application 1
       Config File
       HTML Resource
   Application 3
       Config File
       HTML Resource
   Application 3
       Config File
       HTML Resource
