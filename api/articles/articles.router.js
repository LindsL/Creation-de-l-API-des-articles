const express = require("express");
const articlesController = require("./articles.controller");
const router = express.Router();

router.get("/", articlesController.getAll);
router.post("/", articlesController.create);
router.put("/:id", articlesController.update);
router.delete("/:id", articlesController.delete);

router.get('/users/:userId/articles', async (req, res) => {
    const userId = req.params.userId;
    try {
        const articles = await articlesService.getArticlesByUserId(userId);
        if (articles.length === 0) {
            return res.status(404).json({ message: "Aucun article trouvé pour cet utilisateur." });
        }
        res.status(200).json(articles);
    } catch (error) {
        console.error("Erreur lors de la récupération des articles de l'utilisateur:", error);
        res.status(500).json({ message: "Une erreur s'est produite lors de la récupération des articles de l'utilisateur." });
    }
});



module.exports = router;