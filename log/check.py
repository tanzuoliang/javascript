#!/usr/bin/python
#encoding=utf-8

import os,json,sys
reload(sys)
sys.setdefaultencoding("utf-8")


class PraserLog(object):
	
	def __init__(self,logPath):
		
		self.line = "%s:------------------------------------------------------------------------------------------------------------------\n"
		
		self.logPath = logPath
		with open(self.logPath,"r") as f:
			self.jsonData = json.load(f)
		self.action = self.jsonData["getAction"]
		self.hitItem = self.jsonData["hitItem"]
		self.dead = self.jsonData["dead"]
		self.exeAction = self.jsonData["exeAction"]
		self.buff = self.jsonData["buff"]
		self.hurt = self.jsonData["hurt"]
		self.errorBuf = self.jsonData["error"]
		self.bullet = self.jsonData["bullet"]
		self.AI = self.jsonData["ai"]
		
		if "timeine" in self.jsonData:
			self.timeLine = self.jsonData['timeine']
			
		if 'ai_exe' in self.jsonData:
			self.ai_exe = self.jsonData['ai_exe']
			
		if 'post_cmd' in self.jsonData:
			self.post_cmd = self.jsonData['post_cmd']
		
		if 'seed' in self.jsonData:
			self.seed = self.jsonData['seed']			
		
	
	def showExeAction(self,fi=0,to=0,server_id=-1):
		#tank.RoomModel.updateIndex,serverFrame,action
		ret = "exeAction:---------------------------------------------------------------\n"
		if to == 0:
			to = len(self.exeAction)
		for data in self.exeAction:
			if len(data[2]) > 0 and data[1] >= fi and data[1] <= to:
				msgData = json.dumps(data[2])
				cond_a = server_id == -1 or server_id in msgData
				if cond_a:
					ret += "exe logIndex : %d\t serverFrame : %d\taction = %s\n"%(data[0],data[1],msgData)
			
		print ret	
	
	def showBuff(self):
		ret = "buff:---------------------------------------------------------------\n"
		#server_id,buff_id,tank.RoomModel.updateIndex
		for data in self.buff:
			ret += "buff logIndex : %d  %s get buff %s\n"%(data[2],data[0],data[1])
		print ret	
			
	def showHurt(self,fi=-1,ti=-1):
		ret = "tankHit:---------------------------------------------------------------\n"
		cnt = 0
		
		for data in self.hurt:
			cond_a = fi == -1 or data[3] >= fi
			cond_b = ti = -1 or data[3] <= ti
			if cond_a and cond_b:
				ret += "%d\ttankHit logIndex : %d\t serverFrame : %d\ttank %s\tbeHit %d\n"%(cnt,data[2],data[3],data[0],data[1])	
			cnt += 1
		print ret				
	
	def showHitItem(self):
		ret = "hitItem:---------------------------------------------------------------\n"
		for data in self.hitItem:
			(hp,blood,skill_type) = data[1].split("_")
			ret += "hitItem logIndex : %d\titem %s\thp = %s\tblood = %s\tskill_type = %s\n"%(data[2],data[0],hp,blood,skill_type)
		print ret	
		
	def showCmdCost(self):
		ret = self.line%"cost"
		for data in self.jsonData["cmdTime"]:
			ret += "cost %d\n"%data
		print ret		
		
	def compareAction(self,other):
		l = min(len(self.action),len(other.action))
		for i in range(0,l):
			leftData = json.dumps(self.action[i][2])
			rigthData = json.dumps(other.action[i + 1][2])
			if leftData != rigthData:
				print i,leftData,rigthData
		
	def showAction(self,fi=0,ti=0,cut = False):
		ret = "action:---------------------------------------------------------------\n"
		lastIndex = -1
		lastLogIndex = -1
		lastServerIndex = -1

		for data in self.action:
			cond_a = fi == 0 or data[1] >= fi
			cond_b = ti == 0 or data[1] <= ti
			cond_c = cut == False or len(data[2]) > 0
			if cond_c > 0 and cond_a and cond_b:
				passLoginIndex = 0
				passServerIndex = 0
				if lastLogIndex > -1:
					passLoginIndex = data[0] - lastLogIndex
					passServerIndex = data[1] - lastServerIndex
				
				lastLogIndex = data[0]
				lastServerIndex = data[1]
				if passLoginIndex < 1:
					ret += "--------------------------------------------------------------------------------------------------------------------------%d\n"%data[0]
				ret += "action logIndex : %d\tserverFarme : %d\t passLoginIndex = %d\tgetMessageFromServer : %s\n"%(data[0],data[1],passLoginIndex, json.dumps(data[2]))
