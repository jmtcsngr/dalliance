#################################
Dalliance with NPG_Ranger support
#################################

About
=====

This fork of the original **Dalliance** adds support for interaction with a
`NPG Ranger <https://github.com/wtsi-npg/npg_ranger>`_ server. It was
branched from version 0.13.x.

Requirements
============

This software relies on Node.js, npm and Gulp for building sources and generating a bundle.
It has been tested with a moder version of nodejs (4.4.2).

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

* Can display data directly from **NPG Ranger** with a static genome reference
* Can display side by side data from other supported sources and data from
  **NPG Ranger**
* User can add new **NPG Ranger** tracks using *NPG Ranger* option in add tracks
  menu
* Works with Apache basic auth
* Our reference are supported if they are in 2bit format (output from
  faToTwoBit)
* Basic cache for zoom in, delay/accumulate multiple fast zooming (out) requests
  to mitigate risk of flooding server.

Pending
=======

#. Finalise work to be able to add **NPG Ranger** tracks. Currently you can add
   But we need a way to allow to change reference. Have gui to specify
   reference?

#. Using a single point of request (Apache) for static files and **NPG Ranger**
   (with reverse proxy).

   * Using a **NPG Ranger** server with CORS configuration should fix the issue.
     Does not seem to work properly if using Apache as reverse proxy. But it
     works if using direct requests.

#. Further work is needed to change references

   * Automatic reference from study?

#. Cache is currently cleaning itself considering only number of regions in
   cache. Because different regions may have different densities of features,
   we may want to limit cache also by max number of features.
