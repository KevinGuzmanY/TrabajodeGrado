import { Component, Input } from '@angular/core';
import {AuthService} from "../../../services/auth.service";
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent {
  @Input() data: any;
  @Input() externalData: any;
  @Input() type: 'movie' | 'tv' | 'person' = 'movie';
  liked: boolean = false;
  genresString: string = '';
  userId: string = '';
  contentId: string = '';
  interaccion: boolean = false;

  constructor(private authService: AuthService) {
  }

  ngOnInit(){
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
        window.location.reload();
      },
      error: error => {
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
        window.location.reload();
      },
      error: error => {
        console.error('Error liking genres:', error);
      }
    });
  }
}