#				if lastIndex > -1:
#					delta = data[1] - lastIndex
#					if delta > 1:
#						ret += "-------loseData %d\n"%delta
				
				lastIndex = data[1]	
		print ret		
			
	def showDead(self):
		ret = self.line%"dead"
		for data in self.dead:
			print data
			ret += "dead logIndex : %d\t serverFrame : %d\t%s kill %s\n"%(data[2],data[3],str(data[0]),str(data[1]))
		print ret
		
	def showError(self,fi=0,ti=0):
		ret = "error:---------------------------------------------------------\n"
		for data in self.errorBuf:
			cond_a = fi == 0 or data[2] >= fi
			cond_b = ti == 0 or data[2] <= ti
			cond_c = not "__AIUpdateFrameAction__" in data[0]
			if cond_a and cond_b and cond_c:
				ret += "error logIndex : %d\t serverFarme : %d\t %s\n"%(data[1],data[2],data[0])
				
		print ret
		
#	def showAIExe(self,server_id=-1,printInfo = True):
#		ret = self.line%"ai_exe"
#		retMap = {}
#		for data in self.ai_exe:
#			cond_a = server_id == -1 or server_id == data[0]
#			if cond_a:
#				if not data[3] in retMap:
#					retMap[data[3]] = {}
#				if not data[2] in retMap[data[3]]:
#					retMap[data[3]][data[2]] = {}
#				
#				if not data[0] in retMap[data[3]][data[2]]:
#					retMap[data[3]][data[2]][data[0]] = []
#				retMap[data[3]][data[2]][data[0]].append(data[1])
#		info = 	json.dumps(retMap,indent=2)
#		if printInfo == True:
#			print ret
#			print info
#		return info				
	def showAIExe(self,server_id=-1,printInfo = True):
		ret = self.line%"ai_exe"
		retMap = {}
		for data in self.ai_exe:
			cond_a = server_id == -1 or server_id == data[0]
			if cond_a:
				if not data[0] in retMap:
					retMap[data[0]] = []
				retMap[data[0]].append("%s logIndex = %d"%(data[1],data[3]))
		info = 	json.dumps(retMap,indent=2)
		if printInfo == True:
			print ret
			print info
		return info		
							
	
	def showEnv(self):
#		_map = {}
		for data in self.jsonData['env']:
			(player,item) = data[0].split("!")
			info = "------------------------------------------------------logindex %d\nplayer:\n"%data[1]
			for data in player.split("|"):
				l = data.split(":")
				info += "server_id = %s,x = %d,y = %d,hp = %d,delete = %d,dir = %d\n"%(l[0],l[1],l[2],l[3],l[4],l[5])
			info += " item:\n"
			for data in item.split(":"):
				l = data.split(":")
				info += "key = %s,hp = %d"%(l[0],l[1])
		print info			
		
		
	def showBullet(self,fi=0,ti=0):
		ret = "bullet:-------------------------------------------------------\n"
		_map = {}
		for data in self.bullet:
			cond_a = fi == 0 or data[2] >= fi
			cond_b = ti == 0 or data[2] <= ti
			if cond_a and cond_b:
				if not data[2] in _map:
					_map[data[2]] = {}
				if not data[1] in _map[data[2]]:
					_map[data[2]][data[1]] = []	
				ret += "bullet logIndex : %d\t serverFarme : %d\t %s\n"%(data[1],data[2],data[0])
				_map[data[2]][data[1]].append("bullet_id:%s"%data[0])
				
