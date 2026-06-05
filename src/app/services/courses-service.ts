import { Injectable, signal } from '@angular/core';
import { CourseModel } from "../services/data-service"

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  //signal som kommer innehålla alla sparade kurser
  savedCourses = signal<CourseModel[]>([]);

  constructor(){
    const saved = JSON.parse(localStorage.getItem("courses") || "[]") as CourseModel[];
    this.savedCourses.set(saved);
  }

  addCourse(course: CourseModel): boolean{

    //alla sparade kurser
    const courses = this.savedCourses();

    //variabel: ifall en kurs redan finns med i listan
    const exists = courses.some( c => c.courseCode === course.courseCode);

    if(exists){
      return false;
    }
    //skapa ny array som innehåller gamla kurser + nya. Allt som läggs till
    const updated = [...courses, course];

    //spara array i localstorage
    localStorage.setItem("courses", JSON.stringify(updated));

    //uppdatera signal savedCourses så alla delar av app får det nya värdet
    this.savedCourses.set(updated);
    return true;
  }

  //ta bort kurser
  removeCourse(courseCode: string): void {
    
    //filtrerar bort vald kurs
    const updated = this.savedCourses().filter(c => c.courseCode !== courseCode);
    //uppdaterar signalen så att UI ändras direkt
    this.savedCourses.set(updated);
    //spara uppdaterad lista
    localStorage.setItem("courses", JSON.stringify(updated));
  }
}
