#! /bin/bash

tmpJsFile=out.js
outFile=diagramscode003.js

prodDir=../site_media/

# if production dir exists - remove it with all it's contests
if [ -d "$prodDir" ];
then
	echo "production directory: $prodDir exists. removing."
	rm $prodDir -rf
fi
mkdir $prodDir


# first - create output script
if [ -e "$tmpJsFile" ];
then
	echo "tmp file: $tmpJsFile exists. removing."
	rm $tmpJsFile
fi

echo "started creating tmp file: $tmpJsFile"
./toOneFile.sh $tmpJsFile
echo "successfull."

# compile output file
if [ -e "$outFile" ];
then
	echo "output script file: $outFile exists.removing."
	rm $outFile
fi

echo "started compiling tmp file: $tmpJsFile to output file: $outFile"
java -jar compiler.jar  --compilation_level SIMPLE_OPTIMIZATIONS --js $tmpJsFile --js_output_file $outFile
echo "successfull."



echo "started copying media files and scripts"
# copy necessary files
# copy diagramming script
cp $outFile $prodDir
# copy folders related to forum application
cp forum openid $prodDir -r
# copy css dir
cp css $prodDir -r
# copy robots.txt
cp robots.txt $prodDir
# copy stylesheets
cp *.css $prodDir
# copy images
cp *.png $prodDir
cp *.gif $prodDir
echo "successfull."
