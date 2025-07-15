//Objet Joueur
class Joueur {
  constructor(nom) {
    this.nom = nom;
    this.gagne= false;
  }
}


//objet piece
var Piece = function (type, joueur, direction, position = undefined) {
  this.type = type;
  this.joueur = joueur;
  this.position = position;
  this.direction = direction;
  this.cliquable = false;
}

Piece.prototype.toString = function () {
  if(this.type == "rocher"){
    return "C";
  }
  return this.type[0];
}

Piece.prototype.compareDirection = function (concu = Piece()) {
  if (((this.direction == "up") && (concu == "down")) || ((this.direction == "left") && (concu == "right"))) {
    return 1;
  } else if (((this.direction == "down") && (concu == "up")) || ((this.direction == "right") && (concu == "left"))) {
    return 1;
  } else return 0;
}


//objet Plateau
var Plateau = function (lig, col) {
  this.dim = [lig, col];
  this.pieces = Array(lig).fill().map(() => Array(col).fill(undefined)); // Tableau 7x5 pour le plateau
  this.nbTours = 0;
  this.sorti=false;
}

//initialisation du PLateau
Plateau.prototype.init = function (joueur1 = j1, joueur2 = j2) {
  for (var i = 0; i < this.dim[1]; i++) {
    this.pieces[0][i] = new Piece("rhino", joueur1, "down");
    this.pieces[this.dim[0] - 1][i] = new Piece("elephant", joueur2, "up");
  }
  var mid;
  if (this.dim[0] % 2 == 1) {
    mid = Math.floor((this.dim[0] / 2));
  } else {
    mid = Math.floor((this.dim[0] / 2)) - 1;
  }
  for (let i = 1; i < this.dim[1] - 1; i++) {
    this.pieces[mid][i] = new Piece("rocher", "Plat", undefined, [mid, i]);
  }
}

Plateau.prototype.toString = function () {
  let mess = "";
  for (var i = 0; i < this.dim[0]; i++) {
    let messLig = "";
    for (var j = 0; j < this.dim[1]; j++) {
      if (this.pieces[i][j] == undefined) {
        if (j == this.dim[1] - 1) {
          messLig += "   ";
        } else messLig += "   ,";
      }
      if ((typeof (this.pieces[i][j])) == "object") {
        if (j == this.dim[1] - 1) {
          messLig += " " + this.pieces[i][j].toString()
        } else messLig += " " + this.pieces[i][j].toString() + " ,";
      }
      
    }
    mess += messLig + "\n";
  }
  return (mess);
}


Plateau.prototype.coupsPossible = function (x, y) {
  let lesCoups = [];
  if (x === 0 || x === this.dim[0] - 1) {
    for (let i = 1; i < this.dim[0] - 1; i++) {
      if (i === 1 || i === this.dim[0] - 2) {
        for (let j = 0; j < this.dim[1]; j++) {
          if (x == 0 || x == this.dim[0] - 1) {
            if (this.nbTours <= 4 && j != 2) {
              lesCoups.push([i, j]);
            } else if (this.nbTours >= 4 && this.pieces[i][j] == undefined) {
              lesCoups.push([i, j]);
            }

          }
        }
      } else {
        let min = 0;
        let max = this.dim[1] - 1
        lesCoups.push([i, min]);
        lesCoups.push([i, max]);
      }
    }
  } else {
    if ((x == 1) && (y == 0)) {
      lesCoups = [[x + 1, y], [x, y + 1]];
    } else if ((x == 1) && (y == this.dim[1] - 1)) {
      lesCoups = [[x + 1, y], [x, y - 1]];
    } else if ((x == this.dim[0] - 2) && (y == 0)) {
      lesCoups = [[x - 1, y], [x, y + 1]];
    } else if ((x == this.dim[0] - 2) && (y == this.dim[1] - 1)) {
      lesCoups = [[x - 1, y], [x, y - 1]];
    } else if (x != 1 && y != 0 && x != this.dim[0] - 2 && y != this.dim[1] - 1) {
      lesCoups = [[x + 1, y], [x, y + 1], [x - 1, y], [x, y - 1]]
    } else {
      if (x == 1) {
        lesCoups = [[x + 1, y], [x, y + 1], [x, y - 1]];
      }
      if (y == 0) {
        lesCoups = [[x + 1, y], [x - 1, y], [x, y + 1]];
      }
      if (x == this.dim[0] - 2) {
        lesCoups = [[x - 1, y], [x, y + 1], [x, y - 1]];
      }
      if (y == this.dim[1] - 1) {
        lesCoups = [[x + 1, y], [x - 1, y], [x, y - 1]];
      }
    }
  }
  //ajoute les retour en reserve
  if (x == 1 || y == 0 || x == this.dim[0] - 2 || y == this.dim[1] - 1) {
    if (this.pieces[x][y].type == "rhino" && x != 0) {
      for (var i = 0; i < this.dim[1]; i++) {
        if (this.pieces[0][i] == undefined) {
          lesCoups.push([0, i]);
        }
      }
    } else if (this.pieces[x][y].type == "elephant" && x != this.dim[0] - 1) {
      for (var i = 0; i < this.dim[1]; i++) {
        if (this.pieces[this.dim[0] - 1][i] == undefined) {
          lesCoups.push([this.dim[0] - 1, i]);
        }
      }
    }
  }
  if (x != 0 || x != this.dim[0] - 1) {
    lesCoups.push([x, y]);
  }
  return lesCoups;
}

