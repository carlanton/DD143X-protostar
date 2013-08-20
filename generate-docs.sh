#!/bin/bash

#
# Generates documentation
#

#
# Usage
#
function usage {
cat << EOF
usage: $0 options

Generates documentation.

OPTIONS:
   -a       All
   -js      JavaScript using Docco
   -java    JavaDoc
   -as      AsDoc
EOF
}


#
# JavaScript - docco
#
function generateDocco {
	if [ ! -f ~/node_modules/.bin/docco ]; then
		echo 'doccu was not found. JavaScript documentation will not be generated.'
		return 
	fi

	jsRoot="src/main/webapp/js"
	files="$jsRoot/collections/*.js $jsRoot/models/*.js $jsRoot/*.js $jsRoot/views/*/*.js"

	if [ -d docs ]; then
		rm -r docs
	fi
	
	~/node_modules/.bin/docco $files

	# Create index
	cd docs

	echo "<!doctype html>" > index.html
	echo "<head>
		<title>Client side documentation</title>
		<link rel='stylesheet' media='all' href='docco.css' />
		<style>
			a {display:block; float:left;margin: 5px; text-transform:uppercase}
			body {padding: 10%}
		</style>
	</head>" >> index.html

	echo "<h1>Client side documentation</h1>" >> index.html

	for f in *.html
	do
		echo "<a href='$f'>$(basename $f .html)</a>" >> index.html
	done

	cd ..
	
	if [ -d data/docs/jsdoc ]; then
		rm -r data/docs/jsdoc
	fi

	mv docs data/docs/jsdoc
}



#
# Serverside - JavaDoc
#
function generateJavadoc {
	mvn javadoc:javadoc

	if [ -f data/docs/javadoc ]; then
		rm -r data/docs/javadoc
	fi

	cp -rv target/site/apidocs data/docs/javadoc
}

#
# Microphone - asdoc
#
function generateAsdoc {
	if which asdoc &> /dev/null ; then
		if [ -d data/docs/asdoc ]; then
			rm -r data/docs/asdoc
		fi

		asdoc -source-path src/main/flex -doc-classes microphone -output data/docs/asdoc
	else
		echo asdoc was not found. No ActionScript documentation will be generated.
	fi
}

if [ $# -ne 1 ]; then
	usage
	exit 1
fi

case $1 in
	"-a")
		generateDocco
		generateJavadoc
		generateAsdoc
		;;
	"-as")
		generateAsdoc
		;;
	"-js")
		generateDocco
		;;
	"-java")
		generateJavadoc
		;;
	*)
		usage
		exit 1
		;;
esac
