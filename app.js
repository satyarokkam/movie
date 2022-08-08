const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started and listening at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`db error:${error.message}`);
    process.exit(1);
  }
};
initializeDatabaseAndServer();

convertingObjectToDbObject = (dbObject) => {
  return {
    movieID: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

convertDirectorObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
//get movies list

app.get("/movies/", async (request, response) => {
  const getMovieListQuery = `SELECT
  movie_name
  FROM 
  movie;
  `;

  const resultMovieList = await db.all(getMovieListQuery);

  response.send(
    resultMovieList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//post Movie List

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const insertQuery = `insert into movie(director_id,movie_name,lead_actor)
    values(${directorId},'${movieName}','${leadActor}')`;

  const insertResultQuery = await db.run(insertQuery);

  response.send("Movie Successfully Added");
});

// get specific movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId}`;
  const movie = await db.get(getMovieQuery);
  //response.send(movie);
  console.log(movie);
  response.send(convertingObjectToDbObject(movie));
});

//put request

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const { directorId, movieName, leadActor } = request.body;

  const updateQuery = `
    update movie
    set director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    `;
  const updatedMovie = await db.run(updateQuery);

  response.send("Movie Details Updated");
});

//Delete Api

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteQuery = ` delete from movie where movie_id=${movieId}`;

  const resultDeleteQuery = await db.run(deleteQuery);

  response.send("Movie Removed");
});

//director get api

app.get("/directors/", async (request, response) => {
  const getMovieListQuery = `select * from director`;

  const resultMovieList = await db.all(getMovieListQuery);

  response.send(resultMovieList.map((each) => convertDirectorObject(each)));
});

// specific movie of director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT 
      movie_name
    FROM 
      movie 
    WHERE 
      director_id = ${directorId}`;
  const movieList = await db.all(getDirectorQuery);
  //response.send(movie);
  //console.log(movieList);
  response.send(
    movieList.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

module.exports = app;
