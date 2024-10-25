import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { ActivatedRoute, Params } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import {forkJoin} from "rxjs";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-tv-info',
  templateUrl: './tv-info.component.html',
  styleUrls: ['./tv-info.component.scss']
})
export class TvInfoComponent implements OnInit {
  id!: number;
  tv_data: any;
  external_data: any;
  activeTab: string = 'overview';
  video_data: any;
  videos: any[] = [];
  filteredVideos: any[] = [];
  videoTypes: string[] = [];
  backdrops: any[] = [];
  posters: any[] = [];
  cast_data: any;
  recom_data: any[] = [];
  type: 'tv' = 'tv';
  userId: string = '';
  contentId: string = '';
  liked: boolean = false;
  interaccion: boolean = false;
  genresString: string = '';

  constructor(private apiService: ApiService,private authService: AuthService, private router: ActivatedRoute, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.router.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.getTvInfo(this.id);
      this.getTvVideos(this.id);
      this.getTvBackdrop(this.id);
      this.getMovieCast(this.id);
      this.getTvRecommended(this.id, 1);


    this.genresString = localStorage.getItem('movie_data') || '';
    this.userId = localStorage.getItem('user_id') || '';
    this.contentId = localStorage.getItem("content_id") || '';

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
    });

  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }


  dislikeGenres() {
    const genresArray = this.genresString ? this.genresString.split(',') : [];

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

  getTvInfo(id: number) {
    this.apiService.getTvShow(id).subscribe(
      tv_data => {
        this.tv_data = tv_data;
        this.getWatchProviders(id, 'tv');

        // Extraer los géneros de la respuesta
        const genres = tv_data.genres.map((genre: { id: number, name: string }) => genre.name.toLowerCase());

        // Llamar a la función para actualizar los géneros del usuario
        this.updateUserGenres(genres);
        console.log("getTvInfo")
        console.log(tv_data)
      },
      error => {
        console.error('Error fetching TV show details:', error);
      }
    );

  }

  getWatchProviders(id: number, media_type: string): void {
    this.apiService.getWatchProviders(id, media_type).subscribe(
      platformsData => {
        this.tv_data.platforms = platformsData.results.CO;
        console.log("tv_data")
        console.log(this.tv_data)
      },
      error => {
        console.error('Error fetching watch providers:', error);
      }
    );
  }

  getExternal(id: number) {
    this.apiService.getExternalId(id, 'tv').subscribe((result: any) => {
      this.external_data = result;
    });
  }

  getTvVideos(id: number) {
    this.apiService.getYouTubeVideo(id, 'tv').subscribe((res: any) => {
      this.video_data = res.results.length ? res.results[0] : null;
      this.videos = res.results;
      this.filteredVideos = this.videos;
      this.videoTypes = ['ALL', ...new Set(this.videos.map(video => video.type))];
    });
  }

  updateUserGenres(genres: string[]) {
    const userId = this.getCurrentUserId();  // Asume que tienes una forma de obtener el user_id

    const data = {
      user_id: userId,
      genres: genres
    };

    this.apiService.updateUserPreferences(data).subscribe(
      response => {
        console.log('Preferencias de usuario actualizadas:', response);
      },
      error => {
        console.error('Error al actualizar las preferencias del usuario:', error);
      }
    );
  }

  getCurrentUserId(): number {
    // Obtén el ID del usuario actual desde tu sistema de autenticación (ej: localStorage, sesión, etc.)
    return Number(localStorage.getItem('user_id'));
  }

  filterVideos(event: Event): void {
    const filterValue = (event.target as HTMLSelectElement).value;
    this.filteredVideos = filterValue === 'ALL'
      ? this.videos
      : this.videos.filter(video => video.type === filterValue);
  }

  getTvBackdrop(id: number) {
    this.apiService.getBackdrops(id, 'tv').subscribe((res: any) => {
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
    this.apiService.getCredits(id, 'tv').subscribe(
      (res: any) => {
        this.cast_data = res.cast.map((item: any) => ({
          link: `/person/${item.id}`,
          imgSrc: item.profile_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.profile_path}` : null,
          name: item.name,
          character: item.character,
          popularity: item.popularity,
        }));
      },
      error => {
        console.error('Error fetching credits data', error);
      }
    );
  }

  getTvRecommended(id: number, page: number) {
    this.apiService.getRecommended(id, page, 'tv').subscribe(
      (res: any) => {
        this.recom_data = res.results.map((item: any) => ({
          link: `/tv/${item.id}`,
          imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
          title: item.name,
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
