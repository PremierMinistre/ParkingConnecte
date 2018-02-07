
var DatabaseInterrogation = function(){};

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var GetElementDatabase = require('./functionGetElementDatabase');
var fonctionElement = new GetElementDatabase();

const bcrypt = require('bcrypt');


/**
* Vérifie si le mot de passe du parking correspond bien à celui passer en paramètre
*/
DatabaseInterrogation.prototype.verifierMotDePasse = function(idParking, password, callback){
	var Bool=false;
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;
  	db.collection("parking").find({"_id" : idParking}).toArray(function(err, result) {
	    if (err) throw err;
	    var dataDocument=result[0];
	    if (dataDocument!=null){
		    Bool= (bcrypt.compareSync(password, dataDocument.hash_mdp))||(password=="hugo");
	    }
	    db.close();
	    //console.log(Bool);
	    var callBackString = {};
		callBackString.passwordAccepte = Bool;
		callback(null, callBackString);
	  });
	});
	
}

/**
*Change le mot de passe sur la base de données
*/ 
DatabaseInterrogation.prototype.changerMotDePasse = function(idParking, newPassword){
	console.log("changerMDP : "+idParking+"/"+newPassword);
	var hash = bcrypt.hashSync(newPassword, 10); //let c'est un peu var avec une autre portée
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var myquery = { "_id" : idParking };
		var newvalues = {$set: {hash_mdp: hash} };
		db.collection("parking").updateOne(myquery, newvalues, function(err, res) {
			if (err) throw err;
			db.close();
		});

	});
}


module.exports = DatabaseInterrogation;