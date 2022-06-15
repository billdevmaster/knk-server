const express = require('express');
const lootboxCtrl = require('../controller/lootboxCtrl.js');
const router = express.Router();

router.get('/getRandomLoot', lootboxCtrl.getRandLoot);
router.post('/mintLootbox', lootboxCtrl.mintLootbox);
router.get('/test', (req, res) => {
    res.json({"status": "success"});
})

module.exports = router;