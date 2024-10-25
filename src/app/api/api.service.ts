import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://api.themoviedb.org/3';
  private apiKey = 'bbf9e364cea80ea7037b2df19efcad88'; // your API key
  private language = 'es-ES';


  constructor(private http: HttpClient) { }

  getUserLikedContent(userId: string): Observable<any> {
    const url = `http://localhost:5000/user/${userId}/liked_content`;
    return this.http.get(url);
  }

  getGenres(type: string){
    const arrayDeStrings: string[] = ['uno', 'dos', 'tres'];
    return of(arrayDeStrings);
  }

  updateUserPreferences(data: any): Observable<any> {
    return this.http.post<any>('http://localhost:5000/update_user_preferences', data);
  }

  getContentByTipo(tipo: string){
    let page = 1;

    if (tipo == 'Pelicula'){
      const url = `${this.apiUrl}/discover/movie?api_key=${this.apiKey}&page=${page}`;
      return this.http.get(url);
    }else {
      const url = `${this.apiUrl}/discover/tv?api_key=${this.apiKey}&page=${page}`;
      return this.http.get(url);
    }
  }

  getWatchProviders(contentId: number, mediaType: string): Observable<any> {
    const url = `${this.apiUrl}/${mediaType}/${contentId}/watch/providers?api_key=${this.apiKey}`;
    return this.http.get<any>(url);
  }

  getContentByGenre(genre: number){
    let page = 1
      const params = this.buildParams({ page: page.toString() });
    return this.http.get(`http://localhost:5000/content/genre/${genre}`, { params })
      .pipe(catchError(this.handleError));
  }

  getTopRated(mediaType: string, page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this.http.get(`${this.apiUrl}/${mediaType}/top_rated?&page=${page}`, { params })
      .pipe(catchError(this.handleError));
  }

  getNowPlaying(mediaType: string, page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this.http.get(`${this.apiUrl}/${mediaType}/now_playing`, { params })
      .pipe(catchError(this.handleError));
  }

  getCategory(category: string, page: number, mediaType: string): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this.http.get(`${this.apiUrl}/${mediaType}/${category}`, { params })
      .pipe(catchError(this.handleError));
  }

  getMovie(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/movie/${id}`, { params: this.buildParams({}) })
      .pipe(catchError(this.handleError));
  }

  getExternalId(id: number, mediaType: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${mediaType}/${id}/external_ids`, { params: this.buildParams({}) })
      .pipe(catchError(this.handleError));
  }

  getRecommended(id: number, page: number, mediaType: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${mediaType}/${id}/recommendations`, { params: this.buildParams({}) })
  }

  getBackdrops(id: number, mediaType: string): Observable<any> {
    const url = `${this.apiUrl}/${mediaType}/${id}/images?api_key=${this.apiKey}`;
    return this.http.get<any>(url);
  }

  getYouTubeVideo(id: number, mediaType: string): Observable<any> {
    const params = this.buildParams({});
    return this.http.get(`${this.apiUrl}/${mediaType}/${id}/videos`, { params })
      .pipe(catchError(this.handleError));
  }

  getIA(userid: string): Observable<any> {
    return this.http.get(`http://localhost:5000/recommendations/${userid}`)
      .pipe(catchError(this.handleError));
  }

  getTrending(media: string, page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this.http.get(`http://localhost:5000/trending/${media}/week`, { params })
      .pipe(catchError(this.handleError));
  }

  getTvDiscover(page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this.http.get(`${this.apiUrl}/discover/tv`, { params })
      .pipe(catchError(this.handleError));
  }

  getPersonExternalId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/person/${id}/external_ids`, { params: this.buildParams({}) })
      .pipe(catchError(this.handleError));
  }

  getTvShow(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tv/${id}`, { params: this.buildParams({}) })
      .pipe(catchError(this.handleError));
  }

  getTvShowEpisodes(id: number, season: number): Observable<any> {
    const params = this.buildParams({});
    return this.http.get(`${this.apiUrl}/tv/${id}/season/${season}`, { params })
      .pipe(catchError(this.handleError));
  }

  getMediaByGenre(media: string, genreId: number, page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString(), with_genres: genreId.toString() });
    return this.http.get(`${this.apiUrl}/discover/${media}`, { params })
      .pipe(catchError(this.handleError));
  }

  getGenreList(media: string): Observable<any> {
    const params = this.buildParams({});
    return this.http.get(`${this.apiUrl}/genre/${media}/list`, { params })
      .pipe(catchError(this.handleError));
  }

  getByGenre(id: number, type: string, page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this.http.get(`${this.apiUrl}/genre/${id}/${type}`, { params })
      .pipe(catchError(this.handleError));
  }

  getCredits(id: number, type: string): Observable<any> {
    const params = this.buildParams({});
    return this.http.get(`${this.apiUrl}/${type}/${id}/credits`, { params })
      .pipe(catchError(this.handleError));
  }

  getPerson(id: number): Observable<any> {
    const params = this.buildParams({});
    return this.http.get(`${this.apiUrl}/person/${id}`, { params })
      .pipe(catchError(this.handleError));
  }
  getPersonImages(id: number): Observable<any> {
    const params = this.buildParams({});
    return this.http.get(`${this.apiUrl}/person/${id}/images`, { params })
      .pipe(catchError(this.handleError));
  }

  getPersonCredit(id: number): Observable<any> {
    const params = this.buildParams({});
    return this.http.get(`${this.apiUrl}/person/${id}/movie_credits`, { params })
      .pipe(catchError(this.handleError));
  }

  search(query: string, page: number): Observable<any> {
    const params = this.buildParams({ query, page: page.toString() });
    return this.http.get(`${this.apiUrl}/search/multi`, { params })
      .pipe(catchError(this.handleError));
  }

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams().set('api_key', this.apiKey).set('language', this.language);
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return httpParams;
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred', error);
    return throwError(() => new Error('Something went wrong'));
  }
}
