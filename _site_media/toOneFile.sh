#! /bin/bash

out=$1
if [ -e "$out" ];
then
	echo "output file exists"
fi

cat defaults.js >> $out
cat earray.js >> $out
cat genericgui.js >> $out
cat controller.js >> $out
cat classView.js >> $out
cat classfactory.js >> $out
cat baseview.js >> $out
cat classdeserializer.js >> $out
cat cs.js >> $out
cat main.js >> $out
cat baseToSerialize.js >> $out
cat collisions.js >> $out
cat connector.js >> $out
cat stylemanager.js >> $out
cat buttonmaker.js >> $out
cat idmanager.js >> $out
cat start.js >> $out
cat windowCreator.js >> $out
cat basegui.js >> $out
cat movemanager.js >> $out
cat resizer.js >> $out
cat serializator.js >> $out
cat deserializer.js >> $out
cat classObj.js >> $out
cat ct.js >> $out
cat tooltipmanager.js >> $out
cat widgetgenerator.js >> $out
cat classViewManager.js >> $out


cat asmModels.js >> $out
cat asmViews.js >> $out
cat asmfactory.js >> $out


