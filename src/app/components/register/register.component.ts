import { Component } from '@angular/core';
import {AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {map, Observable} from "rxjs";
import {SignUpPayload} from "../../payloads/request/sign-up-ts";
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import {AuthService} from "../../services/auth.service";
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;
  payload: SignUpPayload;
  countries: any[] = [];

  constructor(private http: HttpClient,private router: Router, private toastr: ToastrService, private authService: AuthService) {
    this.form = new FormGroup({
      username: new FormControl("", Validators.required),
      email: new FormControl("", {
        validators: [Validators.required],
        updateOn: "blur"
      }),
      password: new FormControl("", [Validators.required, Validators.minLength(7)]),
      frecuenciavisualizacion: new FormControl("", Validators.required),
      generofavorito: new FormControl("", Validators.required),
      plataformasfavoritas: new FormControl("", Validators.required),
      actorfavorito: new FormControl("", Validators.required),
      age: new FormControl("", Validators.required),
      genre: new FormControl("", Validators.required),
      country: new FormControl("")
    });

    this.payload = {
      username: "",
      email: "",
      password: "",
      frecuenciavisualizacion: "",
      generofavorito: "",
      plataformasfavoritas: "",
      actorfavorito: "",
      age: "2",
      gender: "hombre",
      country: "co"
    }

    this.http.get<any>('https://restcountries.com/v3.1/all')
      .subscribe((data) => {
        this.countries = data.map((country: any) => ({
          name: country.name.common,
          code: country.cca2
        }));
      });;
  }

  signUp() {
    this.payload.username = this.form.get('username')?.value;
    this.payload.email = this.form.get('email')?.value;
    this.payload.password = this.form.get('password')?.value;
    this.payload.frecuenciavisualizacion = this.form.get('frecuenciavisualizacion')?.value;
    this.payload.generofavorito = this.form.get('generofavorito')?.value;
    this.payload.plataformasfavoritas = this.form.get('plataformasfavoritas')?.value;
    this.payload.actorfavorito = this.form.get('actorfavorito')?.value;
    this.payload.age = this.form.get('age')?.value;
    this.payload.gender = this.form.get('genre')?.value;
    this.payload.country = this.form.get('country')?.value;

    // Verifica si el formulario es válido
    if (!this.form.valid) {
      // Si el formulario no es válido, muestra el mensaje de error
      this.toastr.error('Por favor ingrese los campos', 'Campos incompletos', {
        positionClass: 'toast-top-right'  // Ajusta la posición del toast
      });
      return;
    }

    const self = this;

    console.log(this.payload)

    if (this.form.valid) {

      this.authService.signUp(this.form.value).subscribe(
        response => {
          console.log('Registro exitoso', response);
          self.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        },
        error => {
          console.error('Error al registrar', error);
        }
      )
    }
  }

  get email() {
    return this.form.controls['email'];
  }

  get username() {
    return this.form.controls['username'];
  }

}