#		print ret
		
		print json.dumps(_map,indent=2)
		return _map
		
	def compareBullet(self,other):
		l = min(len(self.bullet),len(other.bullet))
		for i in range(0,l):
			leftInfo = str(self.bullet[i][2]) + ":" + self.bullet[i][0]	
			rightInfo = str(other.bullet[i][2]) + ":" + other.bullet[i][0]
			if not self.bullet[i][0] == other.bullet[i][0]:
				print "----------------------------------- ",i
				print leftInfo,"      |      " ,rightInfo
		
	def showAI(self,server_id=-1,fi=0,ti=0,printF = True):
		ret = "ai:-------------------------------------------------------\n"
		_map = {}
		for data in self.AI:
			cond_a = fi == 0 or data[2] >= fi
			cond_b = ti == 0 or data[2] <= ti
			cond_c = server_id == -1 or data[0] == server_id
			if cond_a and cond_b and cond_c:
				if not data[3] in _map:
					_map[data[3]] = []
				ret += "ai logIndex : %d\t serverFarme : %d\t AI server_id : %s\t  create action : %s\n"%(data[2],data[3],data[0],self.actionDesc(data[1]))
				_map[data[3]].append("AI server_id : %s  create action : %s"%(data[0],self.actionDesc(data[1])))
				
#		print ret
		r = json.dumps(_map,indent=2)
		if printF:
			print r
		return _map
		
		
	def showAICost(self):
		ret = self.line%"aiCost"
		for data in self.jsonData["aiCost"]:
			ret += "logindex = %d cost = %d\n"%(data[1],data[0])
		print ret	
				
#	def showAICost(self):
#		if "aiCost" in self.jsonData:
##			_map = {}
#			timeList = []
#			d  = self.jsonData["aiCost"]
#			for data in d:
#				if data[0] > 3:
##					if not data[1] in _map:
##						_map[data[1]] = []
#						
##					_map[data[1]].append("AI cost time \t%d"%(data[0]))
#					timeList.append((data[0],data[1]))
#			
#			timeList = sorted(timeList,cmp=lambda a,b:cmp(a[0],b[0]) * -1)
##			print json.dumps(timeList,indent=2)	
#			cnt = 0
#			info = ""
#			for l in timeList:
#				if cnt > 10:
#					print info
#					info = ""
#					cnt = 0
#				info += "(" + str(l[0]) + ", " + str(l[1]) + ")\t"
#				cnt += 1
					
		
	def compareAI(self,other):
		leftAI = self.showAI(printF = False)
		rightAI = other.showAI(printF = False)
		l = min(len(leftAI),len(rightAI))
		for i in range(0,l-1):
			if i in leftAI and i in rightAI:
				if json.dumps(leftAI[i]) == json.dumps(rightAI[i]):
					continue
				print "-------------------------------------------------------------------------",i
				le = min(len(leftAI[i]),len(rightAI[i]))
				for k in range(0,le):
					leftData = json.dumps(leftAI[i][k])
					rightData = json.dumps(rightAI[i][k])
					if not leftData == rightData:
						print "***************************************" ,k
						print self.logPath,leftData
						print other.logPath,rightData	
		
		
	def showTimeLine(self):
		ret = "timeLine:----------------------------------------------------\n"
		for data in self.timeLine:
			ret += "time logIndex : %d\t serverFrame : %d\t msg : %s \n"%(data[1],data[2],data[0])
		
		print ret		
		
	
	def showSeed(self):
		ret = self.line%"seed"
		for data in self.seed:
			ret += data
		print ret	
		
	def showPostCMD(self):
		ret = self.line%"post_cmd"
		last_time = 0
		for data in self.post_cmd:
			print data
			continue
			if last_time == 0:
				last_time = int(data[2])
			cost_time = int(data[2]) - last_time
			last_time = int(data[2])
			ret += "post_cmd logIndex %d\t time %s\tmsg : %s\t pass:%d\n"%(data[1],data[2],data[0],cost_time)
					
		
		print ret
		
	def showMove(self):
		ret = self.line%"move"
		retMap = {};
		for data in self.jsonData["fiMove"]:
			if not data[1] in retMap:
				retMap[data[1]] = []
			retMap[data[1]].append(" %s logindex = %s"%(data[0],str(data[2])))
		print json.dumps(retMap,indent=2)		
	
	def actionDesc(self,msg):
		dirName = ("","right","down","left","up")
		(action,_dir) = msg.split("_")
		ret = ""
		if action == "1":
			ret = " " + dirName[int(_dir)] + " [turnAround]"
		elif action == "2":
			ret = " " + dirName[int(_dir)] + " [move]"
		elif action == "3":	
			ret = " " + dirName[int(_dir)] + " [launch]"	
		return ret			
