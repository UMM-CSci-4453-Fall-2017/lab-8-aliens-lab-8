var express=require('express'),
mysql=require('mysql'),
credentials=require('./credentials.json'),
app = express(),
port = process.env.PORT || 1337;

credentials.host='ids.morris.umn.edu'; //setup database credentials

var connection = mysql.createConnection(credentials); // setup the connection

connection.connect(function(err){
  if(err){
    console.log(error)
  }
});

app.use(express.static(__dirname + '/public'));
app.get("/buttons",function(req,res){
  var sql = 'SELECT * FROM sixel004.till_buttons';
  connection.query(sql, (function(res){return function(err,rows,fields){
     if(err){console.log("Houston we have a problem: ");
             console.log(err);}
     res.send(rows);
  }})(res));
});

app.get("/current",function(req,res){
  var sql = 'SELECT inventory.item, current_transaction.quantity, prices.price, current_transaction.invID from sixel004.inventory, sixel004.current_transaction, sixel004.prices where (inventory.id = current_transaction.invID AND inventory.id=prices.id)';
  connection.query(sql, (function(res){
    return function(err,rows,fields){
     if(err){console.log("Houston we have a problem: ");
             console.log(err);}
     res.send(rows);
  }})(res));
});

app.get("/click",function(req,res){
  var resp = {};
  var id = req.query.id;
  var sql = 'INSERT INTO sixel004.current_transaction (invID, quantity) VALUES ( ' + id + ', 1) ON DUPLICATE KEY UPDATE invID = ' + id + ', quantity = quantity+1';
  console.log("Attempting sql ->" + sql + "<-");

  connection.query(sql, (function(res){
    return function(err,rows,fields){
     if(err){
       resp.err = err;
       console.log("Houston we have a problem (again): ");
       console.log(err);
     }
     res.send(err); // Let the upstream guy know how it went
  }})(res));
});

app.get("/changeOne/:id/:quantity", function(req,res){
  var resp = {};
  // console.log(req);
  var id = req.params.id;
  var quantity = req.params.quantity;
  resp.quantity = quantity;
  console.log("The ID is " + id + " and the quantity to add is " + quantity);
  var sql = 'Update sixel004.current_transaction set quantity = (quantity + ' + quantity + ') where invID = ' + id;
  console.log("Attempting sql ->" + sql + "<-");

  connection.query(sql, (function(res){
    return function(err,rows,fields){
     if(err){
       resp.err = err;
       console.log("Houston we have a problem (again): ");
       console.log(err);
     }
     res.send(resp);
  }})(res));
});

app.get("/removeItem/:id", function(req,res){
  var resp = {};
  resp.message = "Testing things in resp";
  var id = req.params.id;
  var sql = 'DELETE FROM sixel004.current_transaction where invID = ' + id;
  console.log("Attempting sql ->" + sql + "<-");

  connection.query(sql,(function(res){
    return function(err,rows,fields){
     if(err){
       resp.err = err;
       console.log("Houston we have a problem (again): ");
       console.log(err);
     }
     res.send(resp);
  }})(res));
});

app.get("/truncate", function(req,res){
  var sql = 'TRUNCATE sixel004.current_transaction';
  console.log("Attempting sql ->" + sql + "<-");

  connection.query(sql,(function(res){
    return function(err,rows,fields){
     if(err){
       resp.err = err;
       console.log("Houston we have a problem (again): ");
       console.log(err);
     }
     res.send(err); // Let the upstream guy know how it went
  }})(res));
});


// Your other API handlers go here!

app.listen(port);

console.log("Server started on localhost:"+port);
