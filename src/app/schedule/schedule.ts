import { Component, signal, computed } from '@angular/core';
import { Course } from "../services/course";

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class ScheduleComponent {
  //tom array för alla kurser
  courses = signal<Course[]>([]);

  //sortering a-ö 
  sortKey = signal<keyof Course>("courseCode");
  sortAsc = signal<boolean>(true);

  constructor(){
    const saved = JSON.parse(localStorage.getItem("courses") || "[]");

    this.courses.set(saved);
  }

  //ta bort kurser
  removeCourse(courseCode: string){
    //försäkra om användare vill ta bort
    const isConfirmed = confirm("Är du säker på att du vill ta bort kursen?");
    if(!isConfirmed){
      return;
    }
    //filtrerar bort vald kurs
    const updated = this.courses().filter(c => c.courseCode !== courseCode);
    //uppdaterar signalen så att UI ändras direkt
    this.courses.set(updated);
    //spara uppdaterad lista
    localStorage.setItem("courses", JSON.stringify(updated));
  }

  //sortera med computed
  sortCourses = computed(() => {
    const key = this.sortKey();
    const asc = this.sortAsc();

    return [...this.courses()].sort((a, b) => {

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
    return this.courses().reduce((sum, course) => {
      return sum + course.points;
    }, 0);
  })

  sortBy(field: keyof Course){
    if(this.sortKey() === field){
      this.sortAsc.update(v => !v);
    }else{
      this.sortKey.set(field);
      this.sortAsc.set(true);
    }
  }
}
