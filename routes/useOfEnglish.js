const express = require("express")
const router = express.Router()
const useOfEnglishController = require("../controllers/UseOfEnglishController")

router.post("/create", useOfEnglishController.create)
router.get("/all", useOfEnglishController.getLevels)
router.put("/:level/update-name", useOfEnglishController.editLevel)
router.delete("/:level/delete", useOfEnglishController.deleteLevel)
router.get("/:level/games", useOfEnglishController.getGamesByLevel)
router.post("/:level/add-game", useOfEnglishController.addGames)
router.put("/:level/delete-game", useOfEnglishController.deleteGame)
router.put("/:level/update-game-orders", useOfEnglishController.updateGamesOrder)
router.put("/edit-game/:game", useOfEnglishController.editGame)
router.post("/get-progress", useOfEnglishController.getProgress)

module.exports = router

