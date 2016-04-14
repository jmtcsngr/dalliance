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
* Can display side by side data from bam+bai and data from **NPG Ranger**
* User can add new **NPG Ranger** urls using *NPG Ranger* option in add tracks
  menu
* Works with Apache basic auth

Pending
-------

#. Finalise work to be able to add **NPG Ranger** tracks. Currently you can add
   But we need a way to allow to change reference. Have gui to specify
   reference?

#. Currently disabling security in browser to fetch data from different
   sources (bam+bai and static files vs **NPG Ranger** data).

   * Using a server with CORS configuration should fix the issue.
   * Using a single point of request (Apache) for static files and
     **NPG Ranger** should fix without any coding required.

#. Further work is needed to change references

   * Format our references so they are compatible with browser (bigbed)
   * Which references?
   * Where to put them?
   * Allow user to select reference?
   * Automatic reference from study?

#. Glitch when requesting more than one region before the view is updated