Plateau.prototype.deplaceOkay = function (x, y, vers) {
  var enRoute = this.pieces[x][y].direction;
  var oposantVect = undefined;
  if (enRoute === "up") oposantVect = "down";
  if (enRoute === "down") oposantVect = "up";
  if (enRoute === "left") oposantVect = "right";
  if (enRoute === "right") oposantVect = "left";
  var nbCailloux = 0;
  var forcedeplace = 1;
  var mouvX = vers[0] - x;
  var mouvY = vers[1] - y;
  while (this.pieces[x + mouvX][y + mouvY] !== undefined && x + mouvX != 0 && x + mouvX != this.dim[0] - 1) {
    if (this.pieces[x + mouvX][y + mouvY].direction == enRoute) {
      forcedeplace += 1;
    } else if (this.pieces[x + mouvX][y + mouvY].direction == oposantVect) {
      forcedeplace -= 1;
    } else if (this.pieces[x + mouvX][y + mouvY].type == "rocher") {
      nbCailloux += 1;
    }
    mouvX += (vers[0] - x);
    mouvY += + (vers[1] - y);
  }
  if (forcedeplace >= nbCailloux) {
    if (forcedeplace >= 1) {
      return true;
    }
  } else return false;
}

Plateau.prototype.isPossible = function (x, y, vers) {
  let coupDispo = (this.coupsPossible(x, y));
  let moveOn = false;
  for (var i = 0; i < coupDispo.length; i++) {
    if ((coupDispo[i][0] == vers[0]) && (coupDispo[i][1] == vers[1])) {
      moveOn = true;
    }
  }
  return moveOn
}

Plateau.prototype.deplace = function (x, y, dest) {
  this.nbTours += 1;
  this.sorti=false;
  if (this.pieces[dest[0]][[dest[1]]] === undefined) {
    this.pieces[dest[0]][dest[1]] = this.pieces[x][y];
    this.pieces[x][y] = undefined;
    console.log(this.toString());
    return true;
  }
  if (x == dest[0] && y == dest[1]) return true;
  else {
    var direction=this.pieces[x][y].direction;
    if ((this.pieces[x][y].direction == 'right' && (dest[1] == y + 1 || x == 0 || x == 6)) ||
      (this.pieces[x][y].direction == 'left' && (dest[1] == y - 1 || x == 0 || x == 6)) ||
      (this.pieces[x][y].direction == 'down' && (dest[0] == x + 1 || x == 0 || x == 6)) ||
      (this.pieces[x][y].direction == 'up' && (dest[0] == x - 1 || x == 0 || x == 6))) {
      if (this.deplaceOkay(x, y, dest)) {
        this.sorti=true;
        var sorti = this.pousse(x, y, this.pieces[x][y].direction);
        if (sorti != null && sorti.type != "rocher") this.retourneReserve(sorti);
        if (sorti != null && sorti.type == "rocher") {
          //determiner la ligne ou colonne de determination de victoire
          var li = 0;
          var col = 0
          if (x == dest[0]) {
            li = x;
          } else col = y;
          if (direction == 'right') col = this.dim[1] - 1;
          if (direction == 'left') col = 0;
          if (direction == 'down') li = this.dim[0] - 2;
          if (direction == 'up') li = 1;
          var coordVers = [dest[0] - x, dest[1] - y];
          var gagnant = this.retourneWinner(li, col, [li + coordVers[0], col + coordVers[1]]);
          if (gagnant==joueur1) joueur1.gagne=true;
          if (gagnant==joueur2) joueur2.gagne=true;
        }
        return true;
      }
    }
    return false;
  }
}

