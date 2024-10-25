import { Injectable } from '@angular/core';
import {map, Observable, tap} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {SignUpPayload} from "../payloads/request/sign-up-ts";
import {SignInRequestPayload} from "../payloads/request/sign-in";
import {SignInResponsePayload} from "../payloads/response/sign-in";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000';
  private apiKey = 'bbf9e364cea80ea7037b2df19efcad88'; // your API key
  private language = 'en-US';

  constructor(private http: HttpClient, private router: Router) { }

  likeGenre(genre: string,user_id: string,content_id: string,action: string): Observable<any> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    const body = { genre,user_id,content_id,action };
    return this.http.post(`${this.apiUrl}/like`,body, { headers });
  }

  checkLike(userId: string, contentId: string): Observable<any> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json'
    });

    const body = { user_id: userId, content_id: contentId };

    return this.http.post(`${this.apiUrl}/check-like`, body, { headers });
  }

  signUp(payload: SignUpPayload) {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    return this.http.post(`${this.apiUrl}/register`, payload,{headers});
  }

  signIn(payload: SignInRequestPayload) {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    const self = this;
    return this.http.post<SignInResponsePayload>(`${this.apiUrl}/login`, payload,{headers}).pipe<SignInResponsePayload>(
      map(response=>{
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user_id", String(response.user.user_id));
        return response;
      })
    )
  }

  like(){
    return this.http.get<SignInResponsePayload>(`${this.apiUrl}/like`).pipe<SignInResponsePayload>(
      map(response=>{
        return response;
      })
    )
  }

  logout() {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    // const self  = this;
    // return this.http.post("http://localhost:8080/auth/logout", {username: this.getUsername(),
    //   refreshToken: this.localStorage.retrieve("refreshToken")},{headers}).subscribe({complete(){
    //     self.localStorage.clear('accessToken');
    //     self.localStorage.clear('refreshToken');
    //     self.localStorage.clear('expiresAt');
    //     self.localStorage.clear('username');
    //     self.localStorage.store('isLoggedIn', false);
    //     self.router.navigateByUrl("");
    //   }});
  }

  getUsername(){
    // return this.localStorage.retrieve("username");
  }

  isLoggedIn() {
    // return this.localStorage.retrieve("isLoggedIn");
  }

  isSeller() {
    // if (this.localStorage.retrieve("rol") == "seller")
    //   return true;
    // return false;
  }
  //
  // refreshAccessToken(): Observable<SignInResponsePayload> {
  //   const headers = new HttpHeaders({
  //     'ngrok-skip-browser-warning': 'true'
  //   });
  //   return this.http.post<SignInResponsePayload>("http://localhost:8080/auth/refresh-token", {
  //     refreshToken: this.localStorage.retrieve("refreshToken"),
  //     username: this.getUsername()
  //   },{headers}).pipe(tap(response=>{
  //     this.localStorage.store('accessToken', response.accessToken);
  //     this.localStorage.store('expiresAt', response.expiresAt);
  //   }))
  // }

  getAccessToken() {
    // return this.localStorage.retrieve("accessToken");
  }

  findAllUsernames(): Observable<String[]> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    return this.http.get<String[]>("http://localhost:8080/auth/usernames",{headers});
  }
}
