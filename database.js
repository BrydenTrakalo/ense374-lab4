const mongoose = require("mongoose");//add all boilerplate code up here

//connect mongoose to a database called testdb
mongoose.connect("mongodb://localhost:27017/labDB", 
                {useNewUrlParser: true, 
                 useUnifiedTopology: true});

//we need to use await after database read/write to make everything sycronous

async function databaseCalls (){
    var userTemplate ={
        username: "",
        password: ""
    }
    //user schema
    const userSchema = new mongoose.Schema ({
        username: String,
        password: String
    });
    //task schema
    const taskSchema = new mongoose.Schema ({
        name: String,
        owner: userTemplate,
        creator: userTemplate,
        done: Boolean,
        cleared: Boolean
    });

    //create a collection of users from the userSchema
    const User = mongoose.model("User", userSchema);
    //create a collection of tasks from the taskSchema
    const Task = mongoose.model("Task", taskSchema);

    //crwate a new user in Users collection
    const user = new User ({
        username: "test",
        password: "123"
    });
    //crwate a new task in Tasks collection
    const task = new Task ({
        name: "first",
        owner: null,
        creator: null,
        done: false,
        cleared: false
    });

    //save your record, adds a new line every time we run the database so dont use
    //await user.save();
    //await task.save();
    //update a user
    // await User.updateOne ({ username: "test"}, {$set: {password: "1234"}}, function(err){
    //     if (err) {
    //         console.log(err);
    //     }
    // });
    // await User.insertMany([
    //     { username: "test1@a.ca", password: "123"},
    //     { username: "test2@a.ca", password: "123"},
    //     { username: "test3@a.ca", password: "123"},
    //     { username: "test4@a.ca", password: "123"},
    // ]);

    await User.find(function(err, results) {
        if (err) {
            console.log(err);
        } else {
            //console.log(results)
            myUser = results;
        }
        // dangerous to close in an async function without await!
        //mongoose.connection.close()
    });
    await Task.insertMany([
        { name: "Unclaimed task", owner: undefined, creator: myUser[6], done: false, cleared: false},
        { name: "claimed by user1 and unfinished", owner: myUser[6], creator: myUser[6], done: false, cleared: false},
        { name: "claimed by user2 and unfinished", owner: myUser[7], creator: myUser[6], done: false, cleared: false},
        { name: "claimed by user1 and finished", owner: myUser[6], creator: myUser[6], done: true, cleared: false},
        {name: "claimed by user2 and finished", owner: myUser[7], creator: myUser[6], done: true, cleared: false}
    ]);






    await Task.find(function(err, results) {
        if (err) {
            console.log(err);
        } else {
            //console.log(results);
            tasks = results;
        }
        for (var i=0;i<tasks.length;i++){
            console.log(tasks[i].name);
        }
        // dangerous to close in an async function without await!
        mongoose.connection.close()
    });
}

databaseCalls();