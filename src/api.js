import FilmsModel from "./model/film.js";

const Method = {
  GET: `GET`,
  PUT: `PUT`,
  POST: `POST`,
  DELETE: `DELETE`
};

const SuccessHTTPStatusRange = {
  MIN: 200,
  MAX: 299
};

export default class Api {
  constructor(endPoint, authorization) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  _getComments(id) {
    return this._load({url: `/comments/${id}`})
      .then(Api.toJSON)
      .then((comments) => comments.map(FilmsModel.adaptCommentToClient));
  }

  addComment(data) {
    return this._load({
      url: `/comments/${data.id}`,
      method: Method.POST,
      body: JSON.stringify(FilmsModel.adaptCommentToServer(data.comment)),
      headers: new Headers({"Content-Type": `application/json`})
    })
      .then(Api.toJSON)
      .then(FilmsModel.adaptFilmToClient);
  }

  deleteComment(id) {
    return this._load({
      url: `/comments/${id}`,
      method: Method.DELETE
    });
  }

  getFilms() {
    return this._load({url: `/movies`})
      .then(Api.toJSON)
      .then((films) => {
        films.map((film) => {
          const comments = this._getComments(film.id);

          FilmsModel.adaptFilmToClient(film, comments);
        });
      });
  }

  updateFilms(film) {
    return this._load({
      url: `/movies/${film.id}`,
      method: Method.PUT,
      body: JSON.stringify(FilmsModel.adaptFilmToServer(film)),
      headers: new Headers({"Content-Type": `application/json`})
    })
      .then(Api.toJSON)
      .then(FilmsModel.adaptFilmToClient);
  }

  _load({
    url,
    method = Method.GET,
    body = null,
    headers = new Headers()
  }) {
    headers.append(`Authorization`, this._authorization);

    return fetch(`${this._endPoint}${url}`, {method, body, headers})
      .then(Api.checkStatus)
      .catch(Api.catchError);
  }

  static checkStatus(response) {
    if (response.status < SuccessHTTPStatusRange.MIN || response.status > SuccessHTTPStatusRange.MAX) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response;
  }

  static toJSON(response) {
    return response.json();
  }

  static catchError(err) {
    throw err;
  }
}