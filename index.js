require("dotenv").config({ path: "./vars/.env" });
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const client = require("ssh2-sftp-client");

// Déstructuration des variables d'environement (process.env)
const { PORT_NODE, HOST, USERNAME, PASSWORD, HOST_PATH } = process.env;
const app = express();

const config = {
  host: HOST,
  username: USERNAME,
  password: PASSWORD,
};

let sftp = new client();
sftp.connect(config);

// ! Import des helpers
const { eq } = require("./helper");

app.engine(
  "hbs",
  engine({
    // ! initialisation des helpers dans notre handlebars
    helpers: {
      eq,
    },
    extname: "hbs",
    defaultLayout: "layout",
  })
);
app.set("view engine", "hbs");
app.set("views", "./views");

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  // Fonction de comparaison pour trier en fonction de la clé
  const comparerParCle = (a, b) => {
    const valeurA = a.name;
    const valeurB = b.name;

    if (valeurA < valeurB) {
      return -1;
    } else if (valeurA > valeurB) {
      return 1;
    } else {
      return 0;
    }
  };

  sftp
    .list(HOST_PATH)
    .then((data) => {
      // Utilisation de array.sort pour trier le tableau d'objets
      data.sort(comparerParCle);
      // Utilisation de array.filter pour filtrer les objets dont la valeur de la clé name ne commence pas par un point
      const dataFiltered = data.filter((data) => !data.name.startsWith("."));
      res.render("home", { dataFiltered });
    })
    .catch((err) => {
      console.error(err.message);
    });
});

app.get("/linux/:file", (req, res) => {
    const { file } = req.params;
    const fileReplace = file
      .replace(/[(]/g, "%28")
      .replace(/[)]/g, "%29")
      .replace(/ /g, "%20");
  
    // Utilisation de la fonction "exec" du module "child_process" de Node.js pour exécuter la commande
    const { exec } = require("child_process");
    exec(
      `vlc https://${USERNAME}:${PASSWORD}@bit.seedhost.eu/rhoformeur/downloads/${fileReplace}`,
      (erreur, stdout, stderr) => {
        if (erreur) {
          console.error(
            `Erreur lors de l'exécution de la commande : ${erreur.message}`
          );
          return;
        }
        console.log(`Sortie de la commande : ${stdout}`);
        console.error(`Erreur de la commande : ${stderr}`);
      }
    );
    res.send("Lecture en cours sur VLC!");
  });
  
  app.get("/linux/:parent/:file", (req, res) => {
    const { file } = req.params;
    const { parent } = req.params;
  
    const fileReplace = file
      .replace(/[(]/g, "%28")
      .replace(/[)]/g, "%29")
      .replace(/ /g, "%20");
    const parentReplace = parent
      .replace(/[(]/g, "%28")
      .replace(/[)]/g, "%29")
      .replace(/ /g, "%20");
  
    // Utilisation de la fonction "exec" du module "child_process" de Node.js pour exécuter la commande
    const { exec } = require("child_process");
    exec(
      `vlc https://${USERNAME}:${PASSWORD}@bit.seedhost.eu/rhoformeur/downloads/${parentReplace}/${fileReplace}`,
      (erreur, stdout, stderr) => {
        if (erreur) {
          console.error(
            `Erreur lors de l'exécution de la commande : ${erreur.message}`
          );
          return;
        }
        console.log(`Sortie de la commande : ${stdout}`);
        console.error(`Erreur de la commande : ${stderr}`);
      }
    );
    res.send("Lecture en cours sur VLC!");
  });
  
  app.get("/linux/:parent/:dir/:file", (req, res) => {
    const { file } = req.params;
    const { parent } = req.params;
    const { dir } = req.params;
  
    const fileReplace = file
      .replace(/[(]/g, "%28")
      .replace(/[)]/g, "%29")
      .replace(/ /g, "%20");
    const parentReplace = parent
      .replace(/[(]/g, "%28")
      .replace(/[)]/g, "%29")
      .replace(/ /g, "%20");
    const dirReplace = dir
      .replace(/[(]/g, "%28")
      .replace(/[)]/g, "%29")
      .replace(/ /g, "%20");
    // Utilisation de la fonction "exec" du module "child_process" de Node.js pour exécuter la commande
    const { exec } = require("child_process");
    exec(
      `vlc https://${USERNAME}:${PASSWORD}@bit.seedhost.eu/rhoformeur/downloads/${parentReplace}/${dirReplace}/${fileReplace}`,
      (erreur, stdout, stderr) => {
        if (erreur) {
          console.error(
            `Erreur lors de l'exécution de la commande : ${erreur.message}`
          );
          return;
        }
        console.log(`Sortie de la commande : ${stdout}`);
        console.error(`Erreur de la commande : ${stderr}`);
      }
    );
    res.send("Lecture en cours sur VLC!");
  });

app.get("/:dir", (req, res) => {
  const { dir } = req.params;
  // Fonction de comparaison pour trier en fonction de la clé
  const comparerParCle = (a, b) => {
    const valeurA = a.name;
    const valeurB = b.name;

    if (valeurA < valeurB) {
      return -1;
    } else if (valeurA > valeurB) {
      return 1;
    } else {
      return 0;
    }
  };

  sftp
    .list(HOST_PATH + `/${dir}`)
    .then((data) => {
      // Utilisation de array.sort pour trier le tableau d'objets
      data.sort(comparerParCle);
      // Utilisation de array.filter pour filtrer les objets dont la valeur de la clé name ne commence pas par un point
      const dataFiltered = data.filter((data) => !data.name.startsWith("."));
      const key = "parent";
      dataFiltered.forEach((object) => {
        object[key] = `${dir}`;
      });
      res.render("home", { dataFiltered });
    })
    .catch((err) => {
      console.error(err.message);
    });
});

app.get("/:parent/:dir", (req, res) => {
  const { parent } = req.params;
  const { dir } = req.params;
  // Fonction de comparaison pour trier en fonction de la clé
  const comparerParCle = (a, b) => {
    const valeurA = a.name;
    const valeurB = b.name;

    if (valeurA < valeurB) {
      return -1;
    } else if (valeurA > valeurB) {
      return 1;
    } else {
      return 0;
    }
  };

  sftp
    .list(HOST_PATH + `/${parent}` + `/${dir}`)
    .then((data) => {
      // Utilisation de array.sort pour trier le tableau d'objets
      data.sort(comparerParCle);
      // Utilisation de array.filter pour filtrer les objets dont la valeur de la clé name ne commence pas par un point
      const dataFiltered = data.filter((data) => !data.name.startsWith("."));
      const key = "parent";
      dataFiltered.forEach((object) => {
        object[key] = `${parent}` + `/` + `${dir}`;
      });
      res.render("home", { dataFiltered });
    })
    .catch((err) => {
      console.error(err.message);
    });
});



// On demarre notre app en lui demandant d'être à l'écoute du port
app.listen(PORT_NODE, () =>
  console.log(`Server start on localhost:${PORT_NODE} 🚀`)
);
