import gatt
from chiffrement import chiffrer
import sys
import threading
import socket

class Capteur(gatt.Device):
    #rx,tx,batterie;
    def __init__(self, mac_address, manager, serveurSocket,serveurPort,serveurAdresse):
        super().__init__(mac_address=mac_address, manager=manager)
        self.serveurSocket = serveurSocket;
        self.serveurPort = serveurPort;
        self.serveurAdresse = serveurAdresse;
    def connect_succeeded(self):
        super().connect_succeeded()
        print("[%s] Connected" % (self.mac_address))

    def connect_failed(self, error):
        super().connect_failed(error)
        print("[%s] Connection failed: %s" % (self.mac_address, str(error)))

    def disconnect_succeeded(self):
        super().disconnect_succeeded()
        print("[%s] Disconnected" % (self.mac_address))

    def services_resolved(self):
        super().services_resolved()

        print("[%s] Resolved services" % (self.mac_address))
        for service in self.services:
            #print("[%s]  Service [%s]" % (self.mac_address, service.uuid))
            for characteristic in service.characteristics:
                #print("[%s]  Characteristic [%s]" % (self.mac_address, characteristic.uuid))
                if (characteristic.uuid=='6e400003-b5a3-f393-e0a9-e50e24dcca9e'):
                    rx = characteristic;
                    rx.read_value();
                    rx.enable_notifications();
                    
    def characteristic_value_updated(self, characteristic, value):
        #self.serveurSocket.sendto(chiffrer("test03").encode(),(self.serveurAdresse, self.serveurPort));
        print("Données reçues : [%s]" % (value));
        #reponse = "MP;idControleur={0};idCapteur={1};presenceVehicule={2}".format("AB10", "1");
        presence = "true";
        if "PasDeVe" in value.decode():
            presence = "false";
        self.serveurSocket.sendto(chiffrer("MP;idControleur=AB10;idCapteur=1;presenceVehicule={0}".format(presence)).encode(),(self.serveurAdresse, self.serveurPort));
        #print("Données envoyées");
        #print("Réponse envoyée:", reponse);
        #envoyerInfoCapteur(value);
class gestionCapteur(threading.Thread):
    def arreter(self):
        self.arret = True;
    def __init__(self, threadID, name, leSocket, hote, port):# Lancée avec lethread.start()
        threading.Thread.__init__(self);
        self.threadID = threadID;
        self.name = name;        
        self.arret = False;
        self.idCapteur = "1";
        self.manager = gatt.DeviceManager(adapter_name='hci0');
        self.serveurSocket = leSocket;
        self.serveurPort = port;
        self.serveurAdresse = hote;        
    def run(self):
        self.device = Capteur(mac_address='CF:8E:BE:9C:C1:30', manager=self.manager,serveurSocket= self.serveurSocket, serveurPort=self.serveurPort,serveurAdresse=self.serveurAdresse);
        #self.device.addServeur(self.serveurSocket, self.serveurPort,self.serveurAdresse);
        self.device.connect();
        self.manager.run();