
var GetElementDatabase = function(){};

/**
* Ces fonctions permettent de mettre en forme les sous-documents reçues pour les mettre dans un objet
*/
GetElementDatabase.prototype.getUtilisateurs = function(result){
    len=result.utilisateurs.length
    var utilisateurs=[];
	for (var i = 0; i < len; i++) {
		utilisateurs.push(result.utilisateurs[i]);
	}
	return (utilisateurs);
}

GetElementDatabase.prototype.getPlaces = function(result){
	len=result.places.length
    var places=[];
	for (var i = 0; i < len; i++) {
		places.push(result.places[i]);
		//console.log(result.places[i]);
	}
	return (places);
}

module.exports = GetElementDatabase;    //Les fonction à exporter