#-------------------------------------- compare ---------------------
	def compareExeAction(self,other):
		count = 0
		for data in self.exeAction:
			otherData = other.exeAction[count]
			a = json.dumps(data[2])
			b = json.dumps(otherData[2])
			if not a == b:
				print "exeAction error\t", a,b
			count += 1
		print "compareExeAction complete......."	
			
	def compareHitItem(self,other):
		count = 0
		for data in self.hitItem:
			a = json.dumps(data)
			if count == len(other.hitItem):
				break
			otherData = other.hitItem[count]
			b = json.dumps(otherData)
			if not data[0] == otherData[0] or not data[1] == otherData[1]:
				print "error hititem\t",a,b
			count += 1
		print "compareHitItem complete......."
			
	def compareHitTank(self,other):
		count = 0
		for data in self.hurt:
			a = json.dumps(data)
			if count == len(other.hurt):
				break
			otherData = other.hurt[count]
			b = json.dumps(otherData)
			if not data[0] == otherData[0] or not data[1] == otherData[1]:
				print "error hitTank\t",a,b
			count += 1
		print "compareHitTank complete......."
			
	def compareBuff(self,other):
		count = 0
		for data in self.buff:
			a = json.dumps(data)
			otherData = other.buff[count]
			b = json.dumps(otherData)
			if not data[0] == otherData[0] or not data[1] == otherData[1]:
				print "error buff\t",a,b
			count += 1
		print "compareBuff complete......."
								
	def compareDead(self,other):
		count = 0
		for data in self.dead:
			a = json.dumps(data)
			otherData = other.dead[count]
			b = json.dumps(otherData)
			if not data[0] == otherData[0] or not data[1] == otherData[1]:
				print "error dead\t",a,b
			count += 1	
		print "compareDead complete......."
								
#-------------------------------------- compare ---------------------		
		
	def showAll(self):
		self.showAction()
		self.showExeAction()
		self.showHurt()
		self.showDead()
		self.showBuff()
		self.showHitItem()
		
	def compareAll(self,other):
		self.compreAction(other)
		self.compareDead(other)
		self.compareBuff(other)
		self.compareHitTank(other)
		self.compareHitItem(other)
		self.compareExeAction(other)
		
	
							
	def compareAIWithFile(self,fileName):
		
		def getLines(fi):
			with open(fi,"r") as f:
				return f.readlines()
					
		with open("left.txt","w") as f:
			f.write(self.showAIExe(printInfo=False))
		
		with open("right.txt","w") as f:
			f.write(PraserLog(fileName).showAIExe(printInfo=False))
			
		leftLines = getLines("left.txt")
		rightLines = getLines("right.txt")

		le = min(len(leftLines),len(rightLines))

		for i in range(le):
			if not leftLines[i] == rightLines[i]:
				print "find not at line ",(i + 1),"\nleft  is\t",leftLines[i],"\nright is\t",rightLines[i]
		
		
		os.system("rm -rf left.txt")
		os.system("rm -rf right.txt")			
		
					
				

while True:
	p = raw_input("input you file > ")
	if p == "exit":
		break
	elif p == "cmd":
		c = raw_input("input you command >")
		os.system(c)
		continue	
			
	if not os.path.exists(p):
		print "can find the file %s"%p
		continue
	log = PraserLog(p)
	while True:
		cmd = raw_input("input you command > ")
		if cmd == "exit":
			break;
		elif cmd == "com":
			fileName = raw_input("input you check file > ")
			
			try:
				exec("log.compareAIWithFile('%s')"%fileName)
			except Exception as e:
				print e
		elif cmd == "cmd":
			c = raw_input("input you command >")
			os.system(c)			
		else:
			try:
				eval("log.%s()"%cmd)
			except Exception as e:
				print e		
		
		
			
		
	
				