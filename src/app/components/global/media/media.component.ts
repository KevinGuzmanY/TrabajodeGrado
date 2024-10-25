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


  constructor(private authService: AuthService) {
  }

  ngOnInit(){


  }


}




