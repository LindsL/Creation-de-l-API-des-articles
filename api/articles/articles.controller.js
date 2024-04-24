const articlesService = require("./articles.service");
const UnauthorizedError = require("../../errors/unauthorized");

class ArticlesController {
  async getAll(res, next) {
    try {
      const articles = await articlesService.getAll();
      res.json(articles);
    } catch (err) {
      next(err);
    }
  }
  async create(req, res, next) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const articleData = {
        ...req.body,
        user: req.user,
        status: req.enum,
        role: req.user.role
      };
      const article = await articlesService.create(articleData);
      req.io.emit("article:create", article);
      res.status(201).json(article);
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      const id = req.params.id;
      const isAdmin = await articlesService.isAdmin(req.user);
      const data = req.body;
      if (!isAdmin) {
        throw new UnauthorizedError();
      }
      const articleModified = await articlesService.update(id, data);
      res.status(201).json(articleModified);
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const isAdmin = await articlesService.isAdmin(req.user);
      if (!isAdmin) {
        throw new UnauthorizedError();
      }
      await articlesService.delete(id);
      req.io.emit("article:delete", { id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ArticlesController();
