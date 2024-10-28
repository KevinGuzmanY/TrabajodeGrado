import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  searchVisible = false;
  query: string = '';
  loggedIn: boolean = false;
  notificacionesNoLeidas: number = 0;

  @ViewChild('input') inputElement!: ElementRef;

  constructor(private router: Router,private authService: AuthService) {
    this.searchVisible = true
  }

  ngOnInit() {
    if (localStorage.getItem("isLoggedIn") == "true"){
      this.loggedIn = true
    }

    let user_id = localStorage.getItem('user_id') || '';

    this.authService.getUserNotifications(user_id).subscribe(
      (notificaciones) => {
        this.notificacionesNoLeidas = notificaciones.filter((notificacion: any) => !notificacion.is_read).length;
      },
      (error) => {
        console.error('Error al obtener notificaciones:', error);
      }
    );
  }

  logOut(){
    this.loggedIn = false
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem('hasReloaded');
    window.location.reload();
  }

  ngAfterViewInit(): void {
    if (this.searchVisible && this.inputElement) {
      this.focusInput();
    }
  }

  toggleSearch(): void {
    this.searchVisible = !this.searchVisible;
    if (this.searchVisible) {
      this.focusInput();
    }
  }

  private focusInput(): void {
    setTimeout(() => {
      if (this.inputElement && this.inputElement.nativeElement) {
        this.inputElement.nativeElement.focus();
        this.inputElement.nativeElement.select(); // Select any existing text, ensuring cursor visibility
      }
    }, 100); // Delay slightly longer to ensure rendering is complete
  }


  closeSearch(): void {
    this.searchVisible = false;
    this.query = '';
    this.router.navigate(['/']);
  }



  goToRoute(): void {
    if (this.query.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.query } });
    }else{
      this.router.navigate(['/']);
    }
  }

  goBack(): void {
    this.query = '';
    this.router.navigate(['/']);
  }

  // unFocus(event: FocusEvent): void {
  //   if (!this.query.trim()) {
  //     this.searchVisible = false;
  //   }
  // }

  unFocus(event: FocusEvent): void {
    // this.closeSearch(); // Close the search and clear the query
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.goToRoute();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const targetElement = event.target as HTMLElement;

    // // Close the search bar if the click is outside the navbar
    // if (this.searchVisible && !targetElement.closest('.navbar')) {
    //   this.closeSearch();
    // }
  }
}
