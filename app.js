const express = require('express');

const app = express();

const date = require(__dirname + '/date.js');
const day = date.getDate();

const items = [];
const workItems = [];

app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get('/', function(req, res) {
  let homeActivity = "active";
  let workActivity = "";
  res.render("list", {
    listTitle: "Home List: " + day,
    newListItems: items,
    homeMenuLink: homeActivity,
    workMenuLink: workActivity
  });

});

app.post('/', function(req, res) {
  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect('/work');
  } else {
    items.push(item);
    res.redirect('/');
  }

});

app.get('/work', function(req, res) {
  let homeActivity = "";
  let workActivity = "active";
  res.render("list", {
    listTitle: "Work List: " + day,
    newListItems: workItems,
    homeMenuLink: homeActivity,
    workMenuLink: workActivity
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000.");
});
