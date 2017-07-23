# LargeImageViewer

## Running Loris
Basically follow instructions on https://github.com/loris-imageserver/loris. (Use Python 2.7)
1. Download Kakadu libs: http://kakadusoftware.com/downloads/ (Look for Linux executables)
2. unzip <zipfile>
3. Copy libkdu_v78R.so to /usr/local/lib
4. Copy kdu_expand to /usr/local/bin
5. Git clone the loris repository, cd into it
6. In etc/loris2.conf, check if the lines for `kdu_expand` and `kdu_libs` and make sure the paths are set to ones above.
7. `adduser loris`, `sudo ./setup.py install` (more details in the official doc)
8. Install apache (follow the instructions on https://github.com/loris-imageserver/loris/blob/development/doc/apache.md
9. In case you aren't familiar with the command: `sudo service apache2 restart` (replace restart by start/stop if needed)
10. Copy the boto.py I sent separately to where loris is installed (on my system it is `/usr/local/lib/python2.7/dist-packages/Loris-2.0.0-py2.7.egg/loris/`)
11. Edit the [resolver] section in `/etc/loris2/loris2.conf` as follows:
```[resolver]
    #impl = 'loris.resolver.SimpleFSResolver'
    #src_img_root = '/usr/local/share/images'
        impl = 'loris.boto.S3Resolver'
        cache_root='/usr/local/share/images/loris'
        uri_resolvable = True
    aws_access_key_id = '<key_id>
    aws_secret_access_key = '<access_key>'
```
You might need to create cache_root.

At this point Loris server should be running and is ready to serve images from S3.

## SAServer + Mirador
1. Git clone this repository, cd into it
2. `cd mirador`
3. `rm -rf build/ && npm install && bower install && npm start` (You need to install npm and bower before running this - this will build Mirador and start a local server - once it runs Ctrl+C to exit - the build/ folder will now contain the latest build if you made changes)
4. `cp -r build/mirador/* ../SimpleAnnotationServer/src/main/webapp/mirador/`
5. `cd ../SimpleAnnotationServer && mvn jetty:run` This starts the SA server
6. `SimpleAnnotationServer/src/main/webapp` This folder contains the webapp SA runs. `demo.html` is what you see on the live site. It reads the manifest jsons in the same folder, which tells mirador where to serve the images from. Right now the URLs are all pointing to the live site - you can change it to `localhost:8888` to serve locally. 
