

//----Import utilise par l'authentification----
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 

//------Instanciation du serveur-----------
var express = require('express');
var app = express();

// Get Parameter :
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());

//--------Instancier des objets contenant les fonctions------------
var DatabaseInterrogation = require('./DatabaseInterrogation');
var getData = new DatabaseInterrogation();

var Authentification = require('./Authentification');
var auth = new Authentification();

var DatabaseInsert = require('./DatabaseInsert');
var insert = new DatabaseInsert();

var DatabaseDelete = require('./DatabaseDelete');
var enlever = new DatabaseDelete();

app.set('view engine', 'ejs');  //tell Express we're using EJS
app.set('views', __dirname + '/views');  //set path to *.ejs files




//put your static files (js, css, images) into /public directory
app.use('/public', express.static(__dirname + '/public'));

//----------Création du serveur temps réel-----
serverIO = require('http').createServer(app);
io = require('socket.io').listen(serverIO);
serverIO.listen(3000);

// ----Gère GET/POST request sur le serveur----
app.get('/', function(req, res) {
	chargerAccueil(req, res);
});

app.post('/signup', function(req, res){
	//console.log(req.body.password+"+"+req.body.idParking);
   if(!req.body.password||req.body.idParking==undefined){
      res.status("400");
      res.send("Envoyer un mot de passe :"+ req.body.password+"idParking :"+req.query.idParking);
      res.redirect('back');
   } else {
   		auth.verifierMotDePasse(req.body.idParking, req.body.password,  function(err,bool) {
            //console.log(data.bool);
            if (bool.passwordAccepte){
            	chargerPageAdmin(req , res);
                
            }else{
                chargerAccueil(req, res);
            }
        });
		
	}
   
});

app.post('/changerMDP', function(req, res){
	console.log(req.body.oldPassword+"+"+req.body.idParking);
   if(!req.body.oldPassword||!req.body.newPassword||!req.body.newPasswordBis||req.body.idParking==undefined){
      res.status("400");
      res.redirect('back', {info: req.body.info});
   }if (req.body.newPassword!=req.body.newPasswordBis){
   		res.redirect('back', {info: req.body.info} );
   } else {
   		auth.verifierMotDePasse(req.body.idParking, req.body.oldPassword,  function(err,data) {
            //console.log(data.bool);
            if (data.passwordAccepte){
            	auth.changerMotDePasse(req.body.idParking, req.body.newPassword);
                chargerPageAdmin(req , res);
            }else{
				chargerPageAdmin(req , res);
            }
        });
		
	}
});   

app.post('/ajouterPlaces', function(req, res) {
	console.log(req.body);
    insert.insertPlaces(req.body);
    chargerPageAdmin(req , res);
});

app.post('/enleverPlaces', function(req, res) {
	console.log(req.body);
    enlever.deletePlaces(req.body);
    chargerPageAdmin(req , res);
});

app.post('/ajouterUtilisateurs', function(req, res) {
    insert.insertUtilisateurs(req.body);
    chargerPageAdmin(req , res);
});

app.post('/enleverUtilisateurs', function(req, res) {
	console.log(req.body);
    enlever.deleteUtilisateurs(req.body);
    chargerPageAdmin(req , res);
});


//---Gère les connections au serveur temps réel---
var adresse= '0.0.0.0';
var port="300"

io.sockets.on('connection', function(socket){
	console.log("Connection au serveur temps réel");
	socket.on('op', function(data){
		console.log("op;"+data.idPortail+"/idparking:"+data.idControleur);
		sendEncrypt(adresse, port, "OP;idControleur="+data.idControleur+';idPortail='+data.idPortail, 'U93GiADMRixL0agL4iLu2Q==');
		/*getData.getDataAdmin(data.idParking, function(err,info) {
	        if (info.bool){
	        	console.log(info.adresse+"./"+ info.port);
	            sendEncrypt(info.adresse, info.port, "op;"+data.idPortail, 'U93GiADMRixL0agL4iLu2Q==');
	        }
	    });*/
		
	});
});


//http.createServer(app).listen(3000);

//---Fonction de chargement de page---
function chargerPageAdmin (req, res){
	getData.getDataAdmin(req.body.idParking, function(err,data) {
        if (data.bool){
            res.render('pageAdminParking', {data: data});
        }else{
            var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            res.render('home', {lien: fullUrl});
        }
    });
}

