const express = require('express');
const router = express.Router();
const Todo = require('../../models/Todo');
const auth = require('../../middleware/auth');

router.get("/", auth, async function (req, res) {

    try {
        const foundTodo = await Todo.find({ userId: req.user.id });
        res.json(foundTodo);
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        })
    }

});

router.post("/create", auth, async (req, res) => {
    const { title, desc } = req.body;

    try {
        const todo = new Todo({
            title,
            desc,
            userId: req.user.id
        });

        const saved = await todo.save();
        if (saved) {
            res.json({
                status: "success",
                message: "Todo Created"
            })
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        })
    }
});

router.post('/complete', auth, async (req, res) => {

    const { todoId } = req.body;
    try {
        const todoItem = await Todo.findOne({ _id: todoId });

        if (todoItem.completed) {
            await Todo.findByIdAndUpdate(todoId, { $set: { completed: false } });
            res.json({
                "isComplete": false,
                status: "success",
                message: "Todo item inCompleted"
            })
        } else {
            await Todo.findByIdAndUpdate(todoId, { $set: { completed: true } });
            res.json({
                "isComplete": true,
                status: "success",
                message: "Todo item Completed"
            })
        }

    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        })
    }

})

router.delete("/delete/:todoId", auth, async (req, res) => {

    try {
        const delTodo = await Todo.findByIdAndDelete(req.params.todoId);
        if (delTodo) {
            res.json({
                status: "success",
                message: "Todo Deleted"
            })
        }

    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        })
    }


});

module.exports = router;