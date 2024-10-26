import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { ActivatedRoute, Params } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import {forkJoin} from "rxjs";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-movies-info',
  templateUrl: './movies-info.component.html',
  styleUrls: ['./movies-info.component.scss']
})
export class MoviesInfoComponent implements OnInit {
  id!: number;
  movie_data: any;
  external_data: any;
  activeTab: string = 'overview';
  videos: any[] = [];
  videoTypes: string[] = [];
  backdrops: any[] = [];
  posters: any[] = [];
  cast_data: any;
  recom_data: any[] = [];
  person_data: any;
  type: 'movie' = 'movie';
  genresString: string = '';
  userId: string = '';
  contentId: string = '';
  liked: boolean = false;
  interaccion: boolean = false;

  constructor(private apiService: ApiService, private router: ActivatedRoute, private spinner: NgxSpinnerService,private authService: AuthService) { }

  ngOnInit() {

    this.router.params.subscribe((params: Params) => {
      this.spinner.show();
      this.id = +params['id'];
      this.getMovieInfo(this.id);
      this.getMovieVideos(this.id);
      this.getMoviesBackdrop(this.id);
      this.getMovieCast(this.id);
      this.getMovieRecommended(this.id, 1);
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);




    });

  }

  checkLikeFuntion(){
    this.authService.checkLike(this.userId,this.contentId).subscribe(
      {
        next: (data)=> {
          if (data.message == "True")
            this.liked = true
          this.interaccion = true
          console.log(this.liked ,'-',this.interaccion)
          if (data.message == "False")
            this.liked = false
          this.interaccion = true
          console.log(this.liked,'-',this.interaccion)
        },error: (err)=>{
          this.liked = false
          this.interaccion = false
          console.log(this.liked,'-',this.interaccion)
        }
      }
    )
  }

  dislikeGenres() {
    const genresArray = this.genresString ? this.genresString.split(',') : [];
    this.liked = false;
    this.interaccion = true;

    // Crear un array de observables para cada solicitud
    const requests = genresArray.map(genre => {
      console.log(`disLiking genre: ${genre}`);
      return this.authService.likeGenre(genre, this.userId, this.contentId, "dislike");
    });

    // Usar forkJoin para ejecutar todas las solicitudes en paralelo y esperar a que terminen
    forkJoin(requests).subscribe({
      next: responses => {
        console.log('All genres disliked successfully:', responses);
        // Recargar la página después de que todas las solicitudes hayan terminado
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error: error => {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        console.error('Error disliking genres:', error);
      }
    });
  }

  likeGenres() {
    const genresArray = this.genresString ? this.genresString.split(',') : [];

    this.liked = true;
    this.interaccion = true;
    // Crear un array de observables para cada solicitud
    const requests = genresArray.map(genre => {
      console.log(`Liking genre: ${genre}`);
      return this.authService.likeGenre(genre, this.userId, this.contentId, "like");
    });

    // Usar forkJoin para ejecutar todas las solicitudes en paralelo y esperar a que terminen
    forkJoin(requests).subscribe({
      next: responses => {
        console.log('All genres liked successfully:', responses);
        // Recargar la página después de que todas las solicitudes hayan terminado
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error: error => {
        setTimeout(() => {
        }, 1000);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        console.error('Error liking genres:', error);
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getMovieInfo(id: number) {
    this.apiService.getMovie(id).subscribe((result: any) => {
      this.movie_data = result;
      this.getWatchProviders(id, 'movie');
      console.log('getMovieInfo')
      // Fetch YouTube trailer video
      this.apiService.getYouTubeVideo(id, 'movie').subscribe(
        (videoRes: any) => {
          const video = videoRes.results.find((vid: any) => vid.site === 'YouTube' && ['Trailer', 'Teaser', 'Clip'].includes(vid.type));
          if (video) {
            this.movie_data.videoId = video.key; // Set the video key in movie_data
          } else {
            console.warn('No trailer or relevant video found for this movie.');
          }
        },
        videoError => {
          console.error('Error fetching YouTube video:', videoError);
        }
      );
      // Accessing genres and extracting their names
      if (this.movie_data.genres && Array.isArray(this.movie_data.genres)) {
        const genreNames = this.movie_data.genres.map((genre: any) => genre.name);
        console.log('Genres:', genreNames);
        localStorage.setItem("movie_data",genreNames)
        localStorage.setItem("content_id",this.movie_data.id)

        this.genresString = localStorage.getItem('movie_data') || '';
        this.userId = localStorage.getItem('user_id') || '';
        this.contentId = localStorage.getItem("content_id") || '';

        this.checkLikeFuntion();
      }
      console.log(this.movie_data)
      this.getExternal(id);
    });
  }

  getWatchProviders(id: number, media_type: string): void {
    this.apiService.getWatchProviders(id, media_type).subscribe(
      platformsData => {
        this.movie_data.platforms = platformsData.results.CO;
        console.log("movie_data")
        console.log(this.movie_data)
      },
      error => {
        console.error('Error fetching watch providers:', error);
      }
    );
  }

  getExternal(id: number) {
    this.apiService.getExternalId(id, 'movie').subscribe((result: any) => {
      this.external_data = result;
    });
  }

  getMovieVideos(id: number) {
    this.apiService.getYouTubeVideo(id, 'movie').subscribe((res: any) => {
      this.videos = res.results;
    });
  }

  getMoviesBackdrop(id: number) {
    this.apiService.getBackdrops(id, 'movie').subscribe((res: any) => {
      this.backdrops = res.backdrops;
      this.posters = [];
      res.posters.forEach((poster: { file_path: string; }) => {
        this.posters.push({
          ...poster,
          full_path: `https://image.tmdb.org/t/p/w342${poster.file_path}`
        });
      });
    });
  }

  getMovieCast(id: number) {
    this.apiService.getCredits(id, 'movie').subscribe(
      (res: any) => {
        this.cast_data = [];
        for (let item of res.cast) {
          this.cast_data.push({
            link: `/person/${item.id}`,
            imgSrc: item.profile_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.profile_path}` : null,
            name: item.name,
            character: item.character,
            popularity: item.popularity,
          });
        }
      },
      error => {
        console.error('Error fetching credits data', error);
      }
    );
  }

  getMovieRecommended(id: number, page: number) {
    this.apiService.getRecommended(id, page, 'movie').subscribe(
      (res: any) => {
        this.recom_data = res.results.map((item: any) => ({
          link: `/movie/${item.id}`,
          imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
          title: item.title,
          vote: item.vote_average ? item.vote_average : 'N/A',
          rating: item.vote_average ? item.vote_average * 10 : 'N/A',
        }));
      },
      error => {
        console.error('Error fetching recommended movies data', error);
      }
    );
  }


}