function chargerAccueil(req, res){
    if (req.query.idParking==undefined){
        chargerAccueilPage(req,res);
    }else{
        //console.log(req.query.idParking);
        getData.getDataParking(req.query.idParking, function(err,data) {
            //console.log(data.bool);
            if (data.bool){
                res.render('monParking', {data: data});
            }else{
                chargerAccueilPage(req,res);
            }
        });
    }
}

function chargerAccueilPage(req,res){
	var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    getData.getEveryIdParking(function(err,data) {
        res.render('home', {lien: fullUrl, data:data});
    });
}


//---- SERVER UDP ----
var PORT = 33333;
//var HOST = '127.0.0.1';
var HOST= '172.17.1.43'

var dgram = require('dgram');
var serverUDP = dgram.createSocket('udp4');

serverUDP.on('listening', function () {
    var address = serverUDP.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

var acceptRFID = "010183000008E0040000CF5A1502";

serverUDP.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    //try {
	var msg = decrypt(message,'U93GiADMRixL0agL4iLu2Q==')
	console.log('Message  décodée : '  + msg);
	var arr = msg.split(";");
	console.log('Array : '  + arr);
	if (arr[0].indexOf("MP") > -1){
		console.log('MP:Array : '  + arr[1]+"/"+arr[2]+"/"+arr[3].split("=")[1]);

		insert.updatePlaceFromAddress(arr[1].split("=")[1],arr[2].split("=")[1],arr[3]);
		console.log("changementidControleur=AB10"+"/"+'changement'+arr[1]+"/"+("changementidControleur=AB10"=='changement'+arr[1]));
		io.sockets.emit("changement"+arr[1], {idPlace: arr[2].split("=")[1], dispo:arr[3].split("=")[1] });

	}else if (arr[0].indexOf("LB") > -1){
		console.log('Array : '  + arr[1]+"/"+arr[2]+"/"+arr[3]);
		console.log('bool LB : '  + arr[2].indexOf(acceptRFID));
		if (arr[2].indexOf(acceptRFID)>-1){
			sendEncrypt(remote.address, remote.port, 'OP;idControleur='+arr[1].split("=")[1]+';idPortail='+arr[3].split("=")[1], 'U93GiADMRixL0agL4iLu2Q==');
		}

	}else if (arr[0].indexOf("EP") > -1){
		console.log('Array : '  + arr[1]+"/"+arr[2]+"/"+arr[3]);
		console.log('changementEP'+arr[1]);
		io.sockets.emit('changementEP'+arr[1], {idPortail: arr[2].toLowerCase(), position:arr[3] });

	}else if (arr[0].indexOf("OP") > -1){
		console.log('Array : '  + arr[1]+"/"+arr[2]);

	}else if (arr[0].indexOf("DP") > -1){
		console.log('Array : '  + arr[1]);
		sendEncrypt(remote.address, remote.port, 'true', 'U93GiADMRixL0agL4iLu2Q==');
	}else if (arr[0].indexOf("IC") > -1){
		insert.updatePortAddress(arr[1],''+remote.address, ''+remote.port);
		console.log('IC : '  + arr[1]+"/"+remote.address + "/"+ remote.port);
		adresse= remote.address;
		port=remote.port;
		//sendEncrypt(remote.address, remote.port, 'IDC', 'U93GiADMRixL0agL4iLu2Q==');
	}

});

//------Enovyer un message chiffre--------------
function sendEncrypt(address, port, message, password){
	var encryptedMessage = encrypt(message, password);
	serverUDP.send(encryptedMessage,port,address,function(error){
	  if(error){
	    console.log("Erreur dans l'envoi de donnée");
	  }else{
	    console.log('Data sent !!!');
	  }

	});
}



serverUDP.bind(PORT, HOST);


var crypto = require('crypto'),
    algorithm = 'aes-128-ecb',
    //password = 'U93GiADMRixL0agL4iLu2Q==';
    password = 'U93GiADMRixL0agL4iLu2Q==';

function encrypt(text, pwd){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','base64')  //'hex'  'base64'
  crypted += cipher.final('base64');
  console.log(crypted);
  return crypted;
}

function decrypt(text, pwd){
	var newText = "" + text;
	var decipher = crypto.createDecipher(algorithm, password);
	var decrypted = decipher.update(newText, 'base64', 'utf8');
	decrypted += decipher.final('utf8');
	console.log(decrypted);
	return(decrypted);
}

//sendEncrypt('172.12.1.67', '33333', 'OP;idControleur=ab10;idPortail=2', 'U93GiADMRixL0agL4iLu2Q==');