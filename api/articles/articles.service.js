const Article = require("./articles.schema");
const User = require("../users/users.model");

class ArticlesService {
  async isAdmin(id) {
    const user = await User.findById(id);
    if (user.role !== "admin") {
      return false;
    }
    return true;
  }
  async getArticlesByUserId(userId) {
    const articles = await Article.find({ user: userId}).populate({
      path: 'user',
      select: 'name- password',
    });
    return articles;
  }
  getAll() {
    return Article.find({});
  }
  create(data) {
    const article = new Article(data);
    return article.save();
  }
  update(id, data) {
    return Article.findByIdAndUpdate(id, data, { new: true });
  }
  delete(id) {
    return Article.deleteOne({ _id: id });
  }
}

module.exports = new ArticlesService();
