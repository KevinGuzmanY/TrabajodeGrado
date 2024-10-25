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
        console.log(res)
        this.movies_data = res.map((item: any) => ({
          link: `/movie/${item.id}`,
          imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
          title: item.title,
          rating: item.vote_average * 10,
          vote: item.vote_average
        }));
      },
      error => {
        console.error('Error fetching now playing data', error);
      }
    );
  }
}
