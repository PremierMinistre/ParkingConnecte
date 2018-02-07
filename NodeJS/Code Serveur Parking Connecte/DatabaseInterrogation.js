
var DatabaseInterrogation = function(){};

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var GetElementDatabase = require('./functionGetElementDatabase');
var fonctionElement = new GetElementDatabase();

/**
* Renvoie les données du Parking pour charger la page monParking dont l'id correspond à celui passé en paramètre
*/
DatabaseInterrogation.prototype.getDataParking = function(idParking, callback){
	var Bool=false;
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;
  	db.collection("parking").find({"_id" : idParking}).toArray(function(err, result) {
	    if (err) throw err;
	    var dataDocument=result[0];
	    //console.log(result);
	    var callBackString = {};
	    if (dataDocument!=null){
	    	var Utilisateurs = fonctionElement.getUtilisateurs(dataDocument);
		    Bool=true;
		    var Places = fonctionElement.getPlaces(dataDocument);
		    db.close();
		    callBackString.bool = Bool;
			callBackString.id = idParking;
			callBackString.nom = dataDocument.nom;
			callBackString.coord = dataDocument.coord;
			callBackString.places = Places;
			callBackString.idControleur = dataDocument.id_controleur;
	    }else{
		    var callBackString = {};
			callBackString.bool = Bool;
		}
		callback(null, callBackString);
	  });
	});
	
}
/**
* Renvoie les données du Parking pour charger la page pageAdminParking dont l'id correspond à celui passé en paramètre
*/
DatabaseInterrogation.prototype.getDataAdmin = function(idParking, callback){
	var Bool=false;
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;
  	db.collection("parking").find({"_id" : idParking}).toArray(function(err, result) {
	    if (err) throw err;
	    var dataDocument=result[0];
	    //console.log(result);
	    var callBackString = {};
	    if (dataDocument!=null){
	    	var Utilisateurs = fonctionElement.getUtilisateurs(dataDocument);
		    Bool=true;
		    var Places = fonctionElement.getPlaces(dataDocument);
		    db.close();
		    
		    callBackString.bool = Bool;
			callBackString.id = idParking;
			callBackString.nom = dataDocument.nom;
			callBackString.coord = dataDocument.coord;
			callBackString.places = Places;
			callBackString.utilisateurs = Utilisateurs;
			
			callBackString.portails = dataDocument.id_portail;
			callBackString.idControleur = dataDocument.id_controleur;
	    }else{
		    var callBackString = {};
			callBackString.bool = Bool;
		}
		callback(null, callBackString);
	  });
	});
	
}
/*
* Devrait renvoyer l'adresse et le port du parking dont l'id est passé en paramètre
*/
DatabaseInterrogation.prototype.getAddressPort = function(idParking, callback){
	var Bool=false;
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;
  	db.collection("parking").find({"_id" : idParking}).toArray(function(err, result) {
	    if (err) throw err;
	    var dataDocument=result[0];
	    //console.log(result);
	    var callBackString = {};
	    if (dataDocument!=null){
		    Bool=true;
		    
		    callBackString.bool = Bool;
			callBackString.adresse = dataDocument.derniere_adresse_connue;
			callBackString.port = dataDocument.dernier_port_connu;
	    }else{
		    var callBackString = {};
			callBackString.bool = Bool;
		}
		callback(null, callBackString);
	  });
	});
	
}
/**
* Renvoie les données de tous les Parkings pour charger la page d'Accueil
*/
DatabaseInterrogation.prototype.getEveryIdParking = function(callback){
	var Bool=false;
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;
  	db.collection("parking").find({}).toArray(function(err, result) {
	    if (err) throw err;
	    //var dataDocument=result[0];
	    
	    var callBackString = {};
	    
	    var array = [];

	    if (result!=null){
	    	for(var i=0; i<result.length; i++){
	    		console.log(result[i]);
	    		var idParkings = {}
		    	idParkings.id=result[i]._id;
		    	idParkings.nom=result[i].nom;
		    	idParkings.coord=result[i].coord;
		    	var nbPlacesTotal=result[i].places.length;
			    var nbPlacesLibres = 0;
				for (var j = 0; j < nbPlacesTotal; j++) {
					if (result[i].places[j].disponibilite){
						nbPlacesLibres++;
					}
				}
				idParkings.places = nbPlacesLibres +"/"+nbPlacesTotal;
		    	array.push(idParkings);
		    }
		}
		callBackString.idParkings = array;
		callback(null, callBackString);
		db.close();
	  });
	});
	
}

module.exports = DatabaseInterrogation;
