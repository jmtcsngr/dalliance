#################################
Dalliance with NPG_Ranger support
#################################

About
=====

This fork of the original `Dalliance <https://github.com/dasmoth/dalliance>`_
(v0.13.x) adds support for tracks based on the streaming API of the
`GA4GH <http://ga4gh.org>`_ initiative (GA4GH Directory API and Streaming). Data in
BAM format from the streaming API differs from previously supported BAM tracks
because it lacks of an index (BAI file). Ranges are specified in a specially crafted
request to the API. From the API response is possible to build a BAM file with data
included in the range.

The abstraction of the *GA4GH streaming API* is provided by a Node.js http client
developed as part of the `NPG Ranger <https://github.com/wtsi-npg/npg_ranger>`_
package.

The support for the new track is compatible with previously available tracks. It
should be possible to display them side by side.

This version of dalliance has been tested with a number of available *GA4GH streaming
API* compliant servers.

Requirements
============

This software relies on Node.js, npm and Gulp to build sources and generate a bundle.
It has been tested with a modern version (4.4.2) of Node.js.

Install
=======

Cloning source from github

::

 $ git clone -b npg_ranger_master https://github.com/wtsi-npg/dalliance.git && cd dalliance

Install npm dependencies

::

 $ npm install

Build bundle

::

 $ ./node_modules/.bin/gulp

Development
===========

Clone sources from github

::

 # Clone the project and chekcout the branch
 $ git clone -b [branch] https://github.com/[github_account]/dalliance.git && cd dalliance

 # e.g.
 $ git clone -b npg_ranger_devel https://github.com/wtsi-npg/dalliance.git && cd dalliance

If you are testing non-published versions of npg_ranger, we recommend you to
configure the environment to work with an isolated npm stack.

::

  export NPM_CONFIG_PREFIX="${HOME}/.dalliance_npm-packages"

Move one folder up clone npg_ranger and let npm requiring npg_ranger package
can resolve to this folder

::

  $ cd ..
  $ git clone -b [branch] https://github.com/[github_account]/npg_ranger.git && cd npg_ranger
  $ npm link

Move back to dalliance, link to the development version of npg_ranger and
install dependencies.

::

  $ cd ../dalliance
  $ npm link npg_ranger
  $ npm install

Modify and build the project as necessary

::

  # e.g.
  $ ./node_modules/.bin/gulp

After you finish, remember to remove the project specific stack from environment
and probably flush things created in that location

::

  $ unset NPM_CONFIG_PREFIX

Progress
========

* Can display data from **GA4GH** streaming API compliant servers
* Can display data directly from **NPG Ranger**
* Can display side by side data from other supported sources and data from
  **GA4GH**/**NPG Ranger**
* User can add new **GA4GH** tracks using *GA4GH* option in add tracks menu
* Works with Apache basic auth
* References in 2bit format (output from faToTwoBit distributed as part of
  `Blat software package <https://genome.ucsc.edu/goldenPath/help/blatSpec.html>`_)
* Basic cache for zoom in, delay/accumulate multiple fast zooming (out) requests
  to mitigate risk of flooding server

Pending
=======

#. A way for the user to switch reference may be needed. Have gui to specify
   reference?

#. Cache is currently cleaning itself considering only number of regions in
   cache. Because different regions may have different densities of features,
   we may want to limit cache also by max number of features.
