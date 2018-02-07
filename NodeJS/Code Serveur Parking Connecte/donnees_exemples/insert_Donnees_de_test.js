var insertDocument = {
  "_id" : '000001',
  "id_lecteur" : "01018200000C303960C94069860000002EC2",
  "id_controleur" : "AB10",
  "derniere_adresse_connue": '0.0.0.0',
  "dernier_port_connu": 3000,
  "id_portail" : [ "p01", "p02"],
  "coord" : [ 47.493345, -0.549852 ],
  "nom" : "Parking ESEO Sud",
  "hash_mdp" : "hugo",
  "etat_portail" : false,
  "places" : [
    {
       "place_id" : "1",
       "addresse_mac" : "AA11",
       "disponibilite" : true,
       "utilisateur_id" : null,
       "coord" : [ 47.493220, -0.550329 ]
    },
    {
       "place_id" : "2",
       "addresse_mac" : "BB22",
       "disponibilite" : true,
       "utilisateur_id" : null,
       "coord" : [ 47.493240, -0.550310 ]
    },
    {
       "place_id" : "3",
       "addresse_mac" : "CC33",
       "disponibilite" : false,
       "utilisateur_id" : null,
       "coord" : [ 47.493250, -0.549862 ]
    },
    {
       "place_id" : "4",
       "addresse_mac" : "DD44",
       "disponibilite" : false,
       "utilisateur_id" : null,
       "coord" : [ 47.493223, -0.549621 ]
    },
    {
       "place_id" : "5",
       "addresse_mac" : "EE55",
       "disponibilite" : true,
       "utilisateur_id" : 1,
       "coord" : [ 47.493241, -0.549604 ]
    }
  ],
  
  "roles" : [
     {
        "numero_role" : 0,
        "nom" : "permanents",
        "horaires" : [{
          "jour_debut" : "lundi",
          "heure_debut" : "00:00",
          "jour_fin" : "lundi",
          "heure_fin" : "00:00"
        }]
        
     },
     {
        "numero_role" : 1,
        "nom" : "pensionnaire",
        "horaires" : [{
          "jour_debut" : "lundi",
          "heure_debut" : "7:00",
          "jour_fin" : "vendredi",
          "heure_fin" : "21:00"
        }]
        
     },
  ],
  "utilisateurs" : [
    {
      "utilisateur_id" : "menardhu",
      "badges" : "000001",
      "place_id" : null,
      "numero_role" : 0,
      "nom" : "Hugo Menard"
    },
    {
      "utilisateur_id" : "lemairba",
      "badges" : "000002",
      "place_id" : null,
      "numero_role" : 0,
      "nom" : "Baptiste LeMaire"
    },
    {
      "utilisateur_id" : "lenyalex",
      "badges" : "000003",
      "place_id" : null,
      "numero_role" : 1,
      "nom" : "Alexis Leny"
    }
  ]

};

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

insertExample(insertDocument);

function insertExample(insertDocumentfun){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
      db.collection("parking").insertOne(insertDocumentfun, function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
      db.close();
    });
  });
}

var insertDocumentB = {
  "_id" : '000002',
  "id_lecteur" : "01018200000C303960C94069860000002EC3",
  "coord" : [ 47.493705, -0.550945 ],
  "nom" : "Parking ESEO Nord",
   "id_portail" : [ "p03"],
   "id_controleur" : "CB20",
  "derniere_adresse_connue": '0.0.0.0',
  "dernier_port_connu": 3000,
  "hash_mdp" : "hugo",
  "etat_portail" : false,
  "places" : [
    {
       "place_id" : "1",
       "addresse_mac" : "A1A1",
       "disponibilite" : true,
       "utilisateur_id" : null,
       "coord" : [ 47.493220, -0.550329 ]
    }
  ],
  
  "roles" : [
     {
        "numero_role" : 0,
        "nom" : "permanents",
        "horaires" : [{
          "jour_debut" : "lundi",
          "heure_debut" : "00:00",
          "jour_fin" : "lundi",
          "heure_fin" : "00:00"
        }]
        
     }
  ],
  "utilisateurs" : [
    {
      "utilisateur_id" : "userParkingNord01",
      "badges" : "200001",
      "place_id" : null,
      "numero_role" : 0,
      "nom" : "User Nord"
    }
  ]

};

insertExample(insertDocumentB);