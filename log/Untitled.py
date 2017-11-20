#!/usr/bin/python

retMap = {}

def showFile(filename):
	retMap[filename] = []
	with open(filename,"r") as f:
		content = f.read()
		for a in content.split("#"):
			if not ":" in a:
				continue
			(server_id,serverFrameIndex,cnt,cost,envInfo) = a.split(":")
			retMap[filename].append((server_id,serverFrameIndex,cnt,cost,envInfo.split("|")))


showFile("4.txt")
showFile("60.txt")
cnt = 0
le = len(retMap["4.txt"])

for i in range(0,le):
	print "\n%d:**********"%i
	print "\t4:",retMap["4.txt"][i]
	print "\t60:",retMap["60.txt"][i]
#	cond = retMap["4.txt"][i][0] == retMap["60.txt"][i][0] and retMap["4.txt"][i][1] == retMap["60.txt"][i][1] and retMap["4.txt"][i][2] == retMap["60.txt"][i][2]
#	if not cond:
#		print "\n ---------------------------------------------------------------------------- \n"
	cond = retMap["4.txt"][i][3] == retMap["60.txt"][i][3]
	if not cond:
		print "----------------------------------------------------------------------------------------------------------------------------------------------------------------------------"
				