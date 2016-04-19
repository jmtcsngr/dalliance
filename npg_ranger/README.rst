#################################
Dalliance with NPG_Ranger support
#################################

About
-----

This fork of the original **Dalliance** adds support for interaction with a
`NPG Ranger <https://github.com/wtsi-npg/npg_ranger>`_ server. It was 
branched from version 0.13.x.

Progress
--------

* Can display data directly from **NPG Ranger** with a static genome reference
* Can display side by side data from other supported sources and data from 
  **NPG Ranger**
* User can add new **NPG Ranger** tracks using *NPG Ranger* option in add tracks
  menu
* Works with Apache basic auth
* Our reference are supported if they are in 2bit format (output from
  faToTwoBit)

Pending
-------

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

#. Glitch when requesting more than one region before the view is updated

#. Regresion for cache and not requesting regions already in viewer (zooming in)
