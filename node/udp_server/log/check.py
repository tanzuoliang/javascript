#!/usr/bin/python

import os,sys,json

fileName = raw_input("input file\n")
if not os.path.exists(fileName):
	print "No such file or directory: %s"%fileName
	sys.exit()
with open(fileName,"r") as f:
	lastTime = 0
	lastFrameIndex = 0
	for line in f.readlines():
		line = line.replace("\n","")
		if "because" in line:
			print line
			continue
		jsonData = json.loads(line)
		if lastTime == 0:
			lastTime = jsonData[0][1]
			lastFrameIndex = jsonData[0][0]
		else:
			curTime = jsonData[0][1]
			passTime = curTime - lastTime
			print "from %d to %s pass time %d"%(lastFrameIndex,jsonData[0][0],passTime)
			lastTime = curTime
			lastFrameIndex = jsonData[0][0]