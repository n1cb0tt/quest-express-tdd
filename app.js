// app.js
const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();
const connection = require("./connection");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World!" });
});

app.post("/bookmarks", (req, res) => {
    if (!req.body.url || !req.body.title) {
        res.status(422).json({ error: "required field(s) missing" });
    } else {
        connection.query(
            "INSERT INTO `bookmark` (`url`, `title`) VALUES (?)",
            [Object.values(req.body)],
            (err, resultInsert) => {
                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else {
                    connection.query(
                        "SELECT `url`, `title` FROM `bookmark` WHERE id = ?",
                        [resultInsert.insertId],
                        (err, resultSelect) => {
                            resultSelect = JSON.parse(JSON.stringify(resultSelect[0]));
                            res.status(201).json({
                                id: resultInsert.insertId,
                                url: resultSelect.url,
                                title: resultSelect.title,
                            });
                        }
                    );
                }
            }
        );
    }
});

app.get("/bookmarks/:id", (req, res) => {
    connection.query("SELECT `id`, `url`, `title` FROM `bookmark` WHERE id = ?", [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            if (result.length === 0) {
                res.status(404).json({ error: "Bookmark not found" });
            } else {
                res.status(200).json(result[0]);
            }
        }
    });
});

module.exports = app;
