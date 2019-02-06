TUXEDO Control Panel

WORK IN PROGRESS

Designed for convenient changing colours of Tuxedo Notebooks' keyboard backlight.
It was tested on N85EJEK notebook with 3 sections of RGB backlight.
tuxedo_controller.out requires SUID and has to be root owned in order to have privileges to write sysfs node.
In case of wrong privileges or wrong tuxedo module installation an error will be logged "Failed to access file".

This extension will work only with tuxedo keyboard module by tuxedochris which you can get on github.
https://github.com/tuxedocomputers/tuxedo-keyboard

Extras: spawning command line reference:
https://github.com/GNOME/gnome-shell/blob/master/js/misc/util.js
