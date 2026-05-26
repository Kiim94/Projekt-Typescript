import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from "@angular/router";
import { CoursesComponent } from "./courses/courses"
import { Navbar } from "./navbar/navbar";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CoursesComponent, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('projektuppgift');
}
