import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { delay } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  moviesSlider: any[] = [];
  tvSlider: any[] = [];
  movies_data: any[] = [];
  IA_recomended: any[] = [];
  filteredGenre: any[] = [];
  popularMovies: any[] = [];
  newMovies: any[] = [];
  filteredTipo: any[] = [];
  topRated: any[] = [];
  hasReloaded: string = "false";
  slider: any[] = [];

  tipo: string[] = ['Pelicula','Serie']
  genres: { id: number, name: string }[] = [
    { id: 28, name: 'Accion' },
    { id: 12, name: 'Aventura' },
    { id: 16, name: 'Animacion' },
    { id: 35, name: 'Comedia' },
    { id: 80, name: 'Crimen' },
    { id: 99, name: 'Documental' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Familiar' },
    { id: 14, name: 'Fantasia' },
    { id: 36, name: 'Historia' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Musica' },
    { id: 9648, name: 'Misterio' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Ciencia Ficción' },
    { id: 10752, name: 'Guerra' }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,private apiService: ApiService, private toastr: ToastrService, private spinner: NgxSpinnerService) {
  }

  ngOnInit() {
    this.spinner.show();
    this.fetchTrendingContent('movie', 1, 'movies');
    this.fetchIAContent();
    this.fetchTrendingContent('tv', 1, 'tvShows');
    this.getNowPlaying('movie', 1);
    this.getTopRated('movie', 1);
    this.getSlider('movie', 1);
    this.fetchMoviesSlider('movie', 2,'movies');
    this.populateGenre(99);

    setTimeout(() => {
      this.spinner.hide();
    }, 2000);

    this.hasReloaded = sessionStorage.getItem('hasReloaded') || "false";

    this.activatedRoute.queryParams.subscribe(params => {
      if (params["signedIn"] !== undefined && params["signedIn"] === "true") {
        this.toastr.success("Logueado con éxito");
        // Verifica si la página ya se ha recargado
        if (!sessionStorage.getItem('hasReloaded')) {
          sessionStorage.setItem('hasReloaded', 'true'); // Marca que la página ya se recargó
          location.reload(); // Recarga la página
        }
      }
    })
  }

  populateGenre(genreId: number) {
    this.apiService.getContentByGenre(genreId).pipe(delay(2000)).subscribe(
      (res: any) => {
        console.log('getContentByGenre' )
        this.filteredGenre = res.results.map((item: any) => ({
          link: `/movie/${item.id}`,
          imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
          title: item.title,
          rating: item.vote_average * 10,
          vote: item.vote_average
        }));
      }
      ,
      error => {
        console.error('Error fetching now playing data', error);
      }
    );
  }

  // Handle Genre Selection
  onGenreSelected(genreId: number) {
    this.apiService.getContentByGenre(genreId).pipe(delay(2000)).subscribe(
      (res: any) => {
          console.log('getContentByGenre' )
          this.filteredGenre = res.results.map((item: any) => ({
            link: `/movie/${item.id}`,
            imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
            title: item.title,
            rating: item.vote_average * 10,
            vote: item.vote_average
          }));
        }
      ,
      error => {
        console.error('Error fetching now playing data', error);
      }
    );
  }

  onTipoSelected(genreId: string) {
    console.log(genreId)
    this.apiService.getContentByTipo(genreId).pipe(delay(2000)).subscribe(
      (res: any) => {

        this.filteredTipo = res.results.map((item: any) => ({
          link: `/movie/${item.id}`,
          imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
          title: item.title,
          rating: item.vote_average * 10,
          vote: item.vote_average
        }));
        console.log(this.filteredTipo)
      }
      ,
      error => {
        console.error('Error fetching now playing data', error);
      }
    );
  }

  getTopRated(mediaType: 'movie', page: number) {
    this.apiService.getTopRated(mediaType, page).pipe(delay(2000)).subscribe(
      (res: any) => {
        this.topRated = res.results.map((item: any) => {
          const movieItem = {
            link: `/movie/${item.id}`,
            imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
            title: item.title,
            rating: item.vote_average * 10,
            vote: item.vote_average,
            videoId: ''
          };

          // Fetch the trailer video key for each movie
          this.apiService.getYouTubeVideo(item.id, 'movie').subscribe(
            (videoRes: any) => {
              const video = videoRes.results.find((vid: any) => vid.site === 'YouTube' && vid.type === 'Trailer');
              if (video) {
                movieItem.videoId = video.key; // Set the video key if available
              }
            },
            videoError => {
              console.error('Error fetching YouTube video for Movie:', videoError);
            }
          );

          return movieItem;
        });
      },
      error => {
        console.error('Error fetching now playing data', error);
      }
    );
  }

  getSlider(mediaType: 'movie', page: number) {
    this.apiService.getTopRated(mediaType, page).pipe(delay(2000)).subscribe(
      (res: any) => {
        this.slider = res.results.map((item: any) => {
          const movieItem = {
            ...item,
            link: `/movie/${item.id}`,
            videoId: '' // Initialize with an empty string
          };

          // Fetch the trailer video key for each movie
          this.apiService.getYouTubeVideo(item.id, 'movie').subscribe(
            (videoRes: any) => {
              const video = videoRes.results.find((vid: any) => vid.site === 'YouTube' && vid.type === 'Trailer');
              if (video) {
                movieItem.videoId = video.key; // Set the video key if available
              }
            },
            videoError => {
              console.error('Error fetching YouTube video for Movie:', videoError);
            }
          );

          return movieItem;
        });
      },
      error => {
        console.error('Error fetching now playing data', error);
      }
    );
  }

  // Slider Data
  getNowPlaying(mediaType: 'movie', page: number) {
  this.apiService.getNowPlaying(mediaType, page).pipe(delay(2000)).subscribe(
    (res: any) => {
      this.newMovies = res.results.map((item: any) => {
        const movieItem = {
          link: `/movie/${item.id}`,
          imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
          title: item.title,
          rating: item.vote_average * 10,
          vote: item.vote_average,
          videoId: ''
        };

        // Fetch the trailer video key for each movie
        this.apiService.getYouTubeVideo(item.id, 'movie').subscribe(
          (videoRes: any) => {
            const video = videoRes.results.find((vid: any) => vid.site === 'YouTube' && vid.type === 'Trailer');
            if (video) {
              movieItem.videoId = video.key; // Set the video key if available
            }
          },
          videoError => {
            console.error('Error fetching YouTube video for Movie:', videoError);
          }
        );

        return movieItem;
      });
    },
    error => {
      console.error('Error fetching now playing data', error);
    }
  );
}
  performSearch() {
    alert('Buscar...');
  }

  fetchIAContent(): void {
    if (sessionStorage.getItem("hasReloaded") == "true"){

      let userid = localStorage.getItem("user_id");

      if (userid !== null) {
        this.apiService.getIA(userid).subscribe(
          response => {
            const unifiedArray = response.flatMap((dict: any) => {
              return dict.content[0].results.slice(0, 2).map((item: any) => {
                return {
                  link: `/movie/${item.id}`,
                  imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
                  title: item.title,
                  rating: item.vote_average * 10,
                  vote: item.vote_average
                };
              });
            });
            this.IA_recomended = unifiedArray
            console.log("IA_recomended")
            console.log(this.IA_recomended)
            //
            // this.filteredGenre = response.map((item: any) => {
            //   return {
            //     link: `/movie/${item.id}`,
            //     imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
            //     title: item.title,
            //     rating: item.vote_average * 10,
            //     vote: item.vote_average
            //   }});
          }
        );
      } else {
        console.error("User ID not found in localStorage");
      }
    }
  }

  fetchMoviesSlider(media: string, page: number, type: string): void {
    this.apiService.getTrending(media, page).subscribe(
      response => {
          this.moviesSlider = response.results.map((item: any) => ({
            link: `/movie/${item.id}`,
            imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
            title: item.title,
            rating: item.vote_average * 10,
            vote: item.vote_average
          }));
      },
      error => {
        console.error(`Error fetching trending ${type}:`, error);
      }
    );}

    fetchTrendingContent(media: string, page: number, type: string): void {
    this.apiService.getTrending(media, page).subscribe(
      response => {
        if (type === 'movies') {
          this.popularMovies = response.results.map((item: any) => ({
            link: `/movie/${item.id}`,
            imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
            title: item.title,
            rating: item.vote_average * 10,
            vote: item.vote_average
          }));

          this.filteredTipo = response.results.map((item: any) => ({
            link: `/movie/${item.id}`,
            imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
            title: item.title,
            rating: item.vote_average * 10,
            vote: item.vote_average
          }));



        } else if (type === 'tvShows') {
          this.tvSlider = response.results.map((item: any) => ({
            link: `/tv/${item.id}`,
            imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
            title: item.name,
            rating: item.vote_average * 10,
            vote: item.vote_average
          }));
        }
      },
      error => {
        console.error(`Error fetching trending ${type}:`, error);
      }
    );
  }

}
