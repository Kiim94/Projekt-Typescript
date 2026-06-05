import { Component, signal, computed } from '@angular/core';
import { CourseModel } from "../services/data-service";
import { CoursesService } from '../services/courses-service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class ScheduleComponent {
  
  constructor(private coursesService: CoursesService) {}

  get courses(){
    return this.coursesService.savedCourses;
  } 

  //sortering a-ö 
  sortKey = signal<keyof CourseModel>("courseCode");
  sortAsc = signal<boolean>(true);

  //ta bort kurser
  removeCourse(courseCode: string){
    //försäkra om användare vill ta bort
    const isConfirmed = confirm("Är du säker på att du vill ta bort kursen?");
    if(!isConfirmed){
      return;
    }

    this.coursesService.removeCourse(courseCode)
  }

  //sortera med computed
  sortCourses = computed(() => {
    const key = this.sortKey();
    const asc = this.sortAsc();

    return [...this.coursesService.savedCourses()].sort((a, b) => {

      //om man vill sortera efter högskolepoäng
      //måste göras till nummer, om nyckel är points
      if(key === "points"){
        const aNum = Number(a.points);
        const bNum = Number(b.points);
        return asc ? aNum - bNum : bNum - aNum;
      }

      //annars sortera efter text
      const aValue = String(a[key]).toLowerCase();
      const bValue = String(b[key]).toLowerCase();

      if(aValue < bValue) return asc ? -1:1;
      if(aValue > bValue) return asc ? 1:-1;
      return 0;
    })
  })

  //uträkning för totala hp poäng för valda kurser
  totalpoints = computed(() => {
    //reduce() => sammanfattar alla värden till ett enda
    return this.coursesService.savedCourses().reduce((sum, course) => {
      return sum + course.points;
    }, 0);
  })

  sortBy(field: keyof CourseModel){
    if(this.sortKey() === field){
      this.sortAsc.update(v => !v);
    }else{
      this.sortKey.set(field);
      this.sortAsc.set(true);
    }
  }
}
