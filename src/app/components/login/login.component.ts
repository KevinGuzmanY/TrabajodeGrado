import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {SignInRequestPayload} from "../../payloads/request/sign-in";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  form: FormGroup;
  payload: SignInRequestPayload;
  constructor(private activatedRoute:ActivatedRoute, private toastr: ToastrService, private authService: AuthService, private router: Router) {

    this.form = new FormGroup({
      username: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required)
    })

    this.payload = {
      username: "",
      password: ""
    }

  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params =>{
      if(params['registered'] !== undefined && params['registered'] === "true"){
        console.log("Sign Up Successful");
        this.toastr.success('Te has registrado');
      }
    })
  }

  signIn(){
    const self = this;
    this.payload.username = this.form.get("username")?.value;
    this.payload.password = this.form.get("password")?.value;

    // Verifica si el formulario es válido
    if (!this.form.valid) {
      // Si el formulario no es válido, muestra el mensaje de error
      this.toastr.error('Por favor ingrese los campos', 'Campos incompletos', {
        positionClass: 'toast-top-right'  // Ajusta la posición del toast
      });
      return;
    }

    this.authService.signIn(this.payload).subscribe({
      next(response){
        self.router.navigate(["/home"], {queryParams: {signedIn: "true"}});
      },
      complete(){},
      error(error){
        self.toastr.error("Nombre de usuario o contraseña invalida");
        console.log(error)
      }
    });
  }
}
