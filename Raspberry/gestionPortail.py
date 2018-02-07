import time
import threading
import sys
import socket
import RPi.GPIO as GPIO
from chiffrement import chiffrer

# Un objet par portail à gérer
class gestionPortail (threading.Thread):# Entre parenthèse la classe héritée, on surcharge ses deux méthodes __init__ et run
    def etat(self,etat):
        self.etatPortail = etat;
        reponse = "EP;idControleur={0};idPortail={1};{2}".format(self.idControleur, self.idPortail,self.etatPortail);
        self.leSocket.sendto(chiffrer(reponse).encode(),(self.hote,self.port));
    def arreter(self):
        self.arret = True;
    def action(self,ouverture=False):                
        self.semaphore.acquire();
        if (ouverture):
            self.etat(2);
        else:
            self.etat(3);
        fin = False;
        compteur = 0
        if ouverture :
            GPIO.output(self.pinLedVerte,GPIO.HIGH);
            GPIO.output(self.pinLedRouge,GPIO.LOW);
        else :
            GPIO.output(self.pinLedVerte,GPIO.LOW);
            GPIO.output(self.pinLedRouge,GPIO.HIGH);
        time.sleep(1);
        while not fin:
            time.sleep(0.020);
            GPIO.output(self.pinPortail,GPIO.HIGH);
            if ouverture :
                time.sleep(0.0016);
            else:
                time.sleep(0.00077);# Fermé 0.00077 Ouvert 0.0016 
            GPIO.output(self.pinPortail,GPIO.LOW);
            compteur += 1
            if compteur==40:
                fin = True
        if ouverture :
            self.etat(1);
        else :
            self.etat(0);
        self.temporisationEnCours = True;
        self.temporisation = 0;
        self.semaphore.release();
    def __init__(self, threadID, name, leSocket, idControleur, hote, port, idPortail = "défaut"):# Lancée avec lethread.start()
        threading.Thread.__init__(self);
        self.threadID = threadID;
        self.name = name;
        self.hote = hote;
        self.port = port;
        self.leSocket = leSocket;
        self.arret = False;
        self.idControleur = idControleur;
        self.semaphore = threading.BoundedSemaphore(1);
        if idPortail == "p01" :# Portail d'entrée
            self.pinLedVerte = 17;
            self.pinLedRouge = 27;
            self.pinPortail = 3;
        else :# Portail de sortie
            self.pinLedVerte = 10;
            self.pinLedRouge = 9;
            self.pinPortail = 24;
        self.tempoFermetureParDefaut = 5;# Durée de la temporisation par défaut du portail
        self.temporisation = 0;# Le compteur de la temporisation
        self.temporisationEnCours = False;# Indique s'il faut s'occuper de la temporisation du portail
        self.idPortail = idPortail;
    def run(self):
        while not self.arret:
            if self.temporisationEnCours:
                if self.temporisation == self.tempoFermetureParDefaut:
                    self.action(False);
                    self.temporisationEnCours = False;
                    self.temporisation = 0;
                else :
                    self.temporisation += 1;
            time.sleep(1);
    