Plateau.prototype.pousse = function (startRow, startCol, direction) {
  //direction de déplacement (dx, dy)
  let dx = 0;
  let dy = 0;
  if (direction === "up") dx = -1;
  if (direction === "down") dx = 1;
  if (direction === "left") dy = -1;
  if (direction === "right") dy = 1;
  const nextRow = startRow + dx;
  const nextCol = startCol + dy;

  //position actuelle hors plateau, retourne l'élément qui sort
  if (startRow < 1 || startRow >= 6 || startCol < 0 || startCol >= 5) {
    return null; 
  }

  //position suivante hors du plateau, retourne l'élément qui sort
  if (nextRow < 1 || nextRow >= 6 || nextCol < 0 || nextCol >= 5) {
    const sorti = this.pieces[startRow][startCol];
    this.pieces[startRow][startCol] = undefined; 
    return sorti;
  }

  //position suivante vide, déplace l'élément
  if (this.pieces[nextRow][nextCol] === undefined) {
    this.pieces[nextRow][nextCol] = this.pieces[startRow][startCol];
    this.pieces[startRow][startCol] = undefined;
    return null;
  }

  //position suivante contient un élément, appele récursivement
  const sorti = this.pousse(nextRow, nextCol, direction);

  //élément poussé avec succès, déplace l'élément actuel
  this.pieces[nextRow][nextCol] = this.pieces[startRow][startCol];
  this.pieces[startRow][startCol] = undefined;

  return sorti; //retourne l'élément qui sort
}


Plateau.prototype.retourneReserve = function (piece) {
  if (piece.type == "rhino") {
    for (let i = 0; i < 5; i++) {
      if (this.pieces[0][i] == undefined) {
        this.pieces[0][i] = piece;
        this.pieces[0][i].direction = "down";
        return;
      }
    }
  }
  if (piece.type == "elephant") {
    for (let i = 0; i < 5; i++) {
      if (this.pieces[6][i] == undefined) {
        this.pieces[6][i] = piece;
        this.pieces[6][i].direction = "up";
        return;
      }
    }
  }
}

Plateau.prototype.retourneWinner = function (x, y, dest) {
  var laRemonte = [x-dest[0] ,y- dest[1]];
  var vecteurGagnant = undefined;
  if (laRemonte[0] == 1 && laRemonte[1] == 0) vecteurGagnant = "up";
  if (laRemonte[0] == -1 && laRemonte[1] == 0) vecteurGagnant = "down";
  if (laRemonte[0] == 0 && laRemonte[1] == 1) vecteurGagnant = "left";
  if (laRemonte[0] == 0 && laRemonte[1] == -1) vecteurGagnant = "right";
  while (this.pieces[x + laRemonte[0]- (x-dest[0])][y + laRemonte[1]-(y- dest[1])].type == "rocher" && this.pieces[x + laRemonte[0]- (x-dest[0])][y + laRemonte[1]-(y- dest[1])].direction != vecteurGagnant) {
    laRemonte[0] += laRemonte[0];
    laRemonte[1] += laRemonte[1];
  }
  return this.pieces[x + laRemonte[0]- (x-dest[0])][y + laRemonte[1]-(y- dest[1])].joueur;

}


/*
--------------------------------------------------------------------------------------------------------------------------------------


                  Limite entre l'objet textuel et la page



---------------------------------------------------------------------------------------------------------------------------------------
*/

var joueur1 = new Joueur("joueur 1");
var joueur2 = new Joueur("joueur 2");
var joueur = joueur1;
var tour = document.getElementById("tour");
var btnTour = document.getElementById("tourJoueur");

// Initialisation du plateau de jeu théorique
function initBoard() {
  board = new Plateau(7, 5);
  board.init(joueur1, joueur2);
  console.log(board.toString());
  printBoard();
}

//création des div cases : plateau visuel (front-end)
Cases = Array(7).fill().map(() => Array(5).fill(null));
for (let row = 0; row < 7; row++) {
  for (let col = 0; col < 5; col++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    Cases[row][col] = cell;
  }
}

// Affichage du plateau de jeu
// Rechargement et affichage du plateau de jeu (à chaque mouvement)
function printBoard() {
  const boardElement = document.getElementById("board");
  // Si le plateau n'a pas encore été ajouté au DOM, ajoutez les cases
  if (boardElement.children.length === 0) {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        boardElement.appendChild(Cases[row][col]);
      }
    }
  }
  // Mettre à jour l'affichage des cases
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = Cases[row][col];
      const piece = board.pieces[row][col];
      cell.classList = [];
      cell.classList.add("cell");
      if (piece) {
        if (piece.type === "rocher") {
          cell.style.backgroundImage = "url(img/rocher.png)";
        }
        if (piece.type === "rhino") {
          cell.style.backgroundImage = "url(img/rhino.png)";
        }
        if (piece.type === "elephant") {
          cell.style.backgroundImage = "url(img/elephant.png)";
        }
        cell.classList.add(piece.direction);
        if (piece.cliquable) {
          cell.classList.add("clCliquable");
        }
      }
      else {
        cell.style.backgroundImage = "";
        cell.className = "cell"; // Supprime toutes les classes sauf "cell"
      }
    }
  }
}

