const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');
const auth = require('../../middleware/auth');
const authRole = require('../../middleware/role');


router.get('/', auth, async (req, res) => {

    try {
        const foundNotification = await Notification.find({});
        if (foundNotification) {
            res.json(foundNotification);
        }

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})

router.get('/specific/:notificationId', auth, async (req, res) => {

    try {
        const foundNotification = await Notification.findById(req.params.notificationId);
        if (foundNotification) {
            res.json(foundNotification);
        }
    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }
})


router.post('/create', auth, authRole("admin"), async (req, res) => {

    const {
        title,
        desc
    } = req.body;

    try {

        const note = new Notification({
            title,
            desc,
            createdBy: req.user.id
        })
        const saved = await note.save();
        if (saved) {
            res.json({
                status: "success",
                "message": "Notification Posted"
            })
        }

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})


router.post('/update/:notificationId', auth, authRole("admin", "hr"), async (req, res) => {

    const {
        title,
        desc
    } = req.body;

    try {

        const updated = await Notification.findByIdAndUpdate(req.params.notificationId, {
            $set: {
                title,
                desc
            }
        });

        if (updated) {
            res.json({
                status: "success",
                "message": "Notification Updated"
            })
        }

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})


router.delete('/delete/:notificationId', auth, authRole("admin", "hr"), async (req, res) => {


    try {

        const deleted = await Notification.findByIdAndDelete(req.params.notificationId);
        if (deleted) {
            res.json({
                status: "success",
                "message": "Notification Deleted"
            })
        }

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})
module.exports = router;