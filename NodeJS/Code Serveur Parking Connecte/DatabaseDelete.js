var DatabaseDelete = function(){};

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/mydb";

/**
* Supprime les places passé en paramètres
*/
DatabaseDelete.prototype.deletePlaces = function(data){
	console.log(data);
	MongoClient.connect(url, function(err, db) {
		var nbplaces =0;
		var collection = db.collection('parking');
		var compteur=nbplaces;
		for(var key in data) {
		  if((data.hasOwnProperty(key))&&(key.startsWith("place_"))){
			var placeid = data[key];
			console.log(placeid);
			collection.update( {"_id": data.idParking}, 
{ $pull : { places : {"place_id":placeid} } }, false, false )
			//db.users.update({"_id": data.idParking, {"$unset":{"places.place_id":0}},False,False)
			}
		}
		db.close();
	});
}

/**
* Supprime les utilisateurs passé en paramètres
*/
DatabaseDelete.prototype.deleteUtilisateurs = function(data){
	MongoClient.connect(url, function(err, db) {
		var collection = db.collection('parking');
		for(var key in data) {
		  if((data.hasOwnProperty(key))&&(key.startsWith("utilisateurs_"))){
			var utilisateur_id = data[key];
			console.log(data[key]);
			collection.update( {"_id": data.idParking}, 
{ $pull : { utilisateurs : {"utilisateur_id": data[key]} } }, false, false )
			}
		}
		db.close();
	});
}

module.exports = DatabaseDelete;