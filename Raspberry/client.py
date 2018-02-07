import chiffrement
from chiffrement import chiffrer
from chiffrement import dechiffrer
import socket
from gestionPortail import *
from gestionRFID import *
from gestionBLE import *
import time
import Adafruit_CharLCD as LCD
import Adafruit_GPIO.PWM as PWM
import RPi.GPIO as GPIO
import select
# Variables
# Pour les logs
maDate = time.localtime();
logs = "\n#########################################################\n"
logs += "Programme démarré le {0}-{1}-{2} à {3}H{4}\n".format(maDate[2],maDate[1],maDate[0],maDate[3],maDate[4]);
logs += "#########################################################\n";
print(logs);
# Pour la connexion au serveur
port = 33333;
hote = "172.17.1.43";
idControleur = "AB10";
socketLocal= socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
socketServeur = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# Raspberry Pi pin configuration:
lcd_rs        = 20  # Note this might need to be changed to 21 for older revision Pi's.
lcd_en        = 21
lcd_d4        = 26
lcd_d5        = 19
lcd_d6        = 13
lcd_d7        = 6
lcd_backlight = 4
# Define LCD column and row size for 16x2 LCD.
lcd_columns = 16
lcd_rows    = 2
# Initialize the LCD using the pins above.
lcd = LCD.Adafruit_CharLCD(lcd_rs, lcd_en, lcd_d4, lcd_d5, lcd_d6, lcd_d7,
                           lcd_columns, lcd_rows, lcd_backlight)
# Fonctions
# Afficher un message sur la console et l'enregistrer dans le fichier de logs
def log (message):
    global logs
    nouveauLog = "{0}:{1}:{2} : {3}\n".format(maDate[3],maDate[4],maDate[5],message);
    logs += nouveauLog;
    print(nouveauLog);
# Afficher message sur deux lignes max
def ecran (message):
    global lcd
    lcd.clear();
    if (len(message)>16):
      lcd.message(message[0:16]+'\n'+message[16:32]);
    else:
      lcd.message(message);

# Initialisation moteur portails
"""
gpio=GPIO.get_platform_gpio();
pwm=PWM.get_platform_pwm();
gpio.setup(18, GPIO.OUT);

pwmadapter = PWM.RPi_PWM_Adapter(18);
pwmadapter.start(18,29);
"""
GPIO.setmode(GPIO.BCM);
GPIO.setup(3,GPIO.OUT);# Portail entrée
GPIO.setup(24,GPIO.OUT);# Portail sortie
GPIO.setup(10,GPIO.OUT);# LED verte sortie
GPIO.setup(9,GPIO.OUT);# LED rouge sortie
GPIO.setup(17,GPIO.OUT);# LED verte entrée
GPIO.setup(27,GPIO.OUT);# LED rouge entrée

# Initialisation du socket
socketServeur.settimeout(1.0);
socketServeur.connect((hote, port));
socketLocal.settimeout(1.0);
socketLocal.connect(("172.17.1.67", port));
#socketLocal.bind(("127.0.0.1",port));
log("Socket ouvert sur {0}:{1}".format(hote, port));
# Creation des threads de gestions des portails
portail1 = gestionPortail(1, "Gestion portail 1",socketServeur, idControleur,hote,port,"p01");
portail2 = gestionPortail(2, "Gestion portail 2",socketServeur, idControleur,hote,port,"p02");
log("Initialisation des deux portails");
# Démarrage des threads de gestions des portails
portail1.start();
portail2.start();
# Init RFID
lecteurRFID = gestionRFID(3,"Gestion RFID",socketServeur, idControleur,hote,port);
lecteurRFID.start();
# Initialisation du ble
capteur = gestionCapteur(4,"Gestion BLE",socketServeur, hote, port);
capteur.start();

def envoyerIDControleur():
    log("Envoi ID Controleur");
    socketServeur.sendto(chiffrer("IC;idControleur={0}".format(idControleur)).encode(),(hote,port));
    socketServeur.sendto(chiffrer("n01018200000C300833B2DDD9014035052F23").encode(),(hote,port));

# Gestion des messages du serveur
def MAEMessage(message):
    log("Message reçu : [{0}]".format(message));
    if "arret" in message :
        log("Arret demandé");
        arret = True;
        portail1.arreter();
        portail2.arreter();
    elif "PORTAIL" in message :
        if "OUVRIR1" in message :
           portail1.action(True);
        if "OUVRIR2" in message :
           portail2.action(True);
        if "FERMER1" in message :
           portail2.action(False);
        if "FERMER2" in message :
           portail2.action(False);
    elif "ECRAN" in message :
           ecran(message.split("ECRAN")[1]);
    elif "OP" in message :# Commande d'Ouverture du Portail - "OP;idControleur=%idDuControleur%;idPortail=%idPortail%"
         if "idControleur={0}".format(idControleur) in message :
            message = message.split("idPortail=");
            try:
                #int(message[len(message)-1])
                if message[len(message)-1] == "p01":
                    portail1.action(True);
                elif message[len(message)-1] == "p02":
                    portail2.action(True);                
            except ValueError:
                    # Si on arrive ici alors c'est que l'id du portail n'est pas un nombre
                log("Erreur de valeur");
    elif "EP" in message :# Demande l'état du Portail
         if "idControleur={0}".format(idControleur) in message :
            message.split("idPortail=");
            try:
                #int(message[len(message)-1])                
                if message[len(message)-1] == "p01":
                    
                    portail1.etatPortail();
                elif message[len(message)-1] == "p02":
                    portail2.etatPortail();
                
            except ValueError:
                    # Si on arrive ici alors c'est que l'id du portail n'est pas un nombre
                log("Erreur de valeur");
    elif "IDC" in message:
        envoyerIDControleur();        
#Gestion entrées clavier
class entreeClavier():
    def run(self):
        self.arret =False;
        while(not self.arret):
            if sys.stdin.isatty():
                message = sys.stdin.readline();
                if "arret" in message:
                    self.arret=True;
                MAEMessage(message.split("\n")[0]);
#gestionClavier = entreeClavier();
#gestionClavier.run();

arret = False;
envoye = False;
inputs = [socketServeur];
while(not arret):
     if not envoye:#Première connexion, on signal au serveur le controleur pour qu'il enregistre l'IP et les données d'identification du controleur          
          envoyerIDControleur();
          envoye = True;
     try:
          readable,writable,exceptional = select.select(inputs,[],[],10);
     except select.error:
          pass;
     else:
          for s in readable :               
               message = (str(s.recv(1024))[2:])[:-1];
               message = dechiffrer(message);
               MAEMessage(message);               
          #time.sleep(2);
monsocket.close();
portail1.join();
portail2.join();
# Sauvegarde des résultats
maDate = time.localtime();
logs += "#########################################################\n";
logs += "Programme arrêté le {0}-{1}-{2} à {3}H{4}\n".format(maDate[2],maDate[1],maDate[0],maDate[3],maDate[4]);
logs += "#########################################################\n";
fResultats = open("logs.txt", "a");
fResultats.write(logs);
fResultats.close();
