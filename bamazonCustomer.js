// Required NPM Packages
var mysql = require("mysql");
var inquirer = require("inquirer");

// SQL database connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});

// Connect to bamazon_db
connection.connect(function (err) {
    if (err) throw err;
    availableProducts();
});

function availableProducts() {
    // MySQL Query
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([{
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].product_name);
                            // Figure out how to pull complete data for each item. 
                            // console.log shows data but in a JSON format
                            console.log(results[i]);
                        }
                        return choiceArray;
                    },
                    message: "What item would you like to purchase? (Please see JSON for available QTY"
                },
                {
                    name: "qty",
                    type: "input",
                    message: "How many items would you like to include in your purchase?"
                }
            ])
            .then(function (answer) {
                var chosenProduct;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].product_name === answer.choice) {
                        chosenProduct = results[i];
                    }
                }

                if (chosenProduct.stock_quantity > parseInt(answer.qty)) {
                    newQty = chosenProduct.stock_quantity - answer.qty;
                    connection.query(
                        // update data base if there is enough product to fullfil the order
                        "UPDATE products SET ? WHERE ?", [{
                                stock_quantity: newQty
                            },
                            {
                                id: chosenProduct.id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("Your order has successfully place! Thank you for shopping at Bamazon!");
                            availableProducts();
                        }
                    );
                } else {
                    console.log("Unfortunatly, the quantity selected is not avaiable. Please select a lower quantity...");
                    availableProducts();
                }
            });
    });
}