function change_joueur() {
  if (joueur == joueur1) {
    tour.style.color = "blue";
    tour.innerText = "C'est au tour de " + joueur2.nom;
    joueur = joueur2;
  } else {
    tour.style.color = "red";
    tour.innerText = "C'est au tour de " + joueur1.nom;
    joueur = joueur1;
  }
}

function selectDep() {
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = board.pieces[row][col];
      if (piece) {
        if ((joueur == joueur1 && piece.type === "rhino") || (joueur == joueur2 && piece.type === "elephant")) {
          piece.cliquable = true;
        }
      }
    }
  }
}

function deselectAll() {
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = board.pieces[row][col];
      if (piece) {
        piece.cliquable = false;
      }
      Cases[row][col].classList.remove("clCliquable");
    }
  }
}

var dernierePieceDeplacee = null; // Stocke la pièce déplacée

function rotate(direction) {
  if (!dernierePieceDeplacee) {
    alert("Vous devez d'abord déplacer une pièce !");
    return;
  }
  dernierePieceDeplacee.direction = direction; // Met à jour la direction
  printBoard();
}

function finishRotation() {
  if (!dernierePieceDeplacee) {
    alert("Vous devez d'abord déplacer une pièce !");
    return;
  }
  dernierePieceDeplacee = null;
  document.getElementById("endRotation").disabled = true;
  change_joueur();
  Untour();
}

function Untour(onTourTermine) {
  deselectAll();
  selectDep(); 
  printBoard();
  var deplacementEffectue = false; // Empêche plusieurs déplacements par tour
  //Nettoye les anciens écouteurs
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 5; c++) {
      const oldCell = Cases[r][c];
      const newCell = oldCell.cloneNode(true); 
      oldCell.replaceWith(newCell);           
      Cases[r][c] = newCell;               
    }
  }
  //Ajouter de nouveaux écouteurs
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = Cases[row][col];
      if (cell.classList.contains("clCliquable")) {
        cell.addEventListener("click", function selectionPiece() {
          if (deplacementEffectue) return; // Empêche plusieurs déplacements
          const pieceSelectionnee = { row, col }; // Sauvegarde la pièce sélectionnée
          deselectAll(); // Désactive les autres cases
          printBoard();

          //Ajouter les déplacements possibles
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 5; c++) {
              const destCell = Cases[r][c];
              if (board.isPossible(pieceSelectionnee.row, pieceSelectionnee.col, [r, c])) {
                destCell.classList.add("clCliquable");
                Cases[pieceSelectionnee.row][pieceSelectionnee.col].classList.add("clSelection");
                destCell.addEventListener("click", function selectionDestination() {
                  deplacementEffectue = board.deplace(pieceSelectionnee.row, pieceSelectionnee.col, [r, c]); // Déplace la pièce
                  dernierePieceDeplacee = board.pieces[r][c];
                  deselectAll(); // Désactive toutes les cases
                  printBoard();
                  destCell.removeEventListener("click", selectionDestination);
                  if(joueur1.gagne) {tour.innerText ="Bravo "+String(joueur1.nom)+", vous avez gagné ! "; return;}
                  if(joueur2.gagne) {tour.innerText ="Bravo "+String(joueur2.nom)+", vous avez gagné ! "; return;}
                  if(board.sorti){ //Si le joueur a sorti un pion, tour suivant
                    dernierePieceDeplacee = null;
                    change_joueur();
                    Untour();
                  }
                  else if (deplacementEffectue) { //sinon si un pion a été déplacé, il peut le tourner
                    document.getElementById("endRotation").disabled = false;
                    tour.innerText = "Vous pouvez orienter votre pièce dans le sens que vous le souhaitez puis validez";
                  }
                  else{ // sinon le déplacement ne s'est pas fait, tour suivant
                    alert("Dommage, le déplacement était impossible, attend le prochain tour pour reesayer de pousser");
                    dernierePieceDeplacee=null;
                    change_joueur()
                    Untour()
                  }
                  // Fin du tour
                }, { once: true });
              }
            }
          }
          // Retirer l'écouteur sur la pièce sélectionnée
          cell.removeEventListener("click", selectionPiece);
        }, { once: true });
      }
    }
  }
}


function main() {
  initBoard();
  joueur1.nom = window.prompt("Nom du joueur 1 :");
  if (joueur1.nom == null) joueur1.nom = "Viktor";
  joueur2.nom = window.prompt("Nom du joueur 2 :");
  if (joueur2.nom == null) joueur2.nom = "Philibert";
  change_joueur();
  Untour();
}


//Reinitialise
var resetGame = function () {
  initBoard();
  joueur1.gagne=false;
  joueur2.gagne=false;
  joueur = joueur1;
  change_joueur();
  deselectAll();
  printBoard();
  document.getElementById("endRotation").disabled = true;
  Untour();
}


// Initialise le plateau de jeu au chargement de la page
window.onload = main();



