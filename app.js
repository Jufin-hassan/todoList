const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');//JS utility Library

const app = express();

mongoose.connect('mongodb://localhost/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

//Some depracation Warnings
mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine','ejs');

//Schema
const itemSchema = mongoose.Schema({
   
    name : String
});

//Model
const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name : "Welcome to To-do-List"
});

const  item2 = new Item({
    name : "Press + Button to Add"
});

const item3 = new Item({
    name : "<---- Hit This to delete an item"
});

const defaultItems = [item1,item2,item3]

const listSchema = mongoose.Schema({
    name : String,
    items : [itemSchema] 
});

const List = mongoose.model("List",listSchema);

app.get("/",(req,res) => {

    Item.find( (err,items) => {
      
          if(items.length === 0){
            Item.insertMany(defaultItems, (err) => {
            
                console.log("Inserted basic needs!");
                res.redirect("/");
            })
          }
          else
            res.render('list', {pageTite:"Today", items:items});
            
    } );

})

app.get("/:route",(req,res) => {
    const customList = _.capitalize(req.params.route);
    //capitalizing the first letter of the list

    List.findOne({name : customList}, (err,foundList) => {
        if (!err) {
            //Creating New List
            if (!foundList) {
                const list = new List({
                    name : customList,
                    items : defaultItems
                });
                list.save()
                res.redirect("/"+customList);  
            }
            else{
                //Rendering Saved List
                res.render("list", {pageTite : foundList.name, items : foundList.items});
            }
        }
    })
})

app.post("/", (req,res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const NewItem = new Item({
        name : itemName
    });

    if(listName === "Today"){
        NewItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name : listName}, (err,listItems) => {
            listItems.items.push(NewItem);
            listItems.save();
            res.redirect("/"+listName);
        })
    }
    
   
})

app.post("/delete", (req,res) => {
    const deleteId = req.body.checkbox;
    const listName = req.body.listName   

    if (listName === "Today") {
        Item.findByIdAndRemove(deleteId, (err) => {
            if(err)
                console.log(err);
            else
                console.log("Deleted!");
                res.redirect("/");
        })
    }else{
        List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : deleteId}}}, (err,foundItem) => {
            if (!err) {
                res.redirect("/"+listName);
            }
        })
    }
   
   
})


app.listen(3000,() => {
    console.log("Port started at 3000");
})
