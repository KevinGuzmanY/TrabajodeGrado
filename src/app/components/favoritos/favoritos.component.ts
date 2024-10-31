import { Component } from '@angular/core';
import {delay} from "rxjs/operators";
import {ApiService} from "../../api/api.service";

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.scss'
})
export class FavoritosComponent {
  movies_data: any[] = [];
  userid: string = "";

  constructor(
    private apiService: ApiService) {
  }
  ngOnInit() {
    this.userid = localStorage.getItem("user_id") || "";
    this.getUserLikedContent();
  }

  getUserLikedContent() {
    this.apiService.getUserLikedContent(this.userid).pipe(delay(2000)).subscribe(
      (res: any) => {
        const uniqueMovies = new Set();
        console.log('favoritos '+res)
        this.movies_data = res
          .map((item: any) => ({
            id: item.id, // añade el campo id para filtrar duplicados
            link: `/movie/${item.id}`,
            imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
            title: item.title || item.name,
            rating: item.vote_average * 10,
            vote: item.vote_average
          }))
          .filter((movie: any) => {
            const isDuplicate = uniqueMovies.has(movie.id);
            uniqueMovies.add(movie.id);
            return !isDuplicate;
          });
      },
      error => {
        console.error('Error fetching now playing data', error);
      }
    );
  }
}
