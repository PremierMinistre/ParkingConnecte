import time
import threading
import sys
import socket
from chiffrement import chiffrer

import serial

# Un objet par lecteur à gérer
class gestionRFID (threading.Thread):# Entre parenthèse la classe héritée, on surcharge ses deux méthodes __init__ et run
    def arreter(self):
        self.arret = True;
    def __init__(self, threadID, name,socketServeur,idControleur, hote, port):# Lancée avec lethread.start()
        threading.Thread.__init__(self);
        self.threadID = threadID;
        self.name = name;
        #self.leSocket = leSocket;
        self.arret = False;
        self.lecteur = serial.Serial('/dev/ttyUSB0',9600,timeout=1)
        self.serveurSocket = socketServeur;
        self.serveurAdresse = hote;
        self.serveurPort = port;
        self.idControleur = idControleur;
    def run(self):
        while not self.arret:

            self.lecteur.write(bytes("\r000201010000\r".encode('ascii')));
            time.sleep(2);
            messSkyetech = self.lecteur.read(1024);
            print(messSkyetech);
            badges = messSkyetech.decode().split('\n');
            for unBadge in badges:
                #if not "n810F" in unBadge:
                    message = "LB;idControleur={0};idBadge={1};idPortail=p01".format(self.idControleur,unBadge);
                   
                    self.serveurSocket.sendto(chiffrer(message).encode(),(self.serveurAdresse, self.serveurPort));
            #print(messSkyetech);
            #if len(messSkyetech)>10:
             #   self.leSocket.send(bytes(messSkyetech));
