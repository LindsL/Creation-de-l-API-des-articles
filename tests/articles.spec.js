const request = require("supertest");
const { app, server } = require("../server");
const { log } = require("../logger");
const jwt = require("jsonwebtoken");
const config = require("../config");
const mongoose = require("mongoose");
const mockingoose = require("mockingoose");
const Article = require("../api/articles/articles.schema");
const User = require("../api/users/users.model");
const articlesService = require("../api/articles/articles.service");




beforeAll(async () => {
  await server.listen(config.port);
  log(`Server listening on port ${config.port}`);
  log("Socket.IO Connection établie");
  console.log("Un utilisateur est connecté");
})


/**** * TESTS POUR LES UTILISATEURS  ADMIN ********/
describe("Creation de l\'API DES ARTICLES --- ", () => {
  let token;
  const USER_ID = new mongoose.Types.ObjectId();
  const ARTICLE_ID = "fake";
  const MOCK_DATA_USER = {
    _id: USER_ID,
    name: "Lindsay",
    email: "lindsay@test.fr",
    role: "admin",
  };
  const MOCK_ARTICLE_DATA = {
    title: "Ceci est un titre ",
    content: "Ceci est un contenu",
    status: "draft",

  };
  const MOCK_ARTICLE_DATA_CREATED = {
    _id: ARTICLE_ID,
    title: "Création d'un titre ",
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
    ut labore et dolore magna aliqua. Faucibus purus in massa tempor. Amet purus gravida quis blandit
    turpis cursus. Malesuada bibendum arcu vitae elementum curabitur vitae. Quam nulla porttitor massa
    id neque aliquam.`,
    user: USER_ID,
    status: "published",
  };

  beforeEach(() => {
    token = jwt.sign({ user: USER_ID }, config.secretJwtToken);
    log(`Utilisateur connecté: ${MOCK_DATA_USER.name}, \nRole: ${MOCK_DATA_USER.role}\n`);
    mockingoose(User).toReturn(MOCK_DATA_USER, "findOne");
    mockingoose(Article)
      .toReturn(MOCK_ARTICLE_DATA_CREATED, "save")
      .toReturn(MOCK_ARTICLE_DATA_CREATED, "findOneAndUpdate");
  });

  test("Création d\'un article", async () => {
    const res = await request(app)
      .post("/api/articles")
      .set("x-access-token", token)
      .send({ ...MOCK_ARTICLE_DATA, user: USER_ID });
    console.log(res.body);
    log("Création d\'un article \nResponse:" 
    + JSON.stringify(res.body) + `\n` 
    + "L\'article a été créé!");
    expect(res.status).toBe(201);
    expect(res.body.user.toString()).toBe(
      MOCK_ARTICLE_DATA_CREATED.user.toString()
    );
    expect(res.body.title).toBe(MOCK_ARTICLE_DATA_CREATED.title);
    expect(res.body.content).toBe(MOCK_ARTICLE_DATA_CREATED.content);
  });

  test("Mise à jour d\'un article par un admin" , async () => {
    const res = await request(app)
      .put(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token)
      .send(ARTICLE_ID, { ...MOCK_ARTICLE_DATA, user: USER_ID });
    log("Mise à jour d\'un article par un admin \nResponse:" 
    + JSON.stringify(res.body) + `\n` 
    + "L\'article a été mis à jour !");
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.user.toString()).toBe(MOCK_DATA_USER._id.toString());
    expect(res.body.title).toBe(MOCK_ARTICLE_DATA_CREATED.title);
    expect(res.body.content).toBe(MOCK_ARTICLE_DATA_CREATED.content);
  });

  test("Suppression d\'un article par un admin", async () => {
    const res = await request(app)
      .delete(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token)
      .send();
    log("Suppression d\'un article par un admin \nResponse: " 
    + JSON.stringify(res.body) + `\n` 
    + "L\'article a bien été mis à supprimé !");
    expect(res.status).toBe(204);
  });
  
  afterEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();

  });
});
/**** * TESTS POUR LES UTILISATEURS NON ADMIN ********/

describe("Tests pour un utilisateur membre --- ", () => {
  let memberToken;
  const MEMBER_ID = new mongoose.Types.ObjectId();
  const ARTICLE_ID = "member_fake";
  const MOCK_MEMBER_DATA = {
    _id: MEMBER_ID,
    name: "Daisy",
    email: "daisy@test.fr",
    role: "member",
  };

  const MOCK_ARTICLE_DATA = {
    title: "Ceci est un titre ",
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
    ut labore et dolore magna aliqua. Faucibus purus in massa tempor. Amet purus gravida quis blandit
    turpis cursus. Malesuada bibendum arcu vitae elementum curabitur vitae. Quam nulla porttitor massa
    id neque aliquam. Pellentesque habitant morbi tristique senectus et. Eleifend donec pretium vulputate sapien 
    nec sagittis aliquam malesuada bibendum. Ut pharetra sit amet aliquam id. Placerat vestibulum lectus mauris 
    ultrices eros in cursus.`,
    status: "draft",

  };
  const MOCK_ARTICLE_DATA_CREATED = {
    _id: ARTICLE_ID,
    title: "Création d'un titre ",
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
    ut labore et dolore magna aliqua. Faucibus purus in massa tempor. Amet purus gravida quis blandit
    turpis cursus. Malesuada bibendum arcu vitae elementum curabitur vitae. Quam nulla porttitor massa
    id neque aliquam. Pellentesque habitant morbi tristique senectus et. Eleifend donec pretium vulputate sapien 
    nec sagittis aliquam malesuada bibendum. Ut pharetra sit amet aliquam id. Placerat vestibulum lectus mauris 
    ultrices eros in cursus.`,
    user: MEMBER_ID,
    status: "draft",
  };
  beforeEach(() => {
    memberToken = jwt.sign({ user: MEMBER_ID }, config.secretJwtToken);
    log(`Utilisateur connecté: ${MOCK_MEMBER_DATA.name}, \nRole: ${MOCK_MEMBER_DATA.role}\n`);
    mockingoose(User).toReturn(MOCK_MEMBER_DATA, "findOne");
    mockingoose(Article)
      .toReturn(MOCK_ARTICLE_DATA_CREATED, "save")
      .toReturn(MOCK_ARTICLE_DATA_CREATED, "findOneAndUpdate");
  });

  test("Création d'un article par un membre", async () => {
    const res = await request(app)
      .post("/api/articles")
      .set("x-access-token", memberToken)
      .send({ ...MOCK_ARTICLE_DATA, user: MEMBER_ID });
    log("Création d'un article par un membre \nResponse:" + JSON.stringify(res.body) + `\n` + "L'article a été créé !");
    expect(res.status).toBe(201);
    expect(res.body.user.toString()).toBe(MOCK_ARTICLE_DATA_CREATED.user.toString());
    expect(res.body.title).toBe(MOCK_ARTICLE_DATA_CREATED.title);
    expect(res.body.content).toBe(MOCK_ARTICLE_DATA_CREATED.content);
  });

  test("Tentative de mise à jour d'un article par un membre", async () => {
    const res = await request(app)
      .put(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", memberToken)
      .send(ARTICLE_ID, { ...MOCK_ARTICLE_DATA, user: MEMBER_ID });
    log("Tentative de mise à jour d'un article par un membre"+ "\n Attendu: 401, Unauthorized" + "\nResponse:" + JSON.stringify(res.body));
    expect(res.status).toBe(401); // Forbidden status code
    expect(res.body.message).toBe("Unauthorized");
  });

  test("Tentative de suppression d'un article par un membre", async () => {
    const res = await request(app)
      .delete(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", memberToken)
      .send();
    log("Tentative de suppression d'un article par un membre"+ "\n Attendu: 401, Unauthorized" + "\nResponse: " + JSON.stringify(res.body));
    expect(res.status).toBe(401); // Forbidden status code
    expect(res.body.message).toBe("Unauthorized");
  });

  afterEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();
  });
});


/**  Récupération des articles de l'utilisateur par userID **/
describe('Test de la fonction getArticlesByUserId', () => {
    test("Doit retourner les articles de l\'utilisateur si des articles existent", async () => {
      
      console.log("Doit retourner les articles de l\'utilisateur si des articles existent");
      const userId = new mongoose.Types.ObjectId();

      const MOCK_USER_DATA = {
        _id: userId,
        name: "Mario",
        email: "mario@test.fr",
        role: "member",
      };
        const articles = [
            { _id: MOCK_USER_DATA._id, title: 'Ceci est un premier titre', content: 'Ceci est le contenu de l\'article 1', user: MOCK_USER_DATA._id,},
            { _id: MOCK_USER_DATA._id, title: 'Ceci est un second titre', content: 'Ceci est le contenu de l\'article 2', user: MOCK_USER_DATA._id, }
        ];
        mockingoose(Article).toReturn(articles, 'find');
        
        const result = await articlesService.getArticlesByUserId(userId);
        log("Doit retourner les articles de l\'utilisateur si des articles existent"+`\n`
        + "Utilisateur ID:" 
        + userId +`\n`
        + "Resultat : "+ JSON.stringify(result));
        expect(result.length).toBe(2);
        expect(result[0].title).toBe(articles[0].title);
        expect(result[0].content).toBe(articles[0].content);
        expect(result[0].user).toBe(articles[0].user);

        expect(result[1].title).toBe(articles[1].title);
        expect(result[1].content).toBe(articles[1].content);
        expect(result[1].user).toBe(articles[1].user);

    });
});

afterAll((done) => {
  server.close(() => {
    log('Server closed');
    done();
  });
}); 