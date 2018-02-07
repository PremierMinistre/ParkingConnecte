var DatabaseInsert = function(){};

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/mydb";



/**
* Insère des places dans la base de données
*/
DatabaseInsert.prototype.insertPlaces = function(data){

	MongoClient.connect(url, function(err, db) {
		var collection = db.collection('parking');
		collection.find({"_id" : data.idParking}).toArray(function(err, result) {
			global.nbplaces = result[0].places.length;
			console.log(global.nbplaces);
		});
		db.close();
	});	
	setTimeout(function(){insertPlacesIdParking(data)}, 1000);

}

function insertPlacesIdParking(data) {
	console.log(global.nbplaces);
    if(global.nbplaces==undefined) {//we want it to match
        setTimeout(function(){insertPlacesIdParking(data);}, 1000);//wait 50 millisecnds then recheck
        return;
    }
    MongoClient.connect(url, function(err, db) {
		var compteur=0;
		var collectionbis = db.collection('parking');
		for(var key in data) {
		  if((data.hasOwnProperty(key))&&(key.startsWith("place_"))){
			var placeid = data[key];
			console.log(global.nbplaces);
			var idplace = global.nbplaces + compteur;
			place = {
				"place_id" : ""+idplace,
				"disponibilite" : true,
				"utilisateur_id" : null,
				"coord" : [parseFloat(data[key][0]),parseFloat(data[key][1])]
			};
			collectionbis.updateOne(
			{ "_id": data.idParking },
			{ "$push": { "places": place } }
			);
			
			compteur += 1;
			}
		}
		db.close();
	});
}

DatabaseInsert.prototype.insertUtilisateurs = function(data){
	MongoClient.connect(url, function(err, db) {
		var collection = db.collection('parking');
		for(var key in data) {
		  if((data.hasOwnProperty(key))&&(key.startsWith("utilisateurs_"))){
			var users = data[key];
			
			utilisateur = {
				"utilisateur_id" : users[0],
				"badges" : users[1],
				"place_id" : null,
				"numero_role" : null,
				"nom" : users[2]
			};
			collection.updateOne(
			{ "_id": data.idParking },
			{ "$push": { "utilisateurs": utilisateur } }
			);
			
			}
		}
		db.close();
	});
}

DatabaseInsert.prototype.updatePlace = function(idParking, idPlace, dispo){
	// data[0] _idParking, data[1] idPlaces, data[2] false ou true
	MongoClient.connect(url, function(err, db) {
		var collection = db.collection('parking');
			collection.updateOne(
			{ "_id": ''+idParking ,
				"places.place_id": ''+idPlace 
			},
			{ "$set": { "places.$.disponibilite": dispo } },
				function(err, result){
		            //console.log(result);
		            db.close();
	        	}
			);

		db.close();
	});
}

DatabaseInsert.prototype.updatePlaceFromAddress = function(lecteurParking, idPlace, dispo){
	// data[0] _idParking, data[1] idPlaces, data[2] false ou true
	MongoClient.connect(url, function(err, db) {
		var collection = db.collection('parking');
			collection.updateOne(
			{ "id_controleur": ''+lecteurParking ,
				"places.place_id": ''+idPlace 
			},
			{ "$set": { "places.$.disponibilite": dispo } },
				function(err, result){
		            //console.log(result);
		            db.close();
	        	}
			);

		db.close();
	});
	
}

DatabaseInsert.prototype.updatePortAddress = function(idcontroleur, address, port){
	// data[0] _idParking, data[1] idPlaces, data[2] false ou true
	MongoClient.connect(url, function(err, db) {
		var collection = db.collection('parking');
		console.log("updatePortAddress"+idcontroleur+"/"+ address+"/"+ port);
		//{ "id_controleur": ""+idcontroleur },
			collection.updateOne(
				{"_id" : '000001'},
			{ "$set": { "derniere_adresse_connue": ''+address,
			"dernier_port_connu":  port} },
				function(err, result){
		            //console.log(result);
		            db.close();
	        	}
			);
		//console.log("1 document updated");
		db.close();
	});
	
}

module.exports = DatabaseInsert;