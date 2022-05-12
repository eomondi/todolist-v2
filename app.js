//______________________________________________________________________________________________________________

// Require Express
const express = require('express');

// Require Mongoose
const mongoose = require('mongoose');

// Require Lodash
const _ = require('lodash');

// Create Express App
const app = express();

// Create Mongoose Database
mongoose.connect('mongodb+srv://emmanuel-admin:test-123@cluster0.jfq8w.mongodb.net/todolistDB');

// Require Custom Date Module
const date = require(__dirname + '/date.js');

// Create Date with Custom Date Module
const day = date.getDate();

// Use EJS
app.set('view engine', 'ejs');

// Parse Incoming Requests with Express
app.use(express.urlencoded({
  extended: true
}));

// Serve Static Files with Express
app.use(express.static("public"));

//______________________________________________________________________________________________________________

// Create Items Schema with Mongoose
const itemsSchema = new mongoose.Schema({
  name: String
});

// Create Item Model with Mongoose
const Item = mongoose.model('Item', itemsSchema);

// Create Default Items with Mongoose
const item1 = new Item({
  name: 'Welcome to your to-do list!'
});
const item2 = new Item({
  name: 'Hit + to add a new item.'
});
const item3 = new Item({
  name: '<— Hit this to delete an item.'
});

// Add Default Items into an Array
const defaultItems = [item1, item2, item3]

//______________________________________________________________________________________________________________

// Create Lists Schema with Mongoose
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

// Create Lists Model with Mongoose
const List = mongoose.model('List', listSchema);

//______________________________________________________________________________________________________________

// GET Home Route with Express
app.get('/', function(req, res) {
  // Sets "home" in navbar to active
  let homeActivity = "active";
  // Adds defaultItems to to-do list when app starts for the first time (Mongoose) then displays home page (EJS)
  // Mongoose
  Item.find({}, function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err, items) {
        if (err) {
          console.log(err);
        } else {
          console.log('Successfully saved default items to database.');
        }
      });
      // EJS
      res.redirect('/');
    } else {
      // Displays defaultItems on home page if it's NOT the first time the app is starting (EJS)
      res.render("list", {
        listTitle: "Today",
        newListItems: items,
        homeMenuLink: homeActivity,
        day: day
      });
    }
  });
});

//______________________________________________________________________________________________________________

// GET Custom Route with Express
app.get('/:customListName', function(req, res) {
  // Sets "home" in navbar to INACTIVE
  homeActivity = "";
  //Creates custom parameter name based on the URL typed by user with Express and Lodash
  const customListName = _.lowerCase(req.params.customListName);
  // Adds defaultItems to CUSTOM to-do list when app starts for the first time (Mongoose) then displays home page (EJS)
  // Mongoose
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new custom list using Lists Schema with Mongoose
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        // EJS
        res.redirect('/' + customListName);
      } else {
        // Displays existing custom list if it exists (EJS and Lodash)
        res.render("list", {
          listTitle: _.startCase(foundList.name),
          newListItems: foundList.items,
          homeMenuLink: homeActivity,
          day: day
        });
      }
    }
  });
});

//______________________________________________________________________________________________________________

// POST Home Route with Express
app.post('/', function(req, res) {
  //Create item name from whatever user types in input with Express
  const itemName = req.body.newItem;
  //Create list name from button, which is identified by EJS listTitle with Express
  const listName = req.body.list;

  //Add list item to home page
  if (listName === "Today") {
    //Create new to-do list item using Items Schema with Mongoose
    const item = new Item({
      name: itemName
    });
    // Save with Mongoose
    item.save();
    // Display home page with EJS
    res.redirect('/');
  } else {
    // Create a new custom list item using Lists Schema with Mongoose
    const list = new List({
      name: itemName,
      items: listName
    });
    // Add list item to custom list with Mongoose and Lodash
    List.findOne({
      name: _.lowerFirst(listName)
    }, function(err, foundList) {
      // Add with Mongoose
      foundList.items.push(list);
      // Save with Mongoose
      foundList.save();
      // Display with EJS
      res.redirect('/' + listName);
    });
  }

});

//______________________________________________________________________________________________________________

// Delete Checked Items with Express
app.post('/delete', function(req, res) {
  // Create deleted list item (Mark it for deletion with Mongoose and Express)
  const checkedItemId = req.body.checkbox;
  // Create correct list name for item to delete
  const listName = req.body.listName;
  // Delete list item from home page
  if (listName === "Today") {
    // Delete with Mongoose
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Successfully deleted item from database.');
      }
    });
    // Display with EJS
    res.redirect('/');
  } else {
    // Delete list item from custom list with Mongoose and MongoDB
    // Mongoose and Lodash
    List.findOneAndUpdate({
      name: _.lowerFirst(listName)
    }, {
      // MongoDB
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      // Display withEJS
      if (!err) {
        res.redirect('/' + listName);
      }
    });
  }

});

//______________________________________________________________________________________________________________

// Serve app
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, function(){
  console.log('Server has started successfully.');
});
