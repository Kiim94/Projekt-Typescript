import { Routes, RouterModule } from '@angular/router';
import { CoursesComponent } from "./courses/courses";
import { ScheduleComponent } from "./schedule/schedule";
import { PageNotFoundComponent } from "./page-not-found/page-not-found";

export const routes: Routes = [
    { path: '', redirectTo: 'courses', pathMatch: 'full' },
    { path: "courses", component: CoursesComponent },
    { path: "schedule", component: ScheduleComponent },
    { path: "**", component: PageNotFoundComponent,},
];
